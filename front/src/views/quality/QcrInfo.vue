<!--QcrInfo.vue-->
<!--품질검사항목 추가 및 수정-->
<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useQuality1Store } from '../../stores/quality1.js';
import axios from 'axios';

import SelectQcrModal from '../../components/quality/modal/SelectQcrModal.vue';
import QcrInfoMain from '../../components/quality/QcrInfoMain.vue';
const qualityStore = useQuality1Store();
const selectedOrders = ref([]); // 모달에서 선택한 지시서 목록

onBeforeMount(async () => {
  await qualityStore.fetchQcrList();
});

//검색
const qcr_code = ref('');
const inspection_item = ref('');
const note = ref('');
const range_top = ref('');
const range_bot = ref('');
const unit = ref('');
const regdate = ref('');
const selectedQcr = ref({ qcr_code: '', inspection_item: '', range_top: '', range_bot: '', note: '', unit: '', regdate: '', check_method: '' });
selectedQcr.value.regdate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;

// 모달 표시 여부
const orderDisplay = ref(false);

// 모달 열기
const openModal = async () => {
  await qualityStore.fetchQcrList();
  orderDisplay.value = true;
};

// 모달 닫기
const closeModal = () => {
  orderDisplay.value = false;
};

// 모달에서 선택된 지시서 받기
const selectedOrder = (orders) => {
  if (!orders || orders.length === 0) return;

  orders.regdate = formatDate(orders.regdate);
  selectedQcr.value = orders;

  console.log('selectedQcr: ', selectedQcr.value);

  selectedOrders.value = orders;

  // 지시코드 InputText용 (표시 목적)
  qcr_code.value = orders.qcr_code;
  inspection_item.value = orders.inspection_item;
  note.value = orders.note;

  orderDisplay.value = false;
};
//코드로 찾기
const search = () => {
  qualityStore.fetchQcrList(qcr_code.value);
};

const formatDate = (date) => {
  if (!date) return '';

  // date가 문자열이면 그냥 slice
  if (typeof date === 'string') {
    return date.slice(0, 10); // YYYY-MM-DD
  }

  // date가 Date 객체라면 로컬 날짜 기준으로 처리
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
};

//검색조건에 따른 목록 필터링
const filteredOrders = computed(() => {
  // 모달에서 선택한 지시서가 있으면 우선 필터링
  if (selectedOrders.value.length > 0) {
    return qualityStore.qiOrderList.filter((o) => codes.includes(o.qcr_code));
  }

  // 일반 검색
  return qualityStore.qcrList.filter((item) => {
    // 코드와 검사유형 조건
    const isCodeMatch = !qcr_code.value || item.qcr_code.includes(qcr_code.value);
    const isTypeMatch = !inspection_item.value || item.inspection_item?.includes(inspection_item.value);

    return isCodeMatch && isTypeMatch;
  });
});

//전체조회 버튼 기능추가
const resetFilters = () => {
  qcr_code.value = '';
  inspection_item.value = '';
  note.value = '';
  range_top.value = '';
  range_bot.value = '';
  unit.value = '';
  regdate.value = '';
};

const modalKey = ref(0);

const fetchAll = async () => {
  resetFilters();
  selectedOrders.value = [];
  modalKey.value++; // 모달 강제 리셋
  await qualityStore.fetchQcrList();
};

// 상세정보보기
const qcrDetail = (data) => {
  data.data.regdate = formatDate(data.data.regdate);
  selectedQcr.value = data.data;

  console.log('selectedQcr: ', selectedQcr.value);
};

// 초기화버튼
const resetQcrForm = async () => {
  selectedQcr.value = { qcr_code: '', inspection_item: '', range_top: '', range_bot: '', note: '', unit: '', regdate: '', check_method: '' };
  selectedQcr.value.regdate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
  qcr_code.value = '';
  inspection_item.value = '';
  note.value = '';
};

// 품질기준정보 등록
const insertQcrForm = async (data) => {
  if (data.inspection_item == '' || data.range_top == '' || data.range_bot == '' || data.unit == '' || data.check_method == '' || note == '') {
    alert('입력을 완료해주세요');
    return;
  }

  console.log(data);

  data = { inspection_item: data.inspection_item, range_top: data.range_top, range_bot: data.range_bot, unit: data.unit, com_value: data.note, regdate: data.regdate, check_method: data.check_method };

  await axios //
    .get('api/quality/qcrcomvalue/' + data.unit)
    .then((res) => {
      data.unit = res.data[0].com_value;
    });

  console.log('전송데이터: ', data);

  await axios //
    .post('api/quality/addqcrform', data)
    .then((res) => {
      if (res.data.affectedRows == 1) {
        alert('등록완료');
      }
      selectedQcr.value = ref({ qcr_code: '', inspection_item: '', range_top: '', range_bot: '', note: '', unit: '', regdate: '', check_method: '' });
      resetQcrForm();
    });
  await qualityStore.fetchQcrList();
};

