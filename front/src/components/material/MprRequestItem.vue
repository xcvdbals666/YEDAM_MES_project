<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: Array
});
const emit = defineEmits(['update:modelValue', 'selecteMaterial']);

const rows = ref([]);
const selectedRows = ref([]); // 체크박스

// 타입 확인용(오류 방지)
watch(
  () => props.modelValue,
  (val) => {
    if (Array.isArray(val)) rows.value = val;
    else rows.value = [];
  },
  { immediate: true }
);

// 변경사항 MprPurchaseRequest에 적용
watch(rows, (val) => emit('update:modelValue', val), { deep: true });

// 행 추가
const addRow = () => {
  rows.value.push({
    __key: Date.now() + Math.random(),
    mprDCode: '',
    materialName: '',
    reqQtt: null,
    unit: '',
    clientName: '',
    note: ''
  });
};

// 행 삭제
const removeRow = () => {
  if (rows.value.length === selectedRows.value.length) {
    rows.value = [];
    addRow(); // 최소 행 하나는 유지
  } else {
    rows.value = rows.value.filter((row) => !selectedRows.value.includes(row));
  }
  selectedRows.value = [];
};

// 첫 행 자동 추가
onMounted(() => {
  if (!rows.value.length) {
    addRow();
  }
});
</script>

<template>
  <div class="card mt-10 min-h-[520px]">
    <div class="flex justify-between align-items-center mb-3">
      <h4 class="m-0">요청 자재</h4>

      <div class="flex gap-2">
        <Button label="자재추가" @click="addRow" class="px-3 py-1 h-[35px] text-sm gap-2" />
        <Button label="자재삭제" severity="danger" class="px-3 py-1 h-[35px] text-sm gap-2" @click="removeRow" :disabled="!selectedRows.length" />
      </div>
    </div>

    <DataTable :value="rows" v-model:selection="selectedRows" selectionMode="checkbox" dataKey="__key" showGridlines tableStyle="table-layout: fixed; width: 100%;" class="p-datatable-sm" scrollable scroll-height="360px" :paginator="true" :rows="10">
      <Column selectionMode="multiple" headerStyle="width: 48px; padding: 8px;" />

      <Column header="자재코드" headerStyle="width: 120px; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.matCode" placeholder="자재선택" readonly class="w-full" @click="emit('selecteMaterial', data)" />
        </template>
      </Column>

      <Column header="자재명" headerStyle="width: 220px; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.materialName" class="w-full" />
        </template>
      </Column>

      <Column header="요청수량" headerStyle="width: 110px; padding: 10px;" bodyStyle="padding: 0.5rem">
        <template #body="{ data }">
          <InputText v-model="data.reqQtt" class="w-full text-right" placeholder="0" />
        </template>
      </Column>

      <Column header="단위" headerStyle="width: 80px; padding: 10px;" bodyStyle="padding: 0.5rem">
        <template #body="{ data }">
          <InputText v-model="data.unitLabel" class="w-full" />
        </template>
      </Column>

      <Column header="공급업체" headerStyle="width: 160px; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.clientName" class="w-full" />
        </template>
      </Column>

      <Column header="비고" headerStyle="padding: 10px">
        <template #body="{ data }">
          <InputText v-model="data.note" class="w-full" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<style scoped>
/* 내부 컬럼 사이 세로선만 제거 */
:deep(.p-datatable.p-datatable-gridlines .p-datatable-table th:not(:first-child)),
:deep(.p-datatable.p-datatable-gridlines .p-datatable-table td:not(:first-child)) {
  border-left: 0 !important;
}
</style>
