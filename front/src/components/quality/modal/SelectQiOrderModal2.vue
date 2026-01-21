<script setup>
import { defineProps, ref } from 'vue';

const selectedProducts = ref([]); // 복수 선택 배열

const props = defineProps({
  display: { type: Boolean, required: true },
  qiOrderList: { type: Array, required: true }
});
</script>

<template>
  <Dialog :visible="props.display" :breakpoints="{ '960px': '90vw' }" :style="{ width: '30vw' }" modal @hide="$emit('close')">
    <DataTable ref="dt" v-model:selection="selectedProducts" :value="props.qiOrderList" dataKey="qio_code" selectionMode="multiple" v-if="props.qiOrderList.length > 0">
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <h4 class="m-0">지시서 불러오기</h4>
        </div>
      </template>

      <Column selectionMode="multiple" style="width: 3rem" />
      <Column field="qio_code" header="품질검사지시코드" headerClass="header-large" />
      <Column field="qio_date" header="지시일자" headerClass="header-large" />
    </DataTable>

    <p v-else class="leading-normal m-0">조회할 지시코드 내용이 없습니다</p>

    <template #footer>
      <Button label="확인" @click="$emit('selectedOrder', selectedProducts)" />
      <Button label="취소" severity="secondary" @click="$emit('close')" />
    </template>
  </Dialog>
</template>

<style>
.header-large {
  font-size: 1.2rem; /* 헤더만 커짐 */
  font-weight: 600; /* optional: 글씨 두껍게 */
}
</style>
