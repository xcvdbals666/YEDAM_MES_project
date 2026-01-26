<!--QiOrderList.vue-->
<!--품질검사 지시 목록조회-->
<script setup>

import { ref, computed, onMounted } from 'vue';
import { useQualityStore2 } from '@/stores/quality2.js';

import SelectQiOrderModal2 from '@/components/quality/modal/SelectQiOrderModal2.vue';
const qualityStore = useQualityStore2();
const selectedOrders = ref([]); // 모달에서 선택한 지시서 목록

//검색
const qio_code = ref('');
const qio_date = ref('');
const inspect_type = ref('');
const mat_name = ref('');
const qio_status = ref('');
const insp_date = ref('');

// 모달 표시 여부
const orderDisplay = ref(false);

// 모달 열기
const openModal = async () => {
  await qualityStore.fetchQiOrderList();
  orderDisplay.value = true;
};

// 모달 닫기
const closeModal = () => {
  orderDisplay.value = false;
};

// 모달에서 선택된 지시서 받기
const selectedOrder = (orders) => {
  if (!orders || orders.length === 0) return;

  selectedOrders.value = orders;

  // 지시코드 InputText용 (표시 목적)
  qio_code.value = orders.map((o) => o.qio_code).join(', ');
  orderDisplay.value = false;
};
//코드로 찾기
const search = () => {
  qualityStore.fetchQiOrderList(qio_code.value);
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
  let list = [];

  // 모달 선택 우선
  if (selectedOrders.value.length > 0) {
    const codes = selectedOrders.value.map(o => o.qio_code);
    list = qualityStore.qiOrderList.filter(o => codes.includes(o.qio_code));
  } 
  // 일반 검색
  else {
    list = qualityStore.qiOrderList.filter((item) => {
      const isCodeMatch = !qio_code.value || item.qio_code.includes(qio_code.value);
      const isTypeMatch = !inspect_type.value || item.inspect_type?.includes(inspect_type.value);

      const itemStartDate = item.qio_date
        ? new Date(item.qio_date).toISOString().slice(0, 10)
        : null;

      const isStartDateMatch =
        !qio_date.value ||
        (itemStartDate &&
          itemStartDate >= new Date(qio_date.value).toISOString().slice(0, 10));

      const itemEndDate = item.insp_date
        ? new Date(item.insp_date).toISOString().slice(0, 10)
        : null;

      const isEndDateMatch =
        !insp_date.value ||
        (itemEndDate &&
          itemEndDate === new Date(insp_date.value).toISOString().slice(0, 10));

      return isCodeMatch && isTypeMatch && isStartDateMatch && isEndDateMatch;
    });
  }

// filteredOrders 내의 return 부분을 이 코드로 교체
return [...list].sort((a, b) => {
  // 1. 날짜를 타임스탬프(숫자)로 변환하여 정확히 비교
  const timeA = a.qio_date ? new Date(a.qio_date).getTime() : 0;
  const timeB = b.qio_date ? new Date(b.qio_date).getTime() : 0;

  if (timeB !== timeA) {
    return timeB - timeA; // 숫자 비교 (내림차순)
  }

  // 2. 날짜가 완벽히 같다면 문자열인 지시코드(qio_code)로 2차 비교
  const codeA = String(a.qio_code || '');
  const codeB = String(b.qio_code || '');
  return codeB.localeCompare(codeA, undefined, { numeric: true });
});
});

//전체조회 버튼 기능추가
const resetFilters = () => {
  qio_code.value = '';
  qio_date.value = '';
  insp_date.value = '';
  inspect_type.value = '';
  mat_name.value = '';
  qio_status.value = '';
};

const modalKey = ref(0);

const fetchAll = async () => {
  resetFilters();
  selectedOrders.value = [];
  modalKey.value++; // 모달 강제 리셋
  await qualityStore.fetchQiOrderList();
};
</script>

<!---->

<template>
  <div class="card border border-gray-200 flex flex-col gap-6 p-fluid">
    <!--모달창-->
<SelectQiOrderModal2
  :visible="orderDisplay"
  :qi-order-list="qualityStore.qiOrderList"
  @update:visible="orderDisplay = $event"
  @selected-order="selectedOrder"
/>    <!------------------------------------------------------------------------------------------------->
    <!-- 검색이 되어야 하는 창-->
    <div class="text-2xl font-bold text-center">품질 검사 목록 조회</div>

    <!-- 검색 조건 영역 -->
    <div class="grid grid-cols-4 gap-6">
      <!-- 지시코드 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">지시코드</label>
        <InputText v-model="qio_code" placeholder="지시코드 검색" class="w-full cursor-pointer" />
      </div>
      <!-- 검사유형 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">검사유형</label>
        <InputText v-model="inspect_type" placeholder="검사유형 검색" class="w-full" />
      </div>

      <!-- 시작일 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">지시일자 - 시작일</label>
        <DatePicker v-model="qio_date" class="w-full" inputClass="w-full" showIcon showButtonBar appendTo="body" placeholder="시작일" />
      </div>

      <!-- 종료일 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">완료일자 - 종료일</label>
        <DatePicker v-model="insp_date" class="w-full" inputClass="w-full" showIcon showButtonBar appendTo="body" placeholder="종료일" />
      </div>
    </div>

    <!-- 버튼 영역 -->
    <div class="flex items-center justify-between mt-2">
      <!-- 왼쪽 영역 -->
      <div class="flex gap-4">
        <Button label="전체조회" severity="" @click="fetchAll" />
        <!--전체를 누르면 전체의 지시코드가 생김-->
      </div>
      <Button label="지시서 선택" severity="info" @click="openModal" />
    </div>
  </div>

  <section class="flex-1 bg-white px-6 pt-5 pb-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
    <div class="flex justify-between items-center mb-2">
      <div class="text-s text-gray-800">
        검색결과
        <span class="text-orange-500 font-bold">{{ filteredOrders.length }}</span> 건
      </div>
    </div>
    <!------------------------------------------------------------------------------------------------->

    <!--수정해야함-->

    <div class="flex-1 overflow-auto rounded-lg border border-gray-200">
<DataTable :value="filteredOrders" :key="filteredOrders.length">

        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>

        <Column selectionMode="multiple" headerStyle="width:48px" />
        <Column header="지시코드" field="qio_code" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 10rem" />
        <Column field="qio_date" header="지시일자" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 6rem">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.qio_date) }}
          </template>
        </Column>

        <Column header="완료일자" field="insp_date" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 6rem">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.insp_date) }}
          </template>
        </Column>
        <Column header="검사유형" field="inspect_type" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 6rem" />
        <Column header="제품명" field="mat_name" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 12rem" />
        <Column header="상태" field="qio_status" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 1rem" />
      </DataTable>
    </div>
  </section>
</template>
<style scoped>
/* hover 시 텍스트 살짝 강조 */
.hover-table :deep(.p-datatable-tbody > tr:hover td) {
  font-weight: 500;
}
</style>
