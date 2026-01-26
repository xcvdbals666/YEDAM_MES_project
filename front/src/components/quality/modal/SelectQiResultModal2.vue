<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue';

const selectedProducts = ref([]);

const emit = defineEmits([
  'update:visible',
  'selected-result'
]);

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  qiResultList: {
    type: Array,
    required: true
  }
});

const visibleProxy = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
};
</script>

<template>
  <Dialog
    v-model:visible="visibleProxy"
    modal
    closable
    header="결과서 불러오기"
    :style="{ width: '60vw' }"
  >
    <DataTable
      v-if="props.qiResultList.length > 0"
      v-model:selection="selectedProducts"
      :value="props.qiResultList"
      dataKey="qir_code"
      selectionMode="multiple"
    >
      <Column selectionMode="multiple" style="width: 3rem" />
      <Column field="qir_code" header="품질검사결과코드" />
      <Column field="inspection_item" header="검사항목" />
      <Column field="result" header="품질결과" />
      <Column header="완료일자">
        <template #body="{ data }">
          {{ formatDate(data.end_date) }}
        </template>
      </Column>
    </DataTable>

    <p v-else>조회할 지시코드 내용이 없습니다</p>

    <template #footer>
      <Button
        label="확인"
        @click="emit('selected-result', selectedProducts)"
      />
      <Button
        label="취소"
        severity="secondary"
        @click="visibleProxy = false"
      />
    </template>
  </Dialog>
</template>
