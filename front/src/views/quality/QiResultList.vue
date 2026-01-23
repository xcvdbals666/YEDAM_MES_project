<!--QiResultList.vue-->
<!--품질검사 결과 목록조회-->

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQualityStore2 } from '@/stores/quality2.js';

const qualityStore = useQualityStore2();
const selectedResults = ref([]);

//검색창 입력부분
const qir_code = ref(''); //검사결과 코드
const qcr_code = ref(''); //검사지시 항목 코드
const inspection_item = ref(''); //검사항목
const com_value = ref(''); //품목명
const result = ref(''); //결과
const end_date = ref(''); //검사일자
const qir_emp_code = ref(''); //검사자

const dropdownValues = ref([
  { name: '전체', code: '' },
  { name: '완제품', code: 'i1' },
  { name: '반제품(값 없음)', code: 'i2' },
  { name: '부자재', code: 'i3' },
  { name: '원자재', code: 'i4' }
]);
const dropdownValue = ref(dropdownValues.value[0]);

const dropdownValues2 = ref([
  { name: '전체', code: '' },
  { name: '완제품', code: 'i1' },
  { name: '반제품(값 없음)', code: 'i2' },
  { name: '부자재', code: 'i3' },
  { name: '원자재', code: 'i4' }
]);
const dropdownValue2 = ref(dropdownValues.value[0]);

//코드로 찾기
const search = () => {
  qualityStore.fetchQiResultList(qir_code.value);
};

// 날짜 포맷 함수 (YYYY-MM-DD)
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
};

//검색조건에 따른 목록 필터링
const filteredResults = computed(() => {
  return qualityStore.qiResultList.filter((item) => {
    const isCodeMatch = !qir_code.value || item.qir_code?.includes(qir_code.value);

    const isInspectionMatch = !inspection_item.value || item.inspection_item?.includes(inspection_item.value);

    // 드롭다운 품목명 필터
    const isDropdownMatch = !dropdownValue.value?.code || item.com_value === dropdownValue.value.name;

    const itemEndDate = item.end_date ? new Date(item.end_date).toISOString().slice(0, 10) : null;

    const isEndDateMatch = !end_date.value || (itemEndDate && itemEndDate === new Date(end_date.value).toISOString().slice(0, 10));

    return isCodeMatch && isInspectionMatch && isDropdownMatch && isEndDateMatch;
  });
});
</script>

<!---->

<template>
  <div class="card border border-gray-200 flex flex-col gap-6 p-fluid">
    <!--모달창-->
    <!-- <SelectQiOrderModal2 :display="orderDisplay" :qi-order-list="qualityStore.qiOrderList" @close="closeModal" @selected-order="selectedOrder" /> -->
    <!------------------------------------------------------------------------------------------------->
    <!-- 검색이 되어야 하는 창-->
    <div class="text-2xl font-bold text-center">품질 검사 결과 목록 조회</div>
    <div class="text-2xl font-bold text-center">qcr_tbl기준으로 출력되어야 함</div>

    <!-- 검색 조건 영역 -->
    <div class="grid grid-cols-3 gap-6">
      <!-- 검사코드 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">검사코드</label>
        <InputText v-model="qir_code" placeholder="QIR-뒤의 번호 입력" class="w-full cursor-pointer" />
      </div>

      <!-- 검사항목 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">검사항목</label>
        <InputText v-model="inspection_item" placeholder="검사항목 검색" class="w-full" />
      </div>

      <!-- 품목명
      <div class="flex flex-col gap-2">
        <label class="font-semibold">품목명</label>
        <InputText v-model="com_value" placeholder="품목명 검색" class="w-full" />
      </div> -->

      <div class="flex flex-col gap-2">
        <div class="font-semibold">품목명</div>
        <Select v-model="dropdownValue" :options="dropdownValues" optionLabel="name" placeholder="품목명 검색" />
      </div>

      <!-- 결과 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">결과</label>
        <InputText v-model="result" placeholder="합격/불합격/미검사" class="w-full" />
      </div>

      <!-- 종료일 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">검사일자 - 종료일</label>
        <DatePicker v-model="end_date" class="w-full" inputClass="w-full" showIcon showButtonBar appendTo="body" placeholder="종료일" />
      </div>
    </div>

    <!-- 버튼 영역 -->
    <div class="flex items-center justify-between mt-2">
      <!-- 왼쪽 영역 -->
      <div class="flex gap-4">
        <Button label="전체조회" severity="contrast" @click="search" />
        <!--전체를 누르면 전체의 지시코드가 생김-->
        <Button label="검색조회" severity="warn" @click="search" />
      </div>
      <!-- <Button label="검사결과 선택" severity="" @click="openModal" /> -->
    </div>
  </div>

  <section class="flex-1 bg-white px-6 pt-15 pb-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
    <div class="flex justify-between items-center mb-5">
      <div class="text-s text-gray-800">
        검색결과
        <span class="text-orange-500 font-bold">{{ filteredResults.length }}</span> 건
      </div>
    </div>
    <!------------------------------------------------------------------------------------------------->

    <!--수정해야함-->

    <div class="flex-1 overflow-auto rounded-lg border border-gray-200">
      <DataTable :value="filteredResults">
        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>

        <Column selectionMode="multiple" headerStyle="width:48px" />
        <Column header="검사결과 코드" field="qir_code" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 1rem" />
        <Column header="품질기준 정보 코드" field="qcr_code" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 1rem" />
        <Column header="품목명(공통코드)" field="com_value" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 1rem" />
        <Column header="검사항목" field="inspection_item" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 1rem" />
        <Column header="품질 상한값" field="range_top" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 1rem" />
        <Column header="품질 하한값" field="range_bot" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 1rem" />
        <Column header="단위(공통코드)" field="unit" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 1rem" />
        <Column header="품질결과" field="result" headerClass="table-header" sortable style="min-width: 1rem">
          <template #body="slotProps">
            <span
              :class="{
                'text-green-600 font-semibold': slotProps.data.result === '합격',
                'text-red-600 font-semibold': slotProps.data.result === '불합격',
                'text-blue-500 font-semibold': slotProps.data.result !== '합격' && slotProps.data.result !== '불합격'
              }"
            >
              {{ slotProps.data.result }}
            </span>
          </template>
        </Column>
        <Column header="검사일자" field="end_date" headerClass="table-header" bodyClass="table-body text-center" sortable style="min-width: 1rem">
          <template #body="slotProps">
            <template v-if="!slotProps.data.end_date">
              <span class="text-gray-400">없음</span>
            </template>
            <template v-else>
              {{ formatDate(slotProps.data.end_date) }}
            </template>
          </template>
        </Column>
        <Column header="검사자" field="qir_emp_code" headerClass="table-header" sortable style="min-width: 1rem" />
      </DataTable>
    </div>
  </section>
</template>
