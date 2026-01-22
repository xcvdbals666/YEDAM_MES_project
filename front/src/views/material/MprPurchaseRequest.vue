<script setup>
import { ref, onMounted, watch } from 'vue';
import { useMaterialStore } from '@/stores/material2';
import axios from 'axios';
import MprRequestHeader from '@/components/material/MprRequestHeader.vue';
import MprRequestItem from '@/components/material/MprRequestItem.vue';
import SelectModal from '@/components/material/modal/SelectModal.vue';

const store = useMaterialStore();

// 날짜 포맷
const formatDate = (v) => {
  const d = new Date(v);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// 요청 정보
const requestInfo = ref({
  mprCode: '', // 요청코드
  writer: '', // 작성자(프론트 표시용)
  mCode: '', // 작성자코드(DB 저장용)
  mrpCode: null, // MRP 계획번호 일단 NULL
  department: '', // 부서이름(프론트 표시용)
  deadline: null, // 납부일자
  reqDate: formatDate(new Date()) // 요청일자
});

// 요청 상세 정보
const selectedRow = ref(null);
const requestDetailInfo = ref([
  {
    mprDCode: '', // 요청상세코드
    materialName: '', // 자재 이름
    curQtt: null, // 현재고
    lackQtt: null, // 부족수량
    reqQtt: null, // 요청수량
    unitCode: '', // 단위(DB 저장용)
    unitLabel: '', // 단위(프론트 표시용)
    note: '', // 비고
    matSup: '', // 공급업체 코드(DB 저장용)
    clientName: '', // 공급업체 이름(프론트 표시용)
    matCode: '' // 자재 코드
  }
]);

const isEditMode = ref(false); // 수정 모드인지
const isEditable = ref(true); // 수정 or 삭제 가능한지

//AutoComplete 관련
const mrpCode = ref([]);
const selectedMrpValue = ref(null);
const mrpFilteredValue = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get('/api/material/next-code');
    requestInfo.value.mprCode = response.data.mprCode;

    // mrp 목록 불러오기
    mrpCode.value = await store.fetchMrpCode();
  } catch (err) {
    console.error('요청번호 조회 실패', err);
  }
});

// 모달 관련
const showWriterModal = ref(false);
const showMaterialModal = ref(false);
const showMprModal = ref(false);

// 선택된 작성자 input에 넣기
const selectWriter = (e) => {
  requestInfo.value.mCode = e.emp_code; // DB 저장용
  requestInfo.value.writer = e.emp_name;
  requestInfo.value.department = e.dept_name;
};

// 선택된 자재 input에 넣기
const selectMaterial = (m) => {
  if (!selectedRow.value) return;
  console.log('received material:', m);
  const idx = requestDetailInfo.value.findIndex((r) => r.__key === selectedRow.value.__key);

  if (idx !== -1) {
    const row = requestDetailInfo.value[idx];
    row.materialName = m.mat_name;
    row.curQtt = m.current_qty;
    row.lackQtt = m.lack_qty;
    row.unitCode = m.unit;
    row.unitLabel = m.unit_label;
    row.clientName = m.client_name;
    row.matSup = m.client_code;
    row.matCode = m.mat_code;
  }

  showMaterialModal.value = false;
  selectedRow.value = null;
};

// 선택된 Mpr input에 넣기
const selectMpr = async (mprCode) => {
  try {
    console.log('선택한 mprCode:', mprCode);
    // 헤더 조회
    const header = await store.fetchMprHeader(mprCode);
    console.log('header:', header);

    // response.data 가 배열이면 [0] 써야 함
    const h = Array.isArray(header) ? header[0] : header;

    requestInfo.value.mprCode = h.mpr_code;
    requestInfo.value.reqDate = formatDate(h.reqdate);
    requestInfo.value.deadline = formatDate(h.deadline);
    requestInfo.value.mrpCode = h.mrp_code;

    if (h.mrp_code) {
      selectedMrpValue.value = {
        mrp_code: h.mrp_code
      };
    }
    requestInfo.value.writer = h.emp_name;
    requestInfo.value.mCode = h.mcode;
    requestInfo.value.department = h.dept_name;

    // 재고 조회
    const items = await store.fetchDetailItem(mprCode);
    console.log('items:', items);

    requestDetailInfo.value = items.map((d) => ({
      __key: `${d.mpr_d_code}-${Math.random()}`,
      sourceType: 'manual',
      is_deleted: false,
      mprDCode: d.mpr_d_code,
      materialName: d.mat_name,
      curQtt: d.current_qty,
      lackQtt: d.req_lack_qty,
      reqQtt: d.req_qtt,
      unitCode: d.unit,
      unitLabel: d.unit_label,
      note: d.note,
      matSup: d.mat_sup || d.client_code,
      clientName: d.client_name,
      matCode: d.mat_code
    }));

    showMprModal.value = false;
    isEditMode.value = true;
    isEditable.value = await store.checkEditable(mprCode);
  } catch (e) {
    console.error(e);
    alert('MPR 불러오기 실패');
  }
};

// 초기화
const initialRequestInfo = () => ({
  mprCode: '',
  writer: '',
  mCode: '',
  mrpCode: null,
  department: '',
  deadline: null,
  reqDate: formatDate(new Date())
});

