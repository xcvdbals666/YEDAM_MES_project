<!-- 검사 결과서 - 관리 결과서 불러오기 모달창-->
<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  display: { type: Boolean, required: true },
  qiOrderList: { type: Array, required: true }
});
</script>
<template>
  <Dialog v-model:visible="props.display" @update:visible="$emit('close')" :breakpoints="{ '960px': '75vw' }" :style="{ width: '50vw' }" :modal="true">
    <DataTable ref="dt" v-model:selection="selectedProducts" :value="props.qiOrderList" dataKey="prdp_code" v-if="props.qiOrderList.length > 0">
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <h4 class="m-0">검사결과서 불러오기</h4>
        </div>
      </template>
      <Column selectionMode="single" style="width: 3rem" :exportable="true"></Column>
      <Column field="qio_code" header="검사지시서  코드" sortable style="min-width: 12rem"></Column>
      <Column field="emp_name" header="검사자" sortable style="min-width: 12rem"></Column>
      <Column field="start_date" header="시작일시" sortable style="min-width: 12rem"></Column>
    </DataTable>
    <p v-else class="leading-normal m-0">현재 죄회할 내용이 없습니다.</p>

    <template #footer>
      <Button label="확인" @click="$emit('selectQirList', selectedProducts)" v-if="props.qiOrderList.length > 0" />
      <Button label="확인" @click="$emit('close')" v-else />
      <Button label="취소" severity="secondary" @click="$emit('close')" />
    </template>
  </Dialog>
</template>
