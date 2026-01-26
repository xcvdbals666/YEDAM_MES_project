<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';

const emit = defineEmits(['update:visible', 'selected-order']);

const props = defineProps({
  visible: { type: Boolean, required: true },
  qiOrderList: { type: Array, required: true }
});

const selectedOrders = ref([]);

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
    header="지시서 불러오기"
    :style="{ width: '60vw' }"
  >
    <DataTable
      v-if="props.qiOrderList.length"
      v-model:selection="selectedOrders"
      :value="props.qiOrderList"
      dataKey="qio_code"
      selectionMode="multiple"
    >
      <Column selectionMode="multiple" style="width:3rem" />
      <Column field="qio_code" header="품질검사지시코드" />
      <Column field="inspect_type" header="검사유형" />
      <Column field="mat_name" header="제품명"" />
      <Column header="완료일자">
        <template #body="{ data }">
          {{ formatDate(data.insp_date) }}
        </template>
      </Column>
    </DataTable>

    <p v-else>조회할 지시코드 내용이 없습니다</p>

    <template #footer>
      <Button
        label="확인"
        @click="emit('selected-order', selectedOrders)"
      />
      <Button
        label="취소"
        severity="secondary"
        @click="visibleProxy = false"
      />
    </template>
  </Dialog>
</template>
