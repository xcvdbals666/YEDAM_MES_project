<!--QiResultList.vue-->
<!--품질검사 결과 목록조회-->

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQualityStore2 } from '@/stores/quality2.js';
import SelectQiResultModal2 from '@/components/quality/modal/SelectQiResultModal2.vue';

const qualityStore = useQualityStore2();
const selectedResults = ref([]); //모달에서 선택한 결과서 목록불러오기

//검색창 입력부분
const qir_code = ref(''); //검사결과 코드
const qcr_code = ref(''); //검사지시 항목 코드
const inspection_item = ref(''); //검사항목
const com_value = ref(''); //품목명
const result = ref(''); //결과
const end_date = ref(''); //검사일자
const qir_emp_code = ref(''); //검사자

//모달 표시 여부
const orderDisplay = ref(false);

//모달 출력
const openModal = async () => {
  await qualityStore.fetchQiResultList();
  orderDisplay.value = true;
};

//모달 닫기
const closeModal = () => {
  orderDisplay.value = false;
};

//모달에서 선택된 결과서 받기
const selectedResult = (results) => {
  if (!results || results.length === 0) return;

  selectedResults.value = results;

  // 지시코드 InputText용 (표시 목적)
  qir_code.value = results.map((o) => o.qir_code).join(', ');
  orderDisplay.value = false;
};

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
  { name: '합격', code: 'g2' },
  { name: '불합격', code: 'g1' }
]);
const dropdownValue2 = ref(dropdownValues.value[0]);

//코드로 찾기
const search = () => {
  qualityStore.fetchQiResultList({ keyword: qir_code.value });
};
// 날짜 포맷 함수 (YYYY-MM-DD)
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
};

//검색조건에 따른 목록 필터링
const filteredResults = computed(() => {
  return qualityStore.qiResultList.filter((item) => {
    const codeList = qir_code.value
      ? qir_code.value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : [];

    // 기존 로직 (정확 매칭: 모달 선택용)
    const isExactCodeMatch = !qir_code.value || codeList.includes(item.qir_code);

    // 추가 로직 (부분 검색: 직접 입력용)
    const isPartialCodeMatch = codeList.length === 1 && item.qir_code?.includes(codeList[0]);

    // 최종 검사결과 코드 조건
    const isCodeMatch = isExactCodeMatch || isPartialCodeMatch;

    const isInspectionMatch = !inspection_item.value || item.inspection_item?.includes(inspection_item.value);

    const isEmpcodeMatch = !qir_emp_code.value || item.qir_emp_code?.includes(qir_emp_code.value);

    // 드롭다운 품목명 필터
    const isDropdownMatch = !dropdownValue.value?.code || item.com_value === dropdownValue.value.name;
    const isDropdownMatch2 = !dropdownValue2.value?.code || item.result === dropdownValue2.value.name;

    const itemEndDate = item.end_date ? new Date(item.end_date).toISOString().slice(0, 10) : null;

    const isEndDateMatch = !end_date.value || (itemEndDate && itemEndDate === new Date(end_date.value).toISOString().slice(0, 10));

    return isCodeMatch && isInspectionMatch && isDropdownMatch && isEndDateMatch && isEmpcodeMatch && isDropdownMatch2;
  });
});

//전체조회 버튼 기능추가
const resetFilters = () => {
  qir_code.value = '';
  qcr_code.value = '';
  inspection_item.value = '';
  com_value.value = '';
  result.value = '';
  end_date.value = '';
  qir_emp_code.value = '';
  dropdownValue.value = dropdownValues.value[0];
  dropdownValue2.value = dropdownValues2.value[0];
};

const modalKey = ref(0);

const fetchAll = async () => {
  resetFilters(); // 입력값 초기화
  modalKey.value++; //모달 강제 리셋
  await qualityStore.fetchQiResultList(); // 전체 조회
};
</script>

<!---->

<template>
  <div class="card border border-gray-200 flex flex-col gap-6 p-fluid">
    <!--모달창-->
    <SelectQiResultModal2 :key="modalKey" :display="orderDisplay" :qiResultList="qualityStore.qiResultList" @close="closeModal" @selected-result="selectedResult" />
    <!------------------------------------------------------------------------------------------------->
    <!-- 검색이 되어야 하는 창-->
    <div class="text-2xl font-bold text-center">품질 검사 결과 목록 조회</div>

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

      <div class="flex flex-col gap-2">
        <label class="font-semibold">검사자</label>
        <InputText v-model="qir_emp_code" placeholder="검사자 코드 검색" class="w-full" />
      </div>

      <div class="flex flex-col gap-2">
        <div class="font-semibold">품목명</div>
        <Select v-model="dropdownValue" :options="dropdownValues" optionLabel="name" placeholder="품목명 검색" />
      </div>

      <div class="flex flex-col gap-2">
        <div class="font-semibold">결과</div>
        <Select v-model="dropdownValue2" :options="dropdownValues2" optionLabel="name" placeholder="" />
      </div>

      <!-- 결과
      <div class="flex flex-col gap-2">
        <label class="font-semibold">결과</label>
        <InputText v-model="result" placeholder="합격/불합격/미검사" class="w-full" />
      </div> -->

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
        <Button label="전체조회" severity="contrast" @click="fetchAll" />
        <!--전체를 누르면 전체의 지시코드가 생김-->
        <Button label="검색조회" severity="warn" @click="search" />
      </div>
      <Button label="검사결과 선택" severity="" @click="openModal" />
    </div>
  </div>

  <section class="flex-1 bg-white px-6 pt-5 pb-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
    <div class="flex justify-between items-center mb-2">
      <div class="text-s text-gray-800">
        검색결과
        <span class="text-orange-500 font-bold">{{ filteredResults.length }}</span> 건
      </div>
    </div>
    <!------------------------------------------------------------------------------------------------->

    <!--수정해야함-->

    <div class="flex-1 overflow-auto rounded-lg border border-gray-200">
      <DataTable :value="filteredResults" rowHover class="hover-table" scrollable scrollHeight="400px">
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
                'text-blue-500 font-semibold': slotProps.data.result !== '미지시' && slotProps.data.result !== '불합격'
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
<style scoped>
/* hover 시 텍스트 살짝 강조 */
.hover-table :deep(.p-datatable-tbody > tr:hover td) {
  font-weight: 500;
}
</style>
