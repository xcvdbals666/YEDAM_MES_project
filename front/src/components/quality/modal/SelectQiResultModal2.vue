<!--SelectQiResultModal2.vue-->
<!--품질결과 목록조회 모달-->

<script setup>
import { defineProps, ref } from 'vue';

const selectedProducts = ref([]);

const props = defineProps({
  display: { type: Boolean, required: true },
  qiResultList: { type: Array, required: true }
});

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
};
</script>

<template>
  <Dialog :visible="props.display" :breakpoints="{ '960px': '90vw' }" :style="{ width: '30vw' }" modal @hide="$emit('close')">
    <DataTable ref="dt" v-model:selection="selectedProducts" :value="props.qiResultList" dataKey="qir_code" selectionMode="multiple" v-if="props.qiResultList.length > 0">
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <h4 class="m-0">결과서 불러오기</h4>
        </div>
      </template>

      <Column selectionMode="multiple" style="width: 3rem" />
      <Column field="qir_code" header="품질검사결과코드" headerClass="header-large" />
      <Column header="완료일자" headerClass="header-large">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.end_date) }}
        </template>
      </Column>
    </DataTable>

    <p v-else class="leading-normal m-0">조회할 지시코드 내용이 없습니다</p>

    <template #footer>
      <Button label="확인" @click="$emit('selectedResult', selectedProducts)" />
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
