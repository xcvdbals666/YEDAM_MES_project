<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMaterialStore } from '@/stores/material2';

const router = useRouter();
const store = useMaterialStore();

const props = defineProps({
  mprCode: {
    type: String,
    required: true
  }
});

onMounted(() => {
  store.fetchDetailItem(props.mprCode);
});
</script>

<template>
  <!-- ← 목록으로 -->
  <div class="mb-4">
    <Button icon="pi pi-arrow-left" label="목록으로" severity="secondary" @click="router.back()" />
  </div>

  <!-- 요청기본정보 -->
  <div class="card mb-5">
    <div class="border-b pb-2 mb-4">
      <h4 class="font-semibold">요청기본정보</h4>
    </div>

    <table class="w-full">
      <colgroup>
        <col class="w-32" />
        <col />
        <col class="w-32" />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <th>요청번호</th>
          <td>-</td>
          <th>요청일자</th>
          <td>-</td>
        </tr>
        <tr>
          <th>요청자</th>
          <td>-</td>
          <th>요청부서</th>
          <td>-</td>
        </tr>
        <tr>
          <th>현재상태</th>
          <td colspan="3">-</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 요청 자재 상세 -->
  <div class="card min-h-[500px]">
    <div class="border-b pb-2 mb-4">
      <h4 class="font-semibold">요청 자재 상세</h4>
    </div>

    <DataTable :value="store.mprItems" showGridlines class="p-datatable-sm" tableStyle="table-layout: fixed; width: 100%;" :paginator="true" :rows="10">
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>

      <Column header="제품명" field="mat_name" headerStyle="width: 280px; padding: 8px 20px;" bodyStyle="padding: 8px 20px;" />

      <Column header="자재코드" field="mat_code" headerStyle="width: 200px;" bodyStyle="white-space: nowrap;" />

      <Column header="수량" field="req_qtt" headerStyle="width: 150px" />

      <Column header="단위" field="unit_label" headerStyle="width: 150px" />

      <Column header="공급업체" field="client_name" headerStyle="width: 200px;" />

      <Column header="비고" headerStyle="width: auto;">
        <template #body="{ data }">
          {{ data.note ? data.note : '-' }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
/* 요청기본정보 테이블 */
th {
  text-align: left;
  padding: 10px 12px;
  font-weight: 600;
  white-space: nowrap;
}

td {
  padding: 8px 12px;
}

/* 내부 세로선 제거 */
:deep(.p-datatable.p-datatable-gridlines .p-datatable-table th:not(:first-child)),
:deep(.p-datatable.p-datatable-gridlines .p-datatable-table td:not(:first-child)) {
  border-left: 0 !important;
}
</style>
