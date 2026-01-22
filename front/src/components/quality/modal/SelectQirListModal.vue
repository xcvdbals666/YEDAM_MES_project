<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  display: { type: Boolean, required: true }
});
</script>
<template>
  <Dialog v-model:visible="props.display" :breakpoints="{ '960px': '75vw' }" :style="{ width: '50vw' }" :modal="true">
    <DataTable ref="dt" v-model:selection="selectedProducts" dataKey="prdp_code">
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <h4 class="m-0">검사결과서 불러오기</h4>
        </div>
      </template>
      <Column selectionMode="single" style="width: 3rem" :exportable="false"></Column>
      <Column field="prdp_code" header="생산계획 코드" sortable style="min-width: 12rem"></Column>
      <Column field="po_name" header="공정명" sortable style="min-width: 12rem"></Column>
      <Column field="prod_name" header="제품명" sortable style="min-width: 12rem"></Column>
      <Column field="end_date" header="생산완료일" sortable style="min-width: 12rem"></Column>
      <Column field="production_qtt" header="생산량" sortable style="min-width: 12rem"></Column>
    </DataTable>

    <template #footer>
      <Button label="확인" @click="$emit('selectProd', selectedProducts)" />
      <Button label="취소" severity="secondary" @click="$emit('close')" />
    </template>
  </Dialog>
</template>
