<script setup>
import { ref, watch, onMounted, computed } from 'vue';

const props = defineProps({
  modelValue: Array,
  isEditable: Boolean,
  isEditMode: Boolean
});
const emit = defineEmits(['update:modelValue', 'selecteMaterial']);

const rows = computed({
  get: () => (Array.isArray(props.modelValue) ? props.modelValue : []),
  set: (val) => emit('update:modelValue', val)
});

const selectedRows = ref([]); // 체크박스

// 행 추가
const addRow = () => {
  emit('update:modelValue', [
    ...rows.value,
    {
      __key: Date.now() + Math.random(),
      sourceType: 'manual',
      mprDCode: null,
      is_deleted: false,
      materialName: '',
      reqQtt: null,
      unitCode: '',
      unitLabel: '',
      note: '',
      matSup: null,
      clientName: '',
      matCode: ''
    }
  ]);
};

// 행 삭제
const removeRow = () => {
  const updated = rows.value.map((row) => (selectedRows.value.includes(row) ? { ...row, is_deleted: true } : row));

  emit('update:modelValue', updated);
  selectedRows.value = [];
};

// 화면에 보여줄 것만 필터링
const visibleRows = computed(() => rows.value.filter((row) => !row.is_deleted));
watch(
  () => visibleRows.value.length,
  (len) => {
    if (len === 0 && props.isEditable && !props.isEditMode) {
      addRow();
    }
  }
);

// 첫 행 자동 추가
onMounted(() => {
  if (!rows.value.length) {
    emit('update:modelValue', [
      {
        __key: Date.now() + Math.random(),
        sourceType: 'manual',
        mprDCode: null,
        is_deleted: false,
        materialName: '',
        reqQtt: null,
        unitCode: '',
        unitLabel: '',
        note: '',
        matSup: null,
        clientName: '',
        matCode: ''
      }
    ]);
  }
});

const rowClass = (data) => {
  if (data.sourceType === 'mrp') {
    return 'row-mrp';
  }
  return '';
};
</script>

<template>
  <div class="card mt-10 min-h-[520px]">
    <div class="flex justify-between align-items-center mb-3">
      <h4 class="m-0">요청 자재</h4>

      <div class="flex gap-2">
        <Button label="자재추가" @click="addRow" class="px-3 py-1 h-[35px] text-sm gap-2" :disabled="!isEditable" />
        <Button label="자재삭제" severity="danger" class="px-3 py-1 h-[35px] text-sm gap-2" @click="removeRow" :disabled="!selectedRows.length || !isEditable" />
      </div>
    </div>

    <DataTable
      :value="visibleRows"
      v-model:selection="selectedRows"
      :selectionMode="isEditable ? 'checkbox' : null"
      dataKey="__key"
      showGridlines
      tableStyle="table-layout: fixed; width: 100%;"
      class="p-datatable-sm"
      scrollable
      scroll-height="360px"
      :paginator="true"
      :rows="10"
      :rowClass="rowClass"
    >
      <Column selectionMode="multiple" headerStyle="width: 48px; padding: 8px;" />

      <Column header="자재코드" headerStyle="width: 120px; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.matCode" placeholder="자재선택" :disabled="!isEditable" readonly class="w-full" @click="isEditable && emit('selecteMaterial', data)" />
        </template>
      </Column>

      <Column header="자재명" headerStyle="width: 220px; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.materialName" :disabled="!isEditable" class="w-full" />
        </template>
      </Column>

      <Column header="현재고" headerStyle="width: 110px; padding: 10px;" bodyStyle="padding: 0.5rem">
        <template #body="{ data }">
          <InputText v-model="data.curQtt" :disabled="!isEditable" class="w-full text-right" placeholder="0" />
        </template>
      </Column>

      <Column header="부족수량" headerStyle="width: 110px; padding: 10px;" bodyStyle="padding: 0.5rem">
        <template #body="{ data }">
          <InputText v-model="data.lackQtt" :disabled="!isEditable" class="w-full text-right" placeholder="0" />
        </template>
      </Column>

      <Column header="요청수량" headerStyle="width: 110px; padding: 10px;" bodyStyle="padding: 0.5rem">
        <template #body="{ data }">
          <InputText v-model="data.reqQtt" :disabled="!isEditable" class="w-full text-right" placeholder="0" />
        </template>
      </Column>

      <Column header="단위" headerStyle="width: 80px; padding: 10px;" bodyStyle="padding: 0.5rem">
        <template #body="{ data }">
          <InputText v-model="data.unitLabel" :disabled="!isEditable" class="w-full" />
        </template>
      </Column>

      <Column header="공급업체" headerStyle="width: 160px; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.clientName" :disabled="!isEditable" class="w-full" />
        </template>
      </Column>

      <Column header="비고" headerStyle="padding: 10px">
        <template #body="{ data }">
          <InputText v-model="data.note" :disabled="!isEditable" class="w-full" />
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

:deep(.row-mrp) {
  background-color: #eff6ff;
}
</style>
