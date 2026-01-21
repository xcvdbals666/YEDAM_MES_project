<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  list: {
    type: Array,
    default: () => []
  }
});

// 체크박스
const selectedRows = ref([]);

// 단위 매핑
const UNIT_MAP = {
  h1: 'kg',
  h2: 't',
  h3: 'L',
  h4: 'ea',
  h5: 'box',
  h6: 'g',
  h7: 'mm',
  h8: '%',
  h9: 'cm',
  ha: 'N'
};

// 날짜 포맷
const formatDate = (v) => {
  const d = new Date(v);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

watch(props.list, () => {
  selectedRows.value = [];
});
</script>
<template>
  <div class="card mt-10 min-h-[450px]">
    <div class="flex justify-between align-items-center mb-3">
      <h4 class="m-0">요청 자재 목록</h4>

      <div class="flex gap-2">
        <Button icon="pi pi-file-excel" label="엑셀 다운로드" class="px-3 py-1 h-[35px] text-sm gap-2" />
      </div>
    </div>

    <DataTable :value="props.list" dataKey="row_key" v-model:selection="selectedRows" selectionMode="checkbox" tableStyle="table-layout: fixed; width: 100%;" class="p-datatable-sm" scrollable scroll-height="345px">
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>
      <Column selectionMode="multiple" headerStyle="width: 48px; background-color: #f9fafb; padding: 10px;" />

      <Column header="요청번호" field="mpr_code" sortable headerStyle="width: 200px; background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }">{{ data.mpr_code }} </template>
      </Column>

      <Column header="자재명" field="mat_name" sortable headerStyle="width: 300px; background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }"> {{ data.mat_name }}</template>
      </Column>

      <Column header="자재코드" field="mat_code" sortable headerStyle="width: 150px; background-color: #f9fafb; padding: 10px;" bodyStyle="padding: 0.5rem">
        <template #body="{ data }"> {{ data.mat_code }}</template>
      </Column>

      <Column header="요청일자" field="reqdate" sortable headerStyle="width: 150px; background-color: #f9fafb; padding: 10px;" bodyStyle="padding: 0.5rem">
        <template #body="{ data }"> {{ formatDate(data.reqdate) }}</template>
      </Column>

      <Column header="요청수량" field="req_qtt" sortable headerStyle="width: 160px; background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }"> {{ data.req_qtt }}</template>
      </Column>

      <Column header="단위" field="unit" sortable headerStyle="background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }">{{ UNIT_MAP[data.unit] || data.unit }} </template>
      </Column>

      <Column header="공급업체" field="client_name" sortable headerStyle="background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }">{{ data.client_name }} </template>
      </Column>
    </DataTable>
  </div>
</template>
