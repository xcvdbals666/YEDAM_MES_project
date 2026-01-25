<script setup>
import { ref, defineProps, watch } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

const selectedProducts = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const props = defineProps({
  allQiList: { type: Array, required: true },
  selectedQcrList: { type: Array, required: true }
});

watch(
  () => props.selectedQcrList,
  (newval) => {
    selectedProducts.value = [];
    selectedProducts.value = newval;
  },
  { deep: true },
  { immediate: true }
);
</script>
<template>
  <Fluid class="card mt-8">
    <div class="font-semibold text-xl pb-4">검사 항목</div>
    <DataTable showGridlines scrollable scroll-height="340px" ref="dt" v-model:selection="selectedProducts" :value="props.allQiList" dataKey="qcr_code">
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>
      <Column selectionMode="multiple" style="width: 3rem" :exportable="true"></Column>
      <Column field="inspection_item" header="검사항목" sortable style="min-width: 12rem"></Column>
      <Column field="range_top" header="기준값(상한)" sortable style="min-width: 16rem"></Column>
      <Column field="range_bot" header="기준값(하한)" sortable style="min-width: 10rem"></Column>
      <Column field="note" header="단위" sortable style="min-width: 10rem"></Column>
    </DataTable>
  </Fluid>
</template>
