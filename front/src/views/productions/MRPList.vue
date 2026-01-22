<script setup>
import { useProductionStore } from '@/stores/production2';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useProductionStore();
const router = useRouter();

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
const data = reactive({
  mrpCode: '',
  prdpCode: '',
  prdpName: '',
  matName: '',
  mrpStart: firstDay,
  mrpEnd: lastDay
});
const MRP = ref([]);

// 날짜포맷
const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 초기화
const reset = () => {
  data.mrpCode = '';
  data.prdpCode = '';
  data.prdpName = '';
  data.matName = '';
  data.mrpStart = firstDay;
  data.mrpEnd = lastDay;
};

// 조회
const search = async () => {
  const params = {
    mrpCode: data.mrpCode,
    prdpCode: data.prdpCode,
    prdpName: data.prdpName,
    matName: data.matName
  };
  params.mrpStart = formatDate(data.mrpStart);
  params.mrpEnd = formatDate(data.mrpEnd);

  const list = await store.fetchMRPs(params);
  MRP.value = list.map((item) => ({
    ...item,
    plan_date: item.plan_date.slice(0, 10)
  }));
};

onMounted(async () => {
  store.mrpCode = null;
  await search();
});

const goDetail = (row) => {
  store.mrpCode = row.mrp_code;
  router.push({ name: 'productionMRP' });
};
</script>
<template>
  <Fluid class="card grid gap-4">
    <div class="font-semibold text-xl">MRP</div>
    <table class="w-full">
      <colgroup>
        <col class="w-30" />
        <col class="w-auto" />
        <col class="w-30" />
        <col class="w-auto" />
      </colgroup>
      <tbody>
        <tr>
          <th>MRP코드</th>
          <td><InputText placeholder="생산계획코드를 입력하세요" v-model="data.mrpCode"></InputText></td>
          <th>생산계획코드</th>
          <td><InputText placeholder="계획명을 입력하세요" v-model="data.prdpCode"></InputText></td>
        </tr>
        <tr>
          <th>자재명</th>
          <td><InputText placeholder="생산계획코드를 입력하세요" v-model="data.matName"></InputText></td>
          <th>생산계획명</th>
          <td><InputText placeholder="계획명을 입력하세요" v-model="data.prdpName"></InputText></td>
        </tr>
        <tr>
          <th>MRP계획일자</th>
          <td>
            <Fluid class="flex gap-2 items-center">
              <div class="flex-1">
                <DatePicker :showIcon="true" :showButtonBar="true" v-model="data.mrpStart"></DatePicker>
              </div>
              <span>-</span>
              <div class="flex-1">
                <DatePicker :showIcon="true" :showButtonBar="true" v-model="data.mrpEnd"></DatePicker>
              </div>
            </Fluid>
          </td>
          <th style="visibility: hidden"></th>
          <td style="visibility: hidden">
            <Fluid class="flex gap-2 items-center">
              <div class="flex-1">
                <DatePicker></DatePicker>
              </div>
              <span>-</span>
              <div class="flex-1">
                <DatePicker></DatePicker>
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
    <DataTable :value="MRP" :paginator="true" :rows="8" dataKey="mrp_d_code" :rowHover="true" showGridlines @row-click="goDetail($event.data)">
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>
      <Column field="mrp_code" header="MRP코드" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 100px"></Column>
      <Column field="prdp_code" header="생산계획코드" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 100px"></Column>
      <Column field="prdp_name" header="생산계획명" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 100px"></Column>
      <Column field="mat_name" header="자재명" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 100px"></Column>
      <Column field="req_qtt" header="필요수량" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 80px"></Column>
      <Column field="unit" header="단위" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 60px"></Column>
      <Column field="plan_date" header="MRP계획일자" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 120px"></Column>
      <Column field="mrp_note" header="비고" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 140px"></Column>
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
