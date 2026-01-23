<script setup>
import { useProductionStore } from '@/stores/production2';
import { reactive, ref, onMounted } from 'vue';

const store = useProductionStore();

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
const data = reactive({
  prdrCode: '',
  prodName: '',
  startDate: firstDay,
  endDate: lastDay,
  workOrderCode: ''
});
const prdrs = ref([]);

// 날짜포맷
const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 초기화
const reset = () => {
  data.code = '';
  data.prodName = '';
  data.startDate = firstDay;
  data.endDate = lastDay;
  data.workOrderCode = '';
};

// 조회
const search = async () => {
  const params = {
    code: data.code,
    prodName: data.prodName,
    wordOrderCode: data.workOrderCode
  };
  params.startDate = formatDate(data.startDate);
  params.endDate = formatDate(data.endDate);

  const list = await store.fetchPrdrs(params);
  console.log(list);
  prdrs.value = list.map((item) => ({
    ...item,
    start_date: `${item.start_date.slice(0, 10)} ${item.start_date.slice(11, 19)}`,
    end_date: `${item.end_date.slice(0, 10)} ${item.start_date.slice(11, 19)}`
  }));
};

onMounted(async () => {
  await search();
});
</script>
<template>
  <Fluid class="card grid gap-4">
    <div class="font-semibold text-xl">생산실적</div>
    <table class="w-full">
      <colgroup>
        <col class="w-25" />
        <col class="w-auto" />
        <col class="w-25" />
        <col class="w-auto" />
        <col class="w-25" />
        <col class="w-auto" />
      </colgroup>
      <tbody>
        <tr>
          <th>생산실적코드</th>
          <td><InputText placeholder="생산실적코드를 입력하세요" v-model="data.prdrCode"></InputText></td>
          <th>제품명</th>
          <td><InputText placeholder="제품을 입력하세요" v-model="data.prodName"></InputText></td>
          <th>작업지시코드</th>
          <td><InputText placeholder="작업지시코드를 입력하세요" v-model="data.workOrderCode"></InputText></td>
        </tr>
        <tr>
          <th>시작일자</th>
          <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="data.startDate" placeholder="날짜 선택"></DatePicker></td>
          <th>종료일자</th>
          <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="data.endDate" placeholder="날짜 선택"></DatePicker></td>
          <th></th>
          <td></td>
        </tr>
      </tbody>
    </table>
    <div class="justify-items-center">
      <div class="flex gap-2 w-40">
        <Button severity="secondary" @click="reset">초기화</Button>
        <Button @click="search">조회</Button>
      </div>
    </div>
  </Fluid>
  <Fluid class="card">
    <div class="font-semibold text-xl pb-4">생산실적조회</div>
    <DataTable :value="prdrs" :paginator="true" sortField="start_date" :sortOrder="-1" :rows="8" dataKey="prdr_code" :rowHover="true" showGridlines>
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>
      <Column field="prdr_code" header="생산실적코드" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 100px" />
      <Column field="work_order_code" header="작업지시코드" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 120px" />
      <Column field="prod_code" header="제품코드" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 100px" />
      <Column field="prod_name" header="제품명" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 120px" />
      <Column field="start_date" :sortable="true" header="시작일시" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 120px" />
      <Column field="end_date" sortable header="종료일시" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 120px" />
      <Column field="total_time" header="소요시간" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 100px" />
      <Column field="production_qtt" header="생산수량(개)" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 60px" />
      <Column field="perform_rate" sortable header="달성률(%)" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 120px">
        <template #body="{ data }">
          <ProgressBar :value="data.perform_rate"></ProgressBar>
        </template>
      </Column>
    </DataTable>
  </Fluid>
</template>
<style>
th,
td {
  padding: 4px;
  text-align: left;
}
td {
  padding-right: 20px;
}
</style>
