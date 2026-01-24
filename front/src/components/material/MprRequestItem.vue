<script setup>
import { ref, watch, onMounted, computed } from 'vue';

const props = defineProps({
  modelValue: Array,
  isEditable: Boolean,
  isEditMode: Boolean,
  mrpCode: {
    type: String,
    default: null
  }
});
const emit = defineEmits(['update:modelValue', 'selecteMaterial']);

const rows = computed({
  get: () => (Array.isArray(props.modelValue) ? props.modelValue : []),
  set: (val) => emit('update:modelValue', val)
});

const selectedRows = ref([]);

// 행 추가 (수동 자재만 추가됨)
const addRow = () => {
  emit('update:modelValue', [
    ...rows.value,
    {
      __key: Date.now() + Math.random(),
      sourceType: 'manual',
      mprDCode: null,
      is_deleted: false,
      materialName: '',
      curQtt: null,
      lackQtt: null,
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
// MRP 자재는 삭제 대상에서 제외
const removeRow = () => {
  const updated = rows.value.map((row) => {
    if (selectedRows.value.includes(row)) {
      if (props.isEditMode && row.sourceType === 'mrp') {
        return row;
      }
      return { ...row, is_deleted: true };
    }
    return row;
  });

  emit('update:modelValue', updated);
  selectedRows.value = [];
};

// 화면 표시용 (삭제 제외)
const visibleRows = computed(() => rows.value.filter((row) => !row.is_deleted));

// 수정 모드가 아닐 때만 빈 행 자동 추가
watch(
  () => visibleRows.value.length,
  (len) => {
    if (len === 0 && props.isEditable && !props.isEditMode) {
      addRow();
    }
  }
);

// 최초 진입 시 1행 보장
onMounted(() => {
  if (!rows.value.length && !props.isEditMode) {
    addRow();
  }
});

const rowSelectable = (row) => {
  // 수정 모드 + MRP 자재는 선택 불가
  if (props.isEditMode && row.sourceType === 'mrp') {
    return false;
  }
  return true;
};

// MRP 자재 행 스타일
const rowClass = (data) => {
  if (data.sourceType === 'mrp') {
    return 'row-mrp';
  }
  return '';
};

// 부족수량 tooltip 문구
const lackQtyTooltip = computed(() => {
  if (props.mrpCode) {
    return '선택한 MRP 계획을 기준으로 계산된 부족수량입니다.';
  }
  return '전체 생산계획 기준으로 계산된 참고용 부족수량입니다.';
});
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
      :rowSelectable="rowSelectable"
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
      <Column selectionMode="multiple" headerStyle="width: 48px; padding: 8px;">
        <template #body="{ data }">
          <Checkbox v-model="selectedRows" :value="data" :disabled="(props.isEditMode && data.sourceType === 'mrp') || !props.isEditable" />
        </template>
      </Column>

      <Column header="자재코드" headerStyle="width: 120px; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.matCode" readonly class="w-full" placeholder="자재 선택" :disabled="!isEditable || data.sourceType === 'mrp'" @click="isEditable && data.sourceType !== 'mrp' && emit('selecteMaterial', data)" />
        </template>
      </Column>

      <Column header="자재명" headerStyle="width: 220px; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.materialName" class="w-full" :disabled="!isEditable || data.sourceType === 'mrp'" />
        </template>
      </Column>

      <Column header="현재고" headerStyle="width: 110px; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.curQtt" class="w-full text-right" disabled />
        </template>
      </Column>

      <Column headerStyle="width: 110px; padding: 10px;">
        <template #header>
          <div class="flex items-center gap-1">
            <span>부족수량</span>
            <i class="pi pi-info-circle text-gray-400 cursor-pointer" v-tooltip.top="lackQtyTooltip" />
          </div>
        </template>
        <template #body="{ data }">
          <InputText v-model="data.lackQtt" class="w-full text-right" disabled />
        </template>
      </Column>

      <Column header="요청수량" headerStyle="width: 110px; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.reqQtt" class="w-full text-right" :disabled="!isEditable || data.sourceType === 'mrp'" />
        </template>
      </Column>

      <Column header="단위" headerStyle="width: 80px; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.unitLabel" class="w-full" :disabled="!isEditable || data.sourceType === 'mrp'" />
        </template>
      </Column>

      <Column header="공급업체" headerStyle="width: 160px; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.clientName" class="w-full" :disabled="!isEditable || data.sourceType === 'mrp'" />
        </template>
      </Column>

      <Column header="비고" headerStyle="padding: 10px">
        <template #body="{ data }">
          <InputText v-model="data.note" class="w-full" :disabled="!isEditable || data.sourceType === 'mrp'" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
:deep(.p-datatable.p-datatable-gridlines .p-datatable-table th:not(:first-child)),
:deep(.p-datatable.p-datatable-gridlines .p-datatable-table td:not(:first-child)) {
  border-left: 0 !important;
}

:deep(.row-mrp) {
  background-color: #eff6ff;
}
</style>
