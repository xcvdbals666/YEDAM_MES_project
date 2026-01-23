<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps({
  allQiList: { type: Object, required: true },
  qualityState: { type: Number, required: true }
});
</script>

<template>
  <Fluid class="card mt-8">
    <div class="font-semibold text-xl pb-4">검사 항목</div>
    <DataTable showGridlines ref="dt" :value="props.allQiList" dataKey="qcr_code">
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>
      <Column field="inspection_item" header="검사항목" sortable style="min-width: 12rem"></Column>
      <Column field="range_top" header="기준값(상한)" sortable style="min-width: 16rem"></Column>
      <Column field="range_bot" header="기준값(하한)" sortable style="min-width: 10rem"></Column>
      <Column field="note" header="단위" sortable style="min-width: 10rem"></Column>
      <Column field="result" header="결과" sortable style="min-width: 10rem" v-if="qualityState == 1">
        <template #body="slotProps"> <Dropdown v-model="slotProps.data.result" :options="['합격', '불합격']" placeholder="선택" /> </template
      ></Column>
    </DataTable>
  </Fluid>
</template>
