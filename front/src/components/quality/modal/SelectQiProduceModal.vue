<script setup>
import { defineProps, ref, watch } from 'vue';

const selectedProducts = ref();

const props = defineProps({
  display: { type: Boolean, required: true },
  produceList: { type: Object, required: true },
  resetModal: { type: Boolean, required: true }
});

watch(
  () => props.resetModal,
  (resetModal) => {
    if (resetModal) {
      selectedProducts.value = [];
    }

    console.log('변화감지', resetModal);
  }
);
</script>
<template>
  <Dialog v-model:visible="props.display" @update:visible="$emit('close')" :breakpoints="{ '960px': '75vw' }" :style="{ width: '50vw' }" :modal="true">
    <DataTable ref="dt" v-model:selection="selectedProducts" :value="props.produceList" dataKey="prdr_code" v-if="props.produceList.length > 0">
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <h4 class="m-0">생산실적 불러오기</h4>
        </div>
      </template>
      <Column selectionMode="single" style="width: 3rem" :exportable="false"></Column>
      <Column field="prdp_code" header="생산계획 코드" sortable style="min-width: 12rem"></Column>
      <Column field="prod_name" header="제품명" sortable style="min-width: 12rem"></Column>
      <Column field="end_date" header="생산완료일" sortable style="min-width: 12rem"></Column>
      <Column field="production_qtt" header="생산량" sortable style="min-width: 12rem"></Column>
    </DataTable>
    <p v-else class="leading-normal m-0">현재 죄회할 내용이 없습니다.</p>
    <template #footer>
      <Button label="확인" @click="$emit('selectProd', selectedProducts)" v-if="props.produceList.length > 0" />
      <Button label="확인" @click="$emit('close')" v-else />
      <Button label="취소" severity="secondary" @click="$emit('close')" />
    </template>
  </Dialog>
</template>
