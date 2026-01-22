<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps({
  allQiList: { type: Object, required: true }
});
</script>
<template>
  <DataTable ref="dt" :value="props.allQiList" dataKey="qcr_code">
    <template #header>
      <div class="flex flex-wrap gap-2 items-center justify-between">
        <h4 class="m-0">검사항목</h4>
      </div>
    </template>
    <Column style="width: 3rem" :exportable="true"></Column>
    <Column field="inspection_item" header="검사항목" sortable style="min-width: 12rem"></Column>
    <Column field="range_top" header="기준값(상한)" sortable style="min-width: 16rem"></Column>
    <Column field="range_bot" header="기준값(하한)" sortable style="min-width: 10rem"></Column>
    <Column field="note" header="단위" sortable style="min-width: 10rem"></Column>
    <Column field="result" header="결과" sortable style="min-width: 10rem">
      <template #body="slotProps"> <Dropdown v-model="slotProps.data.result" :options="['선택', '합격', '불합격']" placeholder="선택" /> </template
    ></Column>
  </DataTable>
</template>
