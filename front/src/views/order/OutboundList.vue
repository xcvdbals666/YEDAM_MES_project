<!-- /src/viewsds/order/OutboundList.vue -->
<script setup>
import { onMounted, ref } from 'vue';
import { useOrderStore } from '@/stores/order1';

const orderStore = useOrderStore();

onMounted(async () => {
  await orderStore.fetchOutbound();
  console.log('store :', orderStore.outboundList);
});

// 페이지네이션
const page = ref(1);
const rows = ref(13);

// 페이지 변경
const onPageChange = (e) => {
  page.value = e.page + 1;
  rows.value = e.rows;
  selectedRows.value = [];
};

// checkbox
const selectedRows = ref([]);

// 날짜 포맷
const formatDate = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};
</script>
<template>
  <div>
    <h1>출고 요청 목록 페이지</h1>
  </div>
  <!-- 목록 -->
  <section class="flex flex-col flex-1 bg-white px-6 pt-6 pb-6 rounded-xl shadow-sm border border-gray-200">
    <div class="flex justify-between items-center">
      <p class="text-lg font-bold text-gray-800">검색 결과</p>

      <div class="flex gap-2 pb-6">
        <Button label="엑셀 다운로드" raised icon="pi pi-file-excel" @click="openAddModal" />
      </div>
    </div>

    <div class="flex-1 overflow-auto rounded-lg border border-gray-200">
      <DataTable :value="orderStore.outboundList" v-model:selection="selectedRows" dataKey="out_req_code" :paginator="true" :rows="rows" :rowHover="true" showGridlines @page="onPageChange" :selectionPageOnly="true" tableLayout="fixed">
        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>

        <Column selectionMode="multiple" headerStyle="width:28px" />

        <Column header="출고 번호" headerClass="table-header" bodyClass="table-body" style="width: 150px">
          <template #body="{ data }">
            {{ data.out_req_code }}
          </template>
        </Column>

        <Column header="출고 제품" headerClass="table-header" bodyClass="table-body" style="width: 200px">
          <template #body="{ data }">
            {{ data.prod_name }}
          </template>
        </Column>

        <Column header="요청 수량" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            {{ data.req_qtt }}
          </template>
        </Column>

        <Column header="실출고 수량" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            {{ data.outbnd_qtt }}
          </template>
        </Column>

        <Column header="미출고 수량" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            {{ data.real_qtt }}
          </template>
        </Column>

        <Column header="출고 요청일" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            {{ formatDate(data.out_req_date) }}
          </template>
        </Column>

        <Column header="출고 담당자" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            {{ data.emp_name }}
          </template>
        </Column>

        <Column header="거래처" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            {{ data.client_name }}
          </template>
        </Column>

        <Column header="상태" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            <Tag :value="data.ord_stat === 'a1' ? '출고완료' : '출고 대기'" :severity="data.ord_stat === 'a1' ? 'success' : 'warning'" rounded />
          </template>
        </Column>
      </DataTable>
    </div>
  </section>
</template>
<style scoped>
:deep(.p-datatable-thead > tr > th) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f3f4f6;
}

:deep(.table-header .p-datatable-column-header-content) {
  justify-content: center;
}

:deep(.table-body) {
  text-align: center;
  color: #374151;
}

:deep(.status-tag) {
  font-size: 0.8rem;
  padding: 0.35rem 0.75rem;
}
</style>
