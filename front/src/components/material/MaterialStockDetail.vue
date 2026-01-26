<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
  detail: {
    type: Object,
    default: null
  },
  suppliers: {
    type: Array,
    default: () => []
  },
  inout: {
    type: Array,
    default: () => []
  },
  loading: Boolean
});

const stockStatusClass = (code) => {
  switch (code) {
    case 'd4':
      return 'text-blue-500 font-semibold';
    case 'd1':
      return 'text-orange-500 font-semibold';
    case 'd2':
      return 'text-green-500 font-semibold';
    case 'd3':
      return 'text-red-500 font-semibold';
    default:
      return '';
  }
};
</script>

<template>
  <div v-if="loading" class="text-center py-12 text-gray-400">로딩중...</div>

  <div v-else-if="detail" class="h-[650px] overflow-auto pr-2">
    <!-- 기본 정보 -->
    <section class="mb-8 p-4 border rounded bg-gray-50">
      <h5 class="border-b border-blue-500 pb-1 mb-4 font-semibold">기본 정보</h5>

      <div class="grid grid-cols-2 gap-x-4 gap-y-2">
        <div>자재코드 : {{ detail.mat_code }}</div>
        <div>자재명 : {{ detail.mat_name }}</div>
        <div>분류 : {{ detail.mat_type_name ? detail.mat_type_name : '-' }}</div>
        <div>단위 : {{ detail.unit_label }}</div>
        <div class="col-span-2">규격 : {{ detail.spec }}</div>
      </div>
    </section>

    <!-- 재고 정보 -->
    <section class="mb-8 p-4 border rounded bg-gray-50">
      <h5 class="border-b border-green-500 pb-1 mb-4 font-semibold">재고 정보</h5>

      <div class="grid grid-cols-2 gap-x-4 gap-y-2">
        <div>현재 재고 : {{ detail.current_qty }}</div>
        <div>안전 재고 : {{ detail.save_inven }}</div>
        <div class="col-span-2" :class="stockStatusClass(detail.stock_status_code)">재고 상태 : {{ detail.stock_status_name }}</div>
      </div>
    </section>

    <!-- 공급업체별 -->
    <section class="mb-8 p-4 border rounded bg-gray-50">
      <h5 class="border-b border-orange-500 pb-1 mb-4 font-semibold">상세 재고 (공급업체별)</h5>

      <template v-if="suppliers.length">
        <DataTable :value="suppliers" scrollable scrollHeight="200px">
          <Column field="client_name" header="공급업체" />
          <Column field="inbnd_qtt" header="수량" />
          <Column field="inbnd_date" header="입고일" />
          <Column field="lot_num" header="LOT번호" />
        </DataTable>
      </template>

      <div v-else class="text-center text-gray-400 py-6">데이터 없음</div>
    </section>

    <!-- 입출고 -->
    <section class="p-4 border rounded bg-gray-50">
      <h5 class="border-b border-red-500 pb-1 mb-4 font-semibold">최근 입출고 이력</h5>

      <template v-if="inout.length">
        <DataTable :value="inout" scrollable scrollHeight="200px">
          <Column field="process_date" header="일시" />
          <Column field="io_type" header="구분">
            <template #body="{ data }">
              {{ data.io_type === 'IN' ? '입고' : '출고' }}
            </template>
          </Column>
          <Column field="qty" header="수량" />
          <Column field="client_name" header="공급업체" />
          <Column field="emp_name" header="담당자" />
        </DataTable>
      </template>

      <div v-else class="text-center text-gray-400 py-6">데이터 없음</div>
    </section>
  </div>

  <div v-else class="text-center py-12 text-gray-400">좌측 목록에서 자재를 선택해주세요</div>
</template>
