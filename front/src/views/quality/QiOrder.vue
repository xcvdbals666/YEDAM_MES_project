<!-- QiOrder.vue -->
<!-- 검사지시서 관리 페이지-->
<script setup>
import { ProductService } from '@/service/ProductService';
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted } from 'vue';

onMounted(() => {
  ProductService.getProducts().then((data) => {
    products.value = data;
    console.log(products.value);
  });
});

const products = ref();
const selectedProducts = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

import { onBeforeMount, ref } from 'vue';
import axios from 'axios';

onBeforeMount(() => {
  // qcr_tbl 데이터 불러오기(맨처음 접속시)
  axios //
    .get('/quality/qiorder')
    .then((res) => {
      allQiList.value = res.data;
      console.log('allQiList: ', allQiList.value);
    });
});
let allQiList = ref([]);

// 재고목록 불러오기
let minbndList = ref([]);
const searchMinbndList = async () => {
  await axios //
    .get('quality/minbndlist')
    .then((res) => {
      console.log(res);
      res.data.forEach((data) => {
        if (!minbndList.value.includes(data.qio_code)) {
          minbndList.value.push(data.qio_code);
        }
      });
    });
  console.log(minbndList.value);
};
</script>

<template>
  <div class="flex mt-8">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <div>기본 정보</div>
        <div class="flex flex-row gap-2">
          <Button label="삭제" severity="danger" />
          <Button label="초기화" severity="secondary" />
          <Button label="저장" severity="success" />
          <Button label="검사지 불러오기" />
        </div>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="OrderCode" class="col-span-1">검사지시 코드</label>
            <InputText id="OrderCode" type="text" class="col-span-2" />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="orderDate" class="col-span-1">지시일자</label>
            <InputText id="orderDate" type="text" class="col-span-2" />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="orderPeople" class="col-span-1">지시자</label>
            <InputText id="orderPeople" type="text" class="col-span-2" />
          </div>
        </div>
        <div class="col-span-2"></div>
      </div>
    </div>
  </div>
  <div class="flex">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <div>기본 정보</div>
        <div class="flex flex-row gap-2">
          <Button type="button" @click="searchMinbndList" label="재고목록 불러오기" />
          <Button label="생산목록 불러오기" />
        </div>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="checkThing" class="col-span-1">검사대상</label>
            <InputText id="checkThing" type="text" class="col-span-2" />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="thingCode" class="col-span-1">품목코드</label>
            <InputText id="thingCode" type="text" class="col-span-2" />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="thingName" class="col-span-1">품목이름</label>
            <InputText id="thingName" type="text" class="col-span-2" />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="checkNum" class="col-span-1">검사수량</label>
            <InputText id="checkNum" type="text" class="col-span-2" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <DataTable
    ref="dt"
    v-model:selection="selectedProducts"
    :value="allQiList"
    dataKey="qcr_code"
    :paginator="true"
    :rows="10"
    :filters="filters"
    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    :rowsPerPageOptions="[5, 10, 25]"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
  >
    <template #header>
      <div class="flex flex-wrap gap-2 items-center justify-between">
        <h4 class="m-0">검사항목</h4>
      </div>
    </template>

    <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
    <Column field="inspection_item" header="검사항목" sortable style="min-width: 12rem"></Column>
    <Column field="range_top" header="기준값(상한)" sortable style="min-width: 16rem"></Column>
    <Column field="range_bot" header="기준값(하한)" sortable style="min-width: 10rem"></Column>
    <Column field="note" header="단위" sortable style="min-width: 10rem"></Column>
  </DataTable>
</template>
