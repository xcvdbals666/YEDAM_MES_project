<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  list: {
    type: Array,
    default: () => []
  }
});

const router = useRouter();

// 체크박스
const selectedRows = ref([]);

// 날짜 포맷
const formatDate = (val) => {
  const d = new Date(val);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

watch(props.list, () => {
  selectedRows.value = [];
});

// 상세보기
const goDetail = (row) => {
  router.push({
    name: 'mprRequestDetail',
    params: { mprCode: row.mpr_code }
  });
};
</script>
<template>
  <div class="card mt-10 min-h-[520px]">
    <div class="flex justify-between align-items-center mb-3">
      <h4 class="m-0">요청 자재 목록</h4>

      <div class="flex gap-2">
        <Button icon="pi pi-file-excel" label="엑셀 다운로드" class="px-3 py-1 h-[35px] text-sm gap-2" />
      </div>
    </div>

    <div class="flex justify-between items-center mb-2">
      <span
        >총 <span class="font-black">{{ props.list.length }}</span
        >건</span
      >
    </div>

    <DataTable
      :value="props.list"
      dataKey="mpr_code"
      v-model:selection="selectedRows"
      selectionMode="checkbox"
      showGridlines
      tableStyle="table-layout: fixed; width: 100%;"
      class="p-datatable-sm"
      scrollable
      scroll-height="355px"
      :paginator="true"
      :rows="10"
      @row-click="goDetail($event.data)"
    >
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>

      <Column selectionMode="multiple" headerStyle="width: 48px; padding: 8px; " />

      <Column header="요청번호" field="mpr_code" sortable headerStyle="width: 160px; padding: 8px;">
        <template #body="{ data }">{{ data.mpr_code }}</template>
      </Column>

      <Column header="자재" field="mat_summary" headerStyle="width: 160px; padding: 8px;" />

      <Column header="요청일자" field="reqdate" sortable headerStyle="width: 130px; padding: 8px;">
        <template #body="{ data }">
          {{ data.reqdate ? formatDate(data.reqdate) : '-' }}
        </template>
      </Column>

      <Column header="납기일자" field="deadline" sortable headerStyle="width: 130px; padding: 8px;">
        <template #body="{ data }">
          {{ data.deadline ? formatDate(data.deadline) : '-' }}
        </template>
      </Column>

      <Column header="MRP 계획번호" field="mrp_code" sortable headerStyle="width: 160px; padding: 8px;">
        <template #body="{ data }">{{ data.mrp_code ? data.mrp_code : '-' }}</template>
      </Column>

      <Column header="요청자" field="mcode" sortable headerStyle="width: 120px; padding: 8px;">
        <template #body="{ data }">{{ data.mcode }}</template>
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

/* 바디 셀 높이 */
:deep(.p-datatable.p-datatable-sm .p-datatable-tbody > tr > td) {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

/* 헤더 셀 높이 */
:deep(.p-datatable.p-datatable-sm .p-datatable-thead > tr > th) {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