const initialDetailRow = () => ({
  __key: Date.now() + Math.random(),
  sourceType: 'manual',
  is_deleted: false,
  mprDCode: null,
  materialName: '',
  reqQtt: null,
  unitCode: '',
  unitLabel: '',
  note: '',
  matSup: null,
  clientName: '',
  matCode: ''
});

// AutoComplete 검색 함수
const searchMrp = (event) => {
  if (!event.query.trim().length) {
    mrpFilteredValue.value = [...mrpCode.value];
  } else {
    mrpFilteredValue.value = mrpCode.value.filter((m) => m.mrp_code.toLowerCase().startsWith(event.query.toLowerCase()));
  }
};

// AutoComplete 선택 결과 반영 -> MRP 반영
watch(selectedMrpValue, async (val) => {
  if (isEditMode.value) return;
  if (!val) {
    requestInfo.value.mrpCode = null;
    return;
  }

  requestInfo.value.mrpCode = val.mrp_code;

  //MRP 자재 조회
  const mrpItems = await store.fetchMrpList(val.mrp_code);

  requestDetailInfo.value = mrpItems.map((d2) => ({
    __key: `${d2.mat_code}-${Math.random()}`,
    sourceType: 'mrp',
    mprDCode: null, // 아직 구매요청 아님
    is_deleted: false,
    materialName: d2.mat_name,
    curQtt: d2.current_qty,
    lackQtt: d2.lack_qty,
    reqQtt: d2.req_qtt,
    unitCode: d2.unit,
    unitLabel: d2.unit_label,
    note: d2.mrp_note,
    matSup: d2.client_code,
    clientName: d2.client_name,
    matCode: d2.mat_code
  }));
});

// 자재 선택 모달 열렸을 때 값 세팅
const openMaterialModal = (row) => {
  selectedRow.value = row;
  showMaterialModal.value = true;
};

// 초기화
const doReset = async (askConfirm = true) => {
  if (askConfirm) {
    if (!confirm('입력한 검색 조건을 모두 초기화하시겠습니까?')) return;
  }

  requestInfo.value = initialRequestInfo();
  selectedMrpValue.value = null;

  const response = await axios.get('/api/material/next-code');
  requestInfo.value.mprCode = response.data.mprCode;

  requestDetailInfo.value = [initialDetailRow()];

  isEditMode.value = false;
  isEditable.value = true;
};

// 초기화 버튼
const reset = () => doReset(true);

// 저장
const isSaved = ref(false);
const save = async () => {
  if (isSaved.value) return; // 중복 저장 차단

  if (!requestInfo.value.mCode) {
    alert('작성자를 선택하세요');
    return;
  }

  if (!requestInfo.value.deadline) {
    alert('납기일자를 입력하세요');
    return;
  }

  const validItems = requestDetailInfo.value.filter((m) => !m.is_deleted && m.matCode);

  console.log(
    validItems.map((v) => ({
      matCode: v.matCode,
      matSup: v.matSup,
      clientName: v.clientName
    }))
  );

  if (validItems.length === 0) {
    alert('자재를 한 개 이상 선택하세요');
    return;
  }

  for (const mat of validItems) {
    if (!mat.reqQtt || mat.reqQtt <= 0) {
      alert('요청수량을 입력하세요');
      return;
    }
    if (mat.matCode && mat.matSup == null) {
      alert('공급업체가 없습니다');
      return;
    }
  }
  const payload = {
    request: {
      mprCode: isEditMode.value ? requestInfo.value.mprCode : null, // 신규인지 수정인지
      reqDate: formatDate(requestInfo.value.reqDate),
      deadline: formatDate(requestInfo.value.deadline),
      mrpCode: requestInfo.value.mrpCode,
      mCode: requestInfo.value.mCode
    },
    requestDetail: validItems.map((val) => ({
      mprDCode: val.mprDCode || null, // 신규인지 수정인지
      is_deleted: val.is_deleted || false, //삭제 플래그
      reqQtt: val.reqQtt,
      unitCode: val.unitCode,
      note: val.note,
      matSup: val.matSup,
      matCode: val.matCode
    }))
  };

  isSaved.value = true;
  try {
    await store.insertMpr(payload);
    alert('자재구매요청이 저장되었습니다');

    await doReset(false);
  } catch (err) {
    console.error(err);
    alert('저장 중 오류가 발생했습니다');
  } finally {
    isSaved.value = false;
  }
};

watch(isEditable, (val) => {
  if (!val) {
    alert('발주가 진행된 구매요청은 수정할 수 없습니다.');
  }
});
</script>

<template>
  <div>
    <MprRequestHeader
      v-model="requestInfo"
      :selectedMrpValue="selectedMrpValue"
      :mrpFilteredValue="mrpFilteredValue"
      @update:selectedMrpValue="selectedMrpValue = $event"
      @search-mrp="searchMrp"
      @open-mpr="showMprModal = true"
      @select-employee="showWriterModal = true"
      :isSaved="isSaved"
      :isEditable="isEditable"
      @save="save"
      @reset="reset"
    />
    <MprRequestItem v-model="requestDetailInfo" :isEditable="isEditable" :isEditMode="isEditMode" @selecte-material="(row) => openMaterialModal(row)" />
  </div>
  <SelectModal v-model:visible="showWriterModal" type="employee" @select="selectWriter" />
  <SelectModal v-model:visible="showMaterialModal" type="material" @select="selectMaterial" />
  <SelectModal v-model:visible="showMprModal" type="mpr" @select="selectMpr" />
</template>