// 품질기준정보 수정
const updateQcrForm = async (data) => {
  if (data.inspection_item == '' || data.range_top == '' || data.range_bot == '' || data.unit == '' || data.check_method == '' || note == '') {
    alert('입력을 완료해주세요');
    return;
  }
  data.regdate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
  data = { qcr_code: data.qcr_code, inspection_item: data.inspection_item, range_top: data.range_top, range_bot: data.range_bot, unit: data.unit_type, com_value: data.note, regdate: data.regdate, check_method: data.check_method };
  console.log('수정정보: ', data);

  await axios //
    .put('api/quality/modifyqcrinfo', data)
    .then((res) => {
      console.log(res.data);
      if (res.data.affectedRows == 1) {
        alert('수정완료');
      }
      selectedQcr.value = ref({ qcr_code: '', inspection_item: '', range_top: '', range_bot: '', note: '', unit: '', regdate: '', check_method: '' });
      resetQcrForm();
    });
  await qualityStore.fetchQcrList();
};

// 품질기준정보 삭제
const delQcrForm = async (data) => {
  console.log(data);
  if (!confirm('정말 삭제하시겠습니까?')) {
    return;
  }

  await axios //
    .delete('/api/quality/delqcrinfo/' + data)
    .then((res) => {
      if (res.data.affectedRows == 1) {
        alert('삭제완료');
        selectedQcr.value = ref({ qcr_code: '', inspection_item: '', range_top: '', range_bot: '', note: '', unit: '', regdate: '', check_method: '' });
        resetQcrForm();
      }
    });
  await qualityStore.fetchQcrList();
};
</script>

<!---->

<template>
  <div class="card border border-gray-200 flex flex-col gap-3 p-fluid">
    <!--모달창-->
    <SelectQcrModal :key="modalKey" :display="orderDisplay" :qcr-list="qualityStore.qcrList" @close="closeModal" @selected-order="selectedOrder" />
    <!------------------------------------------------------------------------------------------------->
    <!-- 검색이 되어야 하는 창-->
    <div class="text-2xl font-bold text-center">품질 검사 기준</div>

    <!-- 검색 조건 영역 -->
    <div class="grid grid-cols-3 gap-6">
      <!-- 지시코드 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">품질기준코드</label>
        <InputText v-model="qcr_code" placeholder="품질기준코드 선택" class="w-full cursor-pointer" />
      </div>
      <!-- 검사유형 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">검사항목명</label>
        <InputText v-model="inspection_item" placeholder="검사항목명 검색" class="w-full" />
      </div>
      <!-- 제품코드 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">품목유형</label>
        <InputText v-model="note" placeholder="품목유형 검색" class="w-full" />
      </div>
    </div>

    <!-- 버튼 영역 -->
    <div class="flex items-center justify-between mt-2">
      <!-- 왼쪽 영역 -->
      <div class="flex gap-4">
        <Button label="전체조회" severity="contrast" @click="fetchAll" />
        <!--전체를 누르면 전체의 지시코드가 생김-->
      </div>
      <Button label="검사항목 선택" severity="info" @click="openModal" />
    </div>
  </div>
  <div class="grid grid-cols-12 gap-8">
    <section class="col-span-7 flex-1 bg-white px-6 pt-5 pb-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
      <div class="flex justify-between items-center mb-2">
        <div class="text-s text-gray-800">
          검색결과
          <span class="text-orange-500 font-bold">{{ filteredOrders.length }}</span> 건
        </div>
      </div>
      <!------------------------------------------------------------------------------------------------->

      <!--수정해야함-->
      <div class="flex-1 overflow-auto rounded-lg border border-gray-200">
        <DataTable :value="filteredOrders" rowHover class="hover-table" scrollable scrollHeight="900px" @row-click="qcrDetail">
          <template #empty>
            <div class="text-center py-6 text-gray-400">데이터 없음</div>
          </template>

          <Column header="품질기준코드" field="qcr_code" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 10rem" />

          <Column header="검사항목" field="inspection_item" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 10rem" />
          <Column header="검사대상" field="note" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 8rem" />
          <Column header="상한" field="range_top" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 6rem" />
          <Column header="하한" field="range_bot" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 6rem" />
          <Column header="단위" field="unit" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 6rem" />
          <Column field="regdate" header="등록일자" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 8rem">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.regdate) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </section>
    <div class="col-span-5 flex-1 bg-white rounded-xl border border-gray-200 flex flex-col">
      <QcrInfoMain :selected-qcr="selectedQcr" :key="selectedQcr" @insert-qcr-form="insertQcrForm" @update-qcr-form="updateQcrForm" @del-qcr-form="delQcrForm" @reset-qcr-form="resetQcrForm"></QcrInfoMain>
    </div>
  </div>
</template>
<style scoped>
/* hover 시 텍스트 살짝 강조 */
.hover-table :deep(.p-datatable-tbody > tr:hover td) {
  font-weight: 500;
}
</style>
