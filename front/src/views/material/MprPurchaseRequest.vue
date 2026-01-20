<script setup>
import { ref, onMounted, watch } from 'vue';
import { useMaterialStore } from '@/stores/material2';
import axios from 'axios';
import MprRequestHeader from '@/components/material/MprRequestHeader.vue';
import MprRequestItem from '@/components/material/MprRequestItem.vue';
import SelectModal from '@/components/material/modal/SelectModal.vue';
// import SelectEmployeeModal from '@/components/material/modal/SelectEmployeeModal.vue';
// import SelectMaterialModal from '@/components/material/modal/SelectMaterialModal.vue';

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
    reqQtt: null, // 요청수량
    unitCode: '', // 단위(DB 저장용)
    unitLabel: '', // 단위(프론트 표시용)
    note: '', // 비고
    matSup: '', // 공급업체 코드(DB 저장용)
    clientName: '', // 공급업체 이름(프론트 표시용)
    matCode: '' // 자재 코드
  }
]);

// 자재 단위 매핑
const UNIT_MAP = {
  h1: { label: 'kg' },
  h2: { label: 't' },
  h3: { label: 'L' },
  h4: { label: 'ea' },
  h5: { label: 'box' },
  h6: { label: 'g' },
  h7: { label: 'mm' },
  h8: { label: '%' },
  h9: { label: 'cm' },
  ha: { label: 'N' }
};

//AutoComplete 관련
const mrpList = ref([]);
const selectedMrpValue = ref(null);
const mrpFilteredValue = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get('/api/material/next-code');
    requestInfo.value.mprCode = response.data.mprCode;

    // mrp 목록 불러오기
    mrpList.value = await store.fetchMrpCode();
  } catch (err) {
    console.error('요청번호 조회 실패', err);
  }
});

// 모달 관련
const showWriterModal = ref(false);
const showMaterialModal = ref(false);

// 선택된 작성자 input에 넣기
const selectWriter = (emp) => {
  requestInfo.value.mCode = emp.emp_code; // DB 저장용
  requestInfo.value.writer = emp.emp_name;
  requestInfo.value.department = emp.dept_name;
};

// 선택된 자재 input에 넣기
const selectMaterial = (mat) => {
  if (!selectedRow.value) return;

  const unit = UNIT_MAP[mat.unit];

  selectedRow.value.materialName = mat.mat_name;
  selectedRow.value.unitCode = mat.unit;
  selectedRow.value.unitLabel = unit?.label ?? '';
  selectedRow.value.clientName = mat.client_name;
  selectedRow.value.matSup = mat.client_code;
  selectedRow.value.matCode = mat.mat_code;

  showMaterialModal.value = false;
  selectedRow.value = null;
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
  mprDCode: '',
  materialName: '',
  reqQtt: null,
  unitCode: '',
  unitLabel: '',
  note: '',
  matSup: '',
  clientName: '',
  matCode: ''
});

// AutoComplete 검색 함수
const searchMrp = (event) => {
  if (!event.query.trim().length) {
    mrpFilteredValue.value = [...mrpList.value];
  } else {
    mrpFilteredValue.value = mrpList.value.filter((m) => m.mrp_code.toLowerCase().startsWith(event.query.toLowerCase()));
  }
};

// AutoComplete 선택 결과 반영
watch(selectedMrpValue, (v) => {
  requestInfo.value.mrpCode = v ? v.mrp_code : null;
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
};

// 초기화 버튼
const reset = () => doReset(true);

// 저장
const save = async () => {
  if (!requestInfo.value.mCode) {
    alert('작성자를 선택하세요');
    return;
  }

  if (!requestInfo.value.deadline) {
    alert('납기일자를 입력하세요');
    return;
  }

  const validItems = requestDetailInfo.value.filter((mat) => mat.matCode);

  if (validItems.length === 0) {
    alert('자재를 한 개 이상 선택하세요');
    return;
  }

  for (const mat of validItems) {
    if (!mat.reqQtt || mat.reqQtt <= 0) {
      alert('요청수량을 입력하세요');
      return;
    }
    if (!mat.matSup) {
      alert('공급업체가 없습니다');
      return;
    }
  }

  const payload = {
    request: {
      reqDate: formatDate(requestInfo.value.reqDate),
      deadline: formatDate(requestInfo.value.deadline),
      mrpCode: requestInfo.value.mrpCode,
      mCode: requestInfo.value.mCode
    },
    requestDetail: validItems.map((mat) => ({
      reqQtt: mat.reqQtt,
      unitCode: mat.unitCode,
      note: mat.note,
      matSup: mat.matSup,
      matCode: mat.matCode
    }))
  };

  try {
    await store.insertMpr(payload);
    alert('자재구매요청이 저장되었습니다');

    await doReset(false);
  } catch (err) {
    console.error(err);
    alert('저장 중 오류가 발생했습니다');
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
      @select-employee="showWriterModal = true"
      @save="save"
      @reset="reset"
    />
    <MprRequestItem v-model="requestDetailInfo" @selected-material="(row) => openMaterialModal(row)" />
  </div>
  <!-- <SelectEmployeeModal v-model:visible="showWriterModal" @select="selectWriter" />
  <SelectMaterialModal v-model:visible="showMaterialModal" @select="selectMaterial" /> -->
  <SelectModal v-model:visible="showWriterModal" type="employee" @select="selectWriter" />
  <SelectModal v-model:visible="showMaterialModal" type="material" @select="selectMaterial" />
</template>
