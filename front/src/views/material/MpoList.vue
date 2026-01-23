<script setup>
import { ref, onMounted } from 'vue';
import { useMaterialStore } from '@/stores/material1';
import { useOrderStore2 } from '@/stores/order2';
import { downloadExcel } from '@/utils/excel';

const mpoStore = useMaterialStore();
const orderStore = useOrderStore2();

// 검색 조건
const searchData = ref({
  purchaseCode: '',
  matName: '',
  matCode: '',
  reqDateStart: null,
  reqDateEnd: null,
  deadlineStart: null,
  deadlineEnd: null,
  stat: '전체'
});

// 자재명 표시 함수
const formatMaterialNames = (names) => {
  if (!names) return '-';
  const arr = names.split(', ');
  return arr.length > 1 ? `${arr[0]} 외 ${arr.length - 1}건` : arr[0];
};

// 발주 목록
const mpoList = ref([]);
const selectedRows = ref([]);

// 초기 로드
onMounted(async () => {
  await loadMpoList();
});

// 발주 목록 조회
const loadMpoList = async () => {
  try {
    mpoList.value = await mpoStore.fetchMpoList();
  } catch (err) {
    console.error('발주 목록 조회 실패:', err);
  }
};

// 검색
const handleSearch = async () => {
  mpoList.value = await mpoStore.searchMpoDetail(searchData.value);
};

// 초기화
const handleReset = () => {
  searchData.value = {
    purchaseCode: '',
    matName: '',
    matCode: '',
    reqDateStart: null,
    reqDateEnd: null,
    deadlineStart: null,
    deadlineEnd: null,
    stat: '전체'
  };
};

// 날짜 포맷
const formatDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

//엑셀다운로드
const handleExcelDownload = () => {
  // 엑셀 파일의 컬럼명 (순서 중요)
  const headers = ['발주서번호', '발주제안일', '자재유형', '자재명', '공급업체', '필요수량', '입고납기일', '발주상태', '작성자', '등록일자'];

  // 각 출고 데이터를 엑셀 행으로 변환
  // 주의: headers 배열 순서와 동일하게 매핑해야 함
  const mapFunction = (item) => [
    item.purchase_code,
    formatDate(item.purchase_req_date),
    item.material_type || '-',
    item.material_names,
    item.supplier_name || '-',
    item.req_qtt || '-',
    formatDate(item.deadline),
    item.stat,
    item.emp_name,
    formatDate(item.regdate)
  ];

  // 엑셀 다운로드 실행
  downloadExcel(selectedRows.value.length > 0 ? selectedRows.value : orderStore.outboundList, headers, mapFunction, '발주목록조회');
};
</script>

