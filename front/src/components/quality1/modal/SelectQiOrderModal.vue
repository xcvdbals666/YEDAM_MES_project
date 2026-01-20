<script setup>
import { defineProps, ref } from 'vue';

const selectedProducts = ref();

const props = defineProps({
  display: { type: Boolean, required: true },
  qiOrderList: { type: Array, required: true }
});
</script>
<template>
  <Dialog v-model:visible="props.display" :breakpoints="{ '960px': '75vw' }" :style="{ width: '50vw' }" :modal="true">
    <DataTable ref="dt" v-model:selection="selectedProducts" :value="props.qiOrderList" dataKey="qio_code" v-if="props.qiOrderList.length > 0">
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <h4 class="m-0">지시서 불러오기</h4>
        </div>
      </template>
      <Column selectionMode="single" style="width: 3rem" :exportable="false"></Column>
      <Column field="qio_code" header="품질검사지시코드" sortable style="min-width: 12rem"></Column>
      <Column field="qio_date" header="지시일자" sortable style="min-width: 12rem"></Column>
      <Column field="emp_name" header="지시자" sortable style="min-width: 12rem"></Column>
    </DataTable>
    <p v-else class="leading-normal m-0">현재 죄회할 내용이 없습니다.</p>

    <template #footer>
      <Button label="확인" @click="$emit('selectedOrder', selectedProducts)" />
      <Button label="취소" severity="secondary" @click="$emit('close')" />
    </template>
  </Dialog>
</template>
