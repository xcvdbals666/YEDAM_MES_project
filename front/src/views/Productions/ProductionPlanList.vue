<script setup>
import { useProductionStore } from '@/stores/production2';
import { onMounted, reactive, ref } from 'vue';

const store = useProductionStore();

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
const data = reactive({
  code: '',
  name: '',
  prdpStart: firstDay,
  prdpEnd: lastDay,
  dueStart: firstDay,
  dueEnd: lastDay
});
const plans = ref([]);

// 날짜포맷
const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 초기화
const reset = () => {
  data.code = '';
  data.name = '';
  data.prdpStart = firstDay;
  data.prdpEnd = lastDay;
  data.dueStart = firstDay;
  data.dueEnd = lastDay;
};

// 조회
const search = async () => {
  const params = {
    code: data.code,
    name: data.name
  };
  params.prdpStart = formatDate(data.prdpStart);
  params.prdpEnd = formatDate(data.prdpEnd);
  params.dueStart = formatDate(data.dueStart);
  params.dueEnd = formatDate(data.dueEnd);

  const list = await store.fetchProdPlan(params);
  plans.value = list.map((item) => ({
    ...item,
    prdp_date: item.prdp_date.slice(0, 10),
    start_date: item.start_date.slice(0, 10),
    end_date: item.end_date.slice(0, 10),
    due_date: item.due_date.slice(0, 10)
  }));
};

onMounted(async () => {
  await search();
});
</script>
<template>
  <Fluid class="card grid gap-4">
    <div class="font-semibold text-xl">생산계획</div>
    <table class="w-full">
      <colgroup>
        <col class="w-25" />
        <col class="w-auto" />
        <col class="w-25" />
        <col class="w-auto" />
      </colgroup>
      <tbody>
        <tr>
          <th>생산계획코드</th>
          <td><InputText placeholder="생산계획코드를 입력하세요" v-model="data.prdpCode"></InputText></td>
          <th>계획명</th>
          <td><InputText placeholder="계획명을 입력하세요" v-model="data.prdpName"></InputText></td>
        </tr>
        <tr>
          <th>계획일자</th>
          <td>
            <Fluid class="flex gap-2 items-center">
              <div class="flex-1">
                <DatePicker :showIcon="true" :showButtonBar="true" v-model="data.prdpStart"></DatePicker>
              </div>
              <span>-</span>
              <div class="flex-1">
                <DatePicker :showIcon="true" :showButtonBar="true" v-model="data.prdpEnd"></DatePicker>
              </div>
            </Fluid>
          </td>
          <th>납기일자</th>
          <td>
            <Fluid class="flex gap-2 items-center">
              <div class="flex-1">
                <DatePicker :showIcon="true" :showButtonBar="true" v-model="data.dueStart"></DatePicker>
              </div>
              <span>-</span>
              <div class="flex-1">
                <DatePicker :showIcon="true" :showButtonBar="true" v-model="data.dueEnd"></DatePicker>
              </div>
            </Fluid>
          </td>
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
    <div class="font-semibold text-xl pb-4">제품</div>
    <DataTable :value="plans" :paginator="true" :rows="8" dataKey="prdp_code" :rowHover="true" showGridlines>
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>
      <Column field="prdp_code" header="생산계획코드" headerClass="table-header" bodyClass="table-body text-[14px]" style="width: 140px"></Column>
      <Column field="prdp_name" header="계획명" headerClass="table-header" bodyClass="table-body text-[14px]" style="width: 140px"></Column>
      <Column field="prdp_date" header="계획일자" headerClass="table-header" bodyClass="table-body text-[14px]" style="width: 95px"></Column>
      <Column field="start_date" header="계획시작일" headerClass="table-header" bodyClass="table-body text-[14px]" style="width: 95px"></Column>
      <Column field="end_date" header="계획종료일" headerClass="table-header" bodyClass="table-body text-[14px]" style="width: 95px"></Column>
      <Column field="due_date" header="납기일자" headerClass="table-header" bodyClass="table-body text-[14px]" style="width: 95px"></Column>
      <Column field="reg" header="작성자" headerClass="table-header" bodyClass="table-body text-[14px]" style="width: 100px"></Column>
      <Column field="note" header="비고" headerClass="table-header" bodyClass="table-body text-[14px]" style="width: 100px"></Column>
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
