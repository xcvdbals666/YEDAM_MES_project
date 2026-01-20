<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: Array
});
const emit = defineEmits(['update:modelValue', 'selectedMaterial']);

const rows = ref([]);
const selectedRows = ref([]); // 체크박스

// 타입 확인용(오류 방지)
watch(
  () => props.modelValue,
  (v) => {
    if (Array.isArray(v)) rows.value = v;
    else rows.value = [];
  },
  { immediate: true }
);

// 변경사항 MprPurchaseRequest에 적용
watch(rows, (v) => emit('update:modelValue', v), { deep: true });

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
  <div class="card mt-10 min-h-[530px]">
    <div class="flex justify-between align-items-center mb-3">
      <h4 class="m-0">요청 자재</h4>

      <div class="flex gap-2">
        <Button label="자재추가" @click="addRow" class="px-3 py-1 h-[35px] text-sm gap-2" />
        <Button label="자재삭제" severity="danger" class="px-3 py-1 h-[35px] text-sm gap-2" @click="removeRow" :disabled="!selectedRows.length" />
      </div>
    </div>

    <DataTable :value="rows" v-model:selection="selectedRows" selectionMode="checkbox" dataKey="__key" tableStyle="table-layout: fixed; width: 100%;" class="p-datatable-sm" scrollable scroll-height="435px">
      <Column selectionMode="multiple" headerStyle="width: 48px; background-color: #f9fafb; padding: 10px;" />

      <Column header="자재코드" headerStyle="width: 120px; background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.matCode" placeholder="자재선택" readonly class="w-full" @click="emit('selectedMaterial', data)" />
        </template>
      </Column>

      <Column header="자재명" headerStyle="width: 220px; background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.materialName" class="w-full" />
        </template>
      </Column>

      <Column header="요청수량" headerStyle="width: 110px; background-color: #f9fafb; padding: 10px;" bodyStyle="padding: 0.5rem">
        <template #body="{ data }">
          <InputText v-model="data.reqQtt" class="w-full text-right" placeholder="0" />
        </template>
      </Column>

      <Column header="단위" headerStyle="width: 80px; background-color: #f9fafb; padding: 10px;" bodyStyle="padding: 0.5rem">
        <template #body="{ data }">
          <InputText v-model="data.unitLabel" class="w-full" />
        </template>
      </Column>

      <Column header="공급업체" headerStyle="width: 160px; background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.clientName" class="w-full" />
        </template>
      </Column>

      <Column header="비고" headerStyle="background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }">
          <InputText v-model="data.note" class="w-full" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
