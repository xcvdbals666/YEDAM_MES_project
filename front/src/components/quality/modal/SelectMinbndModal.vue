<script setup>
import { defineProps, ref } from 'vue';

const selectedProducts = ref();

const props = defineProps({
  display: { type: Boolean, required: true },
  minbnd: { type: Array, required: true }
});

console.log(props.minbnd);
console.log(selectedProducts.value);
</script>
<template>
  <Dialog v-model:visible="props.display" :breakpoints="{ '960px': '75vw' }" :style="{ width: '50vw' }" :modal="true">
    <DataTable ref="dt" v-model:selection="selectedProducts" :value="props.minbnd" dataKey="mpo_d_code" v-if="props.minbnd.length > 0">
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <h4 class="m-0">재고 불러오기</h4>
        </div>
      </template>
      <Column selectionMode="single" style="width: 3rem" :exportable="false"></Column>
      <Column field="mpo_d_code" header="발주서상세코드" sortable style="min-width: 12rem"></Column>
      <Column field="mat_name" header="자재명" sortable style="min-width: 12rem"></Column>
      <Column field="req_qtt" header="수량" sortable style="min-width: 12rem"></Column>
    </DataTable>
    <p v-else class="leading-normal m-0">현재 죄회할 내용이 없습니다.</p>

    <template #footer>
      <Button label="확인" @click="$emit('selectComp', selectedProducts)" />
      <Button label="취소" severity="secondary" @click="$emit('close')" />
    </template>
  </Dialog>
</template>
