<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Select from 'primevue/select';

const props = defineProps({
  list: {
    type: Array,
    default: () => []
  },
  searchValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['search', 'select', 'reset']);

const selectedRow = ref(null);

const matTypeOptions = [
  { label: '전체', value: 'ALL' },
  { label: '원자재', value: 'i4' },
  { label: '부자재', value: 'i3' }
];

const statusOptions = [
  { label: '전체', value: 'ALL' },
  { label: '발주 필요', value: 'd4' },
  { label: '부족', value: 'd1' },
  { label: '정상', value: 'd2' },
  { label: '과다', value: 'd3' }
];

const onRowSelect = (e) => {
  if (!e?.data) return;
  selectedRow.value = e.data;
  emit('select', e.data.mat_code);
};

const statusClass = (code) => {
  switch (code) {
    case 'd2':
      return 'text-green-500';
    case 'd4':
      return 'text-blue-500';
    case 'd1':
      return 'text-orange-500';
    case 'd3':
      return 'text-red-500';
    default:
      return '';
  }
};
</script>

<template>
  <div class="card h-[833px] flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold">자재 재고 현황</h3>

      <div class="flex gap-2">
        <Button icon="pi pi-undo" label="초기화" severity="secondary" class="h-[38px]" @click="emit('reset')" />
        <Button icon="pi pi-search" label="조회" class="bg-green-500 border-none h-[38px]" @click="emit('search')" />
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 items-center mb-4">
      <div class="flex items-center gap-2">
        <label class="text-gray-600 w-12 shrink-0">검색</label>
        <InputText v-model="searchValue.keyword" placeholder="자재코드 / 자재명" class="flex-1" />
      </div>

      <div class="flex items-center gap-2">
        <label class="text-gray-600 w-12 shrink-0">분류</label>
        <Select v-model="searchValue.matType" :options="matTypeOptions" optionLabel="label" optionValue="value" class="flex-1" />
      </div>

      <div class="flex items-center gap-2">
        <label class="text-gray-600 w-12 shrink-0">상태</label>
        <Select v-model="searchValue.stockStatus" :options="statusOptions" optionLabel="label" optionValue="value" class="flex-1" />
      </div>
    </div>

    <h4 class="mb-2">
      재고 목록
      <span class="text-sm"> (총 {{ list.length }}건) </span>
    </h4>
    <div class="flex-1">
      <DataTable :value="list" dataKey="mat_code" v-model:selection="selectedRow" selectionMode="single" @rowSelect="onRowSelect" scrollable scrollHeight="560px" showGridlines emptyMessage="데이터가 없습니다." rowHover :paginator="true" :rows="10">
        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>

        <Column field="mat_code" header="자재코드" />
        <Column field="mat_name" header="자재명" />
        <Column field="mat_type_name" header="분류" />
        <Column field="current_qty" header="현재 재고" />

        <Column header="재고 상태">
          <template #body="{ data }">
            <span class="flex items-center gap-2" :class="statusClass(data.stock_status_code)">
              <i class="pi pi-circle-fill text-xs"></i>
              {{ data.stock_status_name }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-datatable.p-datatable-gridlines .p-datatable-table th:not(:first-child)),
:deep(.p-datatable.p-datatable-gridlines .p-datatable-table td:not(:first-child)) {
  border-left: 0 !important;
}
</style>
