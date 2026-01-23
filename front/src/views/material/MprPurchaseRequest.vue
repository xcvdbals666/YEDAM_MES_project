<script setup>
import { ref, onMounted, watch, computed } from 'vue';
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
    __key: Date.now() + Math.random(),
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

// 선택된 MPR(자재구매요청서) 불러오기
const selectMpr = async (mprCode) => {
  try {
    console.log('선택한 mprCode:', mprCode);
    isEditMode.value = true;

    /*
      1. MPR 헤더 조회 - 구매요청서 기본 정보 (작성자, 납기일, 참조 MRP 등)
    */
    const header = await store.fetchMprHeader(mprCode);
    const h = Array.isArray(header) ? header[0] : header;

    // MPR 기본 정보 세팅
    requestInfo.value.mprCode = h.mpr_code;
    requestInfo.value.reqDate = formatDate(h.reqdate);
    requestInfo.value.deadline = formatDate(h.deadline);
    requestInfo.value.mrpCode = h.mrp_code;
    requestInfo.value.writer = h.emp_name;
    requestInfo.value.mCode = h.mcode;
    requestInfo.value.department = h.dept_name;

    /*
      selectedMrpValue 세팅
      - 수정 모드에서도 MRP 참조 정보는 표시용으로 유지
      - watch(selectedMrpValue)에서 isEditMode로 가드됨
    */
    selectedMrpValue.value = h.mrp_code ? { mrp_code: h.mrp_code } : null;

    /*
      2. MPR 상세 조회
      - 이미 저장된 구매요청 자재 목록
    */
    const items = await store.fetchDetailItem(mprCode);
    console.log('items:', items);

    /*
      3. MPR 상세 + sourceType 구분
      - MRP 기준 자재  : sourceType = 'mrp'   (읽기 전용, 저장 대상 아님)
      - 수동 추가 자재 : sourceType = 'manual' (수정/삭제/저장 대상)
    */
    requestDetailInfo.value = items.map((d) => ({
      __key: `${d.mpr_d_code}-${Math.random()}`,
      sourceType: d.source_type,
      is_deleted: false,

      // MPR 상세 식별자
      mprDCode: d.mpr_d_code,
      // 자재 정보
      materialName: d.mat_name,
      matCode: d.mat_code,
      matSup: d.client_code,
      clientName: d.client_name,
      // 수량 / 단위
      curQtt: d.current_qty,
      lackQtt: d.req_lack_qty,
      reqQtt: d.req_qtt,
      unitCode: d.unit,
      unitLabel: d.unit_label,
      // 비고
      note: d.note
    }));

    // 수정 모드 진입
    showMprModal.value = false;

    // 발주 진행 여부에 따라 수정 가능 여부 판단
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

  const mrpRows = mrpItems.map((d2) => ({
    __key: `${d2.mat_code}-${Math.random()}`,
    sourceType: 'mrp',
    mprDCode: null,
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

  const manualRows = requestDetailInfo.value.filter((r) => r.sourceType !== 'mrp');

  requestDetailInfo.value = [...mrpRows, ...manualRows];
});

const canSelectMrp = computed(() => {
  // 수정 모드면 무조건 MRP 선택 불가
  if (isEditMode.value) return false;
  return true;
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

  // 1. 먼저 모드 초기화
  isEditMode.value = false;
  isEditable.value = true;

  // 2. 데이터 초기화
  requestInfo.value = initialRequestInfo();
  selectedMrpValue.value = null;

  const response = await axios.get('/api/material/next-code');
  requestInfo.value.mprCode = response.data.mprCode;

  requestDetailInfo.value = [initialDetailRow()];
};

// 초기화 버튼
const reset = () => doReset(true);

// 저장 및 수정
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

  const validItems = requestDetailInfo.value.filter((m) => m.matCode);
  const aliveItems = validItems.filter((m) => !m.is_deleted);

  if (aliveItems.length === 0) {
    alert('자재를 한 개 이상 선택하세요');
    return;
  }

  console.log(
    validItems.map((v) => ({
      matCode: v.matCode,
      matSup: v.matSup,
      clientName: v.clientName
    }))
  );

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
    requestDetail: requestDetailInfo.value
      .filter((v) => v.matCode) // 자재 있는 것만
      .map((v) => ({
        mprDCode: v.mprDCode,
        is_deleted: v.is_deleted || false,
        sourceType: v.sourceType,
        reqQtt: v.reqQtt,
        unitCode: v.unitCode,
        note: v.note,
        matSup: v.matSup,
        matCode: v.matCode
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
    alert('발주가 진행된 구매요청은 수정 및 삭제할 수 없습니다.');
  }
});

const deleteMpr = async () => {
  if (!requestInfo.value.mprCode) return;
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    await store.deleteMpr(requestInfo.value.mprCode);

    alert('삭제되었습니다.');

    // 화면 초기화 (신규 상태로)
    await doReset(false);
  } catch (err) {
    alert(err.response?.data?.message || '삭제 중 오류 발생');
  }
};
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
      :canSelectMrp="canSelectMrp"
      @select-employee="showWriterModal = true"
      :isSaved="isSaved"
      :isEditable="isEditable"
      :isEditMode="isEditMode"
      @save="save"
      @delete="deleteMpr"
      @reset="reset"
    />
    <MprRequestItem v-model="requestDetailInfo" :isEditable="isEditable" :isEditMode="isEditMode" @selecte-material="(row) => openMaterialModal(row)" />
  </div>
  <SelectModal v-model:visible="showWriterModal" type="employee" @select="selectWriter" />
  <SelectModal v-model:visible="showMaterialModal" type="material" @select="selectMaterial" />
  <SelectModal v-model:visible="showMprModal" type="mpr" @select="selectMpr" />
</template>