<template>
  <div>
    <!-- 검색 필터 -->
    <div class="card">
      <div class="flex justify-between items-center pb-4">
        <h4 class="m-0">발주 검색</h4>
        <div class="flex items-center gap-2">
          <Button label="초기화" severity="contrast" class="px-3 py-1 h-[35px] text-sm gap-2 whitespace-nowrap" @click="handleReset" />
          <Button label="조회" class="px-3 py-1 h-[35px] text-sm gap-2" @click="handleSearch" />
        </div>
      </div>

      <Fluid>
        <table class="w-full">
          <colgroup>
            <col class="w-25" />
            <col class="w-auto" />
            <col class="w-25" />
            <col class="w-auto" />
          </colgroup>

          <tbody>
            <tr>
              <th>발주서번호</th>
              <td>
                <InputText v-model="searchData.purchaseCode" placeholder="발주서 선택" class="w-full" />
              </td>

              <th>자재유형</th>
              <td>
                <Select v-model="searchData.matName" :options="['전체', '원자재', '부자재']" placeholder="자재 선택" class="w-full" />
              </td>
            </tr>

            <tr>
              <th>공급업체</th>
              <td>
                <InputText v-model="searchData.matCode" placeholder="공급업체 선택" class="w-full" />
              </td>

              <th>발주제안일</th>
              <td>
                <div class="flex gap-2 items-center">
                  <DatePicker v-model="searchData.reqDateStart" dateFormat="yy-mm-dd" :showIcon="true" placeholder="연도-월-일" class="flex-1" />
                  <span>~</span>
                  <DatePicker v-model="searchData.reqDateEnd" dateFormat="yy-mm-dd" :showIcon="true" placeholder="연도-월-일" class="flex-1" />
                </div>
              </td>
            </tr>

            <tr>
              <th>입고납기일</th>
              <td>
                <div class="flex gap-2 items-center">
                  <DatePicker v-model="searchData.deadlineStart" dateFormat="yy-mm-dd" :showIcon="true" placeholder="연도-월-일" class="flex-1" />
                  <span>~</span>
                  <DatePicker v-model="searchData.deadlineEnd" dateFormat="yy-mm-dd" :showIcon="true" placeholder="연도-월-일" class="flex-1" />
                </div>
              </td>

              <th>발주상태</th>
              <td>
                <Select v-model="searchData.stat" :options="['전체', '요청완료', '승인완료']" placeholder="전체" class="w-full" />
              </td>
            </tr>
          </tbody>
        </table>
      </Fluid>
    </div>

    <!-- 발주 목록 테이블 -->
    <div class="card mt-4 min-h-[450px]">
      <div class="flex justify-between align-items-center mb-3">
        <div class="flex justify-between items-center mb-2">
          <span
            >총 <span class="font-black">{{ mpoList.length }}</span
            >건</span
          >
        </div>

        <div class="flex gap-2">
          <Button icon="pi pi-file-excel" label="엑셀 다운로드" class="px-3 py-1 h-[35px] text-sm gap-2" @click="handleExcelDownload" />
        </div>
      </div>

      <DataTable
        :value="mpoList"
        dataKey="purchase_code"
        v-model:selection="selectedRows"
        selectionMode="checkbox"
        :paginator="true"
        :rows="10"
        tableStyle="table-layout: fixed; width: 100%;"
        class="p-datatable-sm"
        scrollable
        scroll-height="345px"
        showGridlines
      >
        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>

        <Column selectionMode="multiple" headerStyle="width: 48px; background-color:#f9fafb; padding: 10px;" />

        <Column header="발주서번호" field="purchase_code" sortable headerStyle="width: 120px; background-color: #f9fafb; padding: 10px;">
          <template #body="{ data }">{{ data.purchase_code }}</template>
        </Column>

        <Column header="발주제안일" field="purchase_req_date" sortable headerStyle="width: 120px; background-color: #f9fafb; padding: 10px;">
          <template #body="{ data }">{{ formatDate(data.purchase_req_date) }}</template>
        </Column>

        <Column header="자재유형" field="material_type" headerStyle="width: 100px; background-color: #f9fafb; padding: 10px;">
          <template #body="{ data }">{{ data.material_type || '-' }}</template>
        </Column>

        <Column header="자재명" field="material_names" headerStyle="width: 200px; background-color: #f9fafb; padding: 10px;">
          <template #body="{ data }">
            {{ formatMaterialNames(data.material_names) }}
          </template>
        </Column>

        <Column header="공급업체" field="supplier_name" headerStyle="width: 150px; background-color: #f9fafb; padding: 10px;">
          <template #body="{ data }">
            {{ formatMaterialNames(data.supplier_name) }}
          </template>
        </Column>

        <Column header="필요수량" field="req_qtt" sortable headerStyle="width: 100px; background-color: #f9fafb; padding: 10px;">
          <template #body="{ data }">{{ data.req_qtt || '-' }}</template>
        </Column>

        <Column header="입고납기일" field="deadline" sortable headerStyle="width: 120px; background-color: #f9fafb; padding: 10px;">
          <template #body="{ data }">{{ formatDate(data.deadline) }}</template>
        </Column>

        <Column header="발주상태" field="stat" headerStyle="width: 100px; background-color: #f9fafb; padding: 10px;">
          <template #body="{ data }">{{ data.stat }}</template>
        </Column>

        <Column header="작성자" field="emp_name" headerStyle="width: 100px; background-color: #f9fafb; padding: 10px;">
          <template #body="{ data }">{{ data.emp_name }}</template>
        </Column>

        <Column header="등록일자" field="regdate" sortable headerStyle="background-color: #f9fafb; padding: 10px;">
          <template #body="{ data }">{{ formatDate(data.regdate) }}</template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
th,
td {
  padding: 6px 8px;
  text-align: left;
  vertical-align: middle;
}

th {
  font-weight: 600;
  white-space: nowrap;
}

td {
  padding-right: 20px;
}
</style>
