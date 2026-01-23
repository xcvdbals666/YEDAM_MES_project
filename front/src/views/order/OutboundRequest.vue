<script setup>
import { ref } from 'vue';
import { useOrderStore2 } from '@/stores/order2';
import SelectOrderModal from '@/components/order/SelectOrderModal.vue';
const user = JSON.parse(localStorage.getItem('user'));

const orderStore = useOrderStore2();
const showOrderModal = ref(false); // 모달 표시 여부
const productList = ref([]); // 제품 목록

// 초기 상태 정의
const getInitialOutInfo = () => ({
  out_code: '',
  out_req_date: new Date().toISOString().split('T')[0],
  ord_code: '',
  ord_date: '',
  client_name: '',
  emp_name: user.emp_name,
  note: ''
});

const outInfo = ref(getInitialOutInfo()); // 출고 요청 정보

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
    out_amount: 0 // 출고 요청 수량(사용자 입력값)
  }));

  // 5. 모달 닫기
  showOrderModal.value = false;
};

// 초기화
const resetFrom = () => {
  // 확인 메시지
  if (productList.value.length > 0) {
    if (!confirm('입력한 내용이 모두 초기화됩니다. 계속하시겠습니까?')) {
      return;
    }
  }
  outInfo.value = getInitialOutInfo(); // 출고 정보 초기화
  productList.value = []; // 제품 목록 초기화
  orderStore.resetOutboundRequest(); // 스토어 초기화
};

// 출고 요청하기 버튼 클릭 시
const requestOutbound = async () => {
  // 1. 유효성 검사
  if (!outInfo.value.ord_code) {
    alert('주문 정보를 먼저 불러와주세요.');
    return;
  }

  // 2. 출고수량이 있는 제품만 필터링
  const validProducts = productList.value.filter((p) => p.out_amount > 0);

  if (validProducts.length === 0) {
    alert('출고할 제품의 수량을 입력해주세요.');
    return;
  }

  // 3. 확인 메시지
  if (!confirm('출고 요청을 진행하시겠습니까?')) {
    return;
  }

  try {
    // 4. 백엔드로 보낼 데이터 구성
    const requestData = {
      outReqInfo: {
        out_req_code: outInfo.value.out_code,
        out_req_date: outInfo.value.out_req_date,
        ord_predict_date: outInfo.value.ord_date,
        note: outInfo.value.note || '',
        ord_code: outInfo.value.ord_code,
        mcode: user.emp_code,
        client_code: orderStore.orderDetail.client_code
      },
      products: validProducts.map((p) => ({
        prod_code: p.prod_code,
        out_req_d_amount: p.out_amount,
        ord_amount: p.ord_amount,
        com_value: p.prod_type_code
      }))
    };

    // 5. API 호출
    const result = await orderStore.createOutboundRequest(requestData);

    // 6. 성공 처리
    if (result.success) {
      alert(result.message || '출고 요청이 완료되었습니다.');

      // 컨펌 없이 바로 초기화
      outInfo.value = getInitialOutInfo();
      productList.value = [];
      orderStore.resetOutboundRequest();
    }
  } catch (error) {
    // 7. 에러 처리
    console.error('출고 요청 실패:', error);
    alert('출고 요청에 실패했습니다. 다시 시도해주세요.');
  }
};

// 최대 출고 수량 실시간 체크
const handleOutAmountInput = (data, event) => {
  if (event.value > data.pending_amount) {
    data.out_amount = data.pending_amount;
  } else if (event.value < 0) {
    data.out_amount = 0;
  }
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

          <th>주문코드</th>
          <td><InputText class="w-full" disabled v-model="outInfo.ord_code" /></td>
        </tr>
        <tr>
          <th>출고요청일</th>
          <td><InputText class="w-full" v-model="outInfo.out_req_date" disabled /></td>

          <th>주문일자</th>
          <td><InputText class="w-full" disabled v-model="outInfo.ord_date" /></td>
        </tr>
        <tr>
          <th>거래처</th>
          <td><InputText class="w-full" disabled v-model="outInfo.client_name" /></td>

          <th>출고 요청 담당자</th>
          <td><InputText class="w-full" disabled v-model="outInfo.emp_name" /></td>
        </tr>
        <tr>
          <th>비고</th>
          <td colspan="3">
            <Textarea class="w-full" v-model="outInfo.note" rows="3" />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="button-group2">
      <Button label="출고 요청하기" severity="info" @click="requestOutbound" />
      <Button label="삭제" severity="danger" />
    </div>
  </Fluid>

  <!-- 제품 목록 -->
  <Fluid class="card min-h-[500px]">
    <div>
      <h4 class="font-semibold">제품</h4>
    </div>

    <DataTable :value="productList" showGridlines class="p-datatable-sm" tableStyle="table-layout: fixed; width: 100%;" :paginator="true" :rows="10">
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>
      <Column header="제품명" field="prod_name" headerStyle="width: 200px; padding: 8px 20px;" bodyStyle="padding: 8px 20px;" />
      <Column header="유형" field="prod_type" headerStyle="width: 100px;" bodyStyle="white-space: nowrap;" />
      <Column header="규격" field="spec" headerStyle="width: 80px" />
      <Column header="단위" field="unit" headerStyle="width: 80px" />
      <Column header="주문 수량" field="ord_amount" headerStyle="width: 100px;" />

      <Column header="기출고 수량" field="already_out_amount" headerStyle="width: 100px;" />
      <Column header="미출고 수량" field="pending_amount" headerStyle="width: 100px;" />
      <Column header="출고 요청 수량" headerStyle="width: 100px;">
        <template #body="{ data }">
          <InputNumber v-model="data.out_amount" :min="0" :max="data.pending_amount" @input="(e) => handleOutAmountInput(data, e)" />
        </template>
      </Column>
      <Column header="남은 재고" field="current_stock" headerStyle="width: 100px;" />
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

.button-group2 {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

.button-group2 :deep(.p-button) {
  width: auto;
  min-width: auto;
  padding: 10px 20px;
}
</style>
