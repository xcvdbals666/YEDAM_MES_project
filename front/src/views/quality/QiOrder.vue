<!-- QiOrder.vue -->
<!-- 검사지시서 관리 페이지-->
<script setup>
import { NodeService } from '@/service/NodeService';
import { onBeforeMount, ref } from 'vue';
import axios from 'axios';

const treeValue = ref(null);
const treeTableValue = ref(null);
const selectedTreeTableValue = ref(null);

onBeforeMount(() => {
  NodeService.getTreeNodes(allQiList.value).then((data) => (treeValue.value = data));
  NodeService.getTreeTableNodes(allQiList.value).then((data) => (treeTableValue.value = data));
});

// qcr_tbl 데이터 불러오기(맨처음 접속시)
let allQiList = ref([]);
axios //
  .get('/quality/qiorder')
  .then((res) => {
    allQiList.value = res.data;
    console.log('allQiList: ', allQiList.value);
  });
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
          <Button label="재고목록 불러오기" />
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

  <div class="card">
    <div class="font-semibold text-xl mb-4">검사항목</div>
    <TreeTable>
      <Column field="검사항목" header="검사항목" :expander="true">검사항목</Column>
      <Column field="기준값(상한)" header="기준값(상한)">기준값(상한)</Column>
      <Column field="기준값(하한)" header="기준값(하한)">기준값(하한)</Column>
      <Column field="단위" header="단위">단위</Column>
    </TreeTable>
  </div>
</template>
