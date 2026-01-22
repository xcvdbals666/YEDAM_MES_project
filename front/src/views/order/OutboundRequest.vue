<script setup>
import { ref } from 'vue';
import { useOrderStore2 } from '@/stores/order2';
import SelectOrderModal from '@/components/order/SelectOrderModal.vue';
const user = JSON.parse(localStorage.getItem('user'));

const orderStore = useOrderStore2();
const showOrderModal = ref(false); // 모달 표시 여부

// 초기 상태 정의
const getInitialOutInfo = () => ({
  out_code: '',
  out_req_date: '',
  ord_code: '',
  ord_date: '',
  client_name: '',
  emp_name: ''
});

// 출고 요청 정보
const outInfo = ref(getInitialOutInfo());

// 제품 목록
const productList = ref([]);

// 모달 열기
const openOrderModal = () => {
  showOrderModal.value = true;
};

// 모달에서 선택 시
const selectOrder = async (selectedOrder) => {
  // console.log('선택된 주문:', selectedOrder);

  // 1. 스토어에 선택된 주문 정보 저장
  orderStore.setSelectedOrder(selectedOrder);

  // 2. ord_code로 상세 정보 조회
  await orderStore.fetchOrderDetailByProdCode(selectedOrder.ord_code);

  // 3. 출고 정보 복사
  outInfo.value.out_code = orderStore.outReqCode;
  outInfo.value.out_req_date = new Date().toISOString().split('T')[0];
  outInfo.value.ord_code = selectedOrder.ord_code;
  outInfo.value.ord_date = formatDate(selectedOrder.ord_date);
  outInfo.value.client_name = orderStore.orderDetail?.client_name || '';
  outInfo.value.emp_name = user.emp_name;

  // 4. 제품 목록 복사
  productList.value = orderStore.products.map((product) => ({
    ...product,
    out_amount: 0, // 출고수량
    pending_amount: product.ord_amount // 미출고수량(초기값은 주문수량)
  }));

  // 4. 모달 닫기
  showOrderModal.value = false;
};

// 출고수량 변경 시 미출고수량 자동 계산
const updatePendingAmount = (product) => {
  product.pending_amount = product.ord_amount - (product.out_amount || 0);
};

// 초기화
const resetFrom = () => {
  // 확인 메시지
  if (productList.value.length > 0) {
    if (!confirm('입력한 내용이 모두 초기화됩니다. 계속하시겠습니까?')) {
      return;
    }
  }

  // 출고 정보 초기화
  outInfo.value = getInitialOutInfo();

  // 제품 목록 초기화
  productList.value = [];

  // 스토어 초기화
  orderStore.resetOutboundRequest();
};

// 날짜 포맷
const formatDate = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
</script>
<template>
  <Fluid class="card">
    <!-- 헤더 -->
    <div class="header-section">
      <div class="text-2xl font-semibold">출고 요청</div>
      <div class="button-group">
        <Button label="초기화" severity="contrast" @click="resetFrom" />
        <Button label="삭제" severity="danger" />
        <Button label="출고 요청하기" severity="info" />
        <Button label="주문정보 불러오기" @click="openOrderModal" />
        <Button label="출고요청 불러오기" />
      </div>
    </div>

    <!-- 주문정보/출고요청 선택 -->
    <table class="w-full">
      <colgroup>
        <col style="width: 100px" />
        <col />
        <col style="width: 140px" />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <th>출고코드</th>
          <td><InputText class="w-full" v-model="outInfo.out_code" disabled /></td>

          <th>출고요청일</th>
          <td><InputText class="w-full" v-model="outInfo.out_req_date" disabled /></td>
        </tr>
        <tr>
          <th>주문코드</th>
          <td><InputText class="w-full" disabled v-model="outInfo.ord_code" /></td>

          <th>주문일자</th>
          <td><InputText class="w-full" disabled v-model="outInfo.ord_date" /></td>
        </tr>
        <tr>
          <th>거래처</th>
          <td><InputText class="w-full" disabled v-model="outInfo.client_name" /></td>

          <th>출고 요청 담당자</th>
          <td><InputText class="w-full" disabled v-model="outInfo.emp_name" /></td>
        </tr>
      </tbody>
    </table>
  </Fluid>

  <!-- 제품 목록 -->
  <Fluid class="card min-h-[500px]">
    <div class="border-b pb-2 mb-4">
      <h4 class="font-semibold">제품</h4>
    </div>

    <DataTable :value="productList" showGridlines class="p-datatable-sm" tableStyle="table-layout: fixed; width: 100%;" :paginator="true" :rows="10">
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>
      <Column header="제품명" field="prod_name" headerStyle="width: 200px; padding: 8px 20px;" bodyStyle="padding: 8px 20px;" />
      <Column header="유형" field="prod_type" headerStyle="width: 100px;" bodyStyle="white-space: nowrap;" />
      <Column header="규격" field="spec" headerStyle="width: 100px" />
      <Column header="단위" field="unit" headerStyle="width: 100px" />
      <Column header="주문 수량" field="ord_amount" headerStyle="width: 100px;" />

      <!-- 출고수량 입력 시 미출고수량 자동 계산 -->
      <Column header="출고 수량" headerStyle="width: 100px;">
        <template #body="{ data }">
          <InputNumber v-model="data.out_amount" :min="0" :max="Math.min(data.ord_amount, data.current_stock)" @update:modelValue="updatePendingAmount(data)" />
        </template>
      </Column>
      <Column header="미출고 수량" field="pending_amount" headerStyle="width: 100px;" />
      <Column header="현재 재고" field="current_stock" headerStyle="width: 100px;" />
      <Column header="납기일" headerStyle="width: 100px;">
        <template #body="{ data }">
          {{ formatDate(data.delivery_date) }}
        </template>
      </Column>
    </DataTable>
  </Fluid>

  <!-- 주문 검색 모달 -->
  <SelectOrderModal v-model:visible="showOrderModal" @select="selectOrder" />
</template>
<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

th,
td {
  padding: 8px 0;
  vertical-align: middle;
}

.button-group {
  display: flex;
  gap: 6px;
}

.button-group :deep(.p-button) {
  width: auto;
  min-width: auto;
  padding: 7px 15px;
}
</style>
