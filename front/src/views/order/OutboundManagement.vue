<script setup>
import { ref } from 'vue';
import { useOrderStore2 } from '@/stores/order2';
import SelectOutReqModal from '@/components/order/SelectOutReqModal.vue';
const user = JSON.parse(localStorage.getItem('user'));

const orderStore = useOrderStore2();
const showOutReqModal = ref(false); // 모달 표시 여부
const productList = ref([]); // 제품 목록

// 초기 상태 정의
const getInitialOutReqInfo = () => ({
  out_req_code: '',
  out_req_date: '',
  ord_code: '',
  ord_date: '',
  client_name: '',
  out_req_emp: '',
  out_date: new Date().toISOString().split('T')[0],
  out_emp: user.emp_name,
  note: ''
});

const outReqInfo = ref(getInitialOutReqInfo()); // 출고 요청 정보

// 모달 열기
const openOutReqModal = () => {
  showOutReqModal.value = true;
};

// 모달에서 선택 시
const selectOutReq = async (selectedOutReq) => {
  // console.log('선택된 출고 요청:', selectedOutReq);

  // 1. 스토어에 선택된 출고요청 정보 저장
  orderStore.setSelectedOutReq(selectedOutReq);

  // 2. out_req_code로 상세 정보 조회
  await orderStore.fetchOutReqDetailByCode(selectedOutReq.out_req_code);

  // 3. 출고 정보 복사 (스토어의 outReqDetail에서 가져오기)
  outReqInfo.value.out_req_code = orderStore.outReqDetail.out_req_code;
  outReqInfo.value.out_req_date = formatDate(orderStore.outReqDetail.out_req_date);
  outReqInfo.value.ord_code = orderStore.outReqDetail.ord_code;
  outReqInfo.value.ord_date = formatDate(orderStore.outReqDetail.ord_date);
  outReqInfo.value.client_name = orderStore.outReqDetail.client_name;
  outReqInfo.value.out_req_emp = orderStore.outReqDetail.emp_name; // 출고요청 담당자
  outReqInfo.value.out_date = new Date().toISOString().split('T')[0]; // 출고일 (오늘)
  outReqInfo.value.out_emp = user.emp_name; // 출고 담당자 (현재 로그인 유저)
  outReqInfo.value.note = orderStore.outReqDetail.note;

  // 4. 제품 목록 복사
  productList.value = orderStore.outReqProducts.map((product) => ({
    ...product, // 백엔드 데이터 전체 복사 (out_req_amount, already_outbnd_qtt, not_outbnd_qtt, current_stock 등)
    out_amount: 0 // 실제 출고할 수량 (사용자 입력값)
  }));

  // 5. 모달 닫기
  showOutReqModal.value = false;
};

// 초기화
const resetFrom = () => {
  // 확인 메시지
  if (productList.value.length > 0) {
    if (!confirm('입력한 내용이 모두 초기화됩니다. 계속하시겠습니까?')) {
      return;
    }
  }
  outReqInfo.value = getInitialOutReqInfo(); // 출고 정보 초기화
  productList.value = []; // 제품 목록 초기화
  orderStore.resetOutbound(); // 스토어 초기화 (출고 관련)
};

// 수량 검사
const handleOutAmountInput = (data, value) => {
  const maxAmount = Math.min(data.not_outbnd_qtt, data.current_stock);
  if (value > maxAmount) {
    data.out_amount = maxAmount;
  } else if (value < 0) {
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
      <div class="text-2xl font-semibold">출고 관리</div>
      <div class="button-group">
        <Button label="초기화" severity="contrast" @click="resetFrom" />
        <Button label="출고요청 불러오기" @click="openOutReqModal" />
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
          <th>출고요청 코드</th>
          <td><InputText v-model="outReqInfo.out_req_code" class="w-full" disabled /></td>

          <th>주문코드</th>
          <td><InputText v-model="outReqInfo.ord_code" class="w-full" disabled /></td>
        </tr>
        <tr>
          <th>출고요청일</th>
          <td><InputText v-model="outReqInfo.out_req_date" class="w-full" disabled /></td>

          <th>주문일자</th>
          <td><InputText v-model="outReqInfo.ord_date" class="w-full" disabled /></td>
        </tr>
        <tr>
          <th>거래처</th>
          <td><InputText v-model="outReqInfo.client_name" class="w-full" disabled /></td>

          <th>출고 요청 담당자</th>
          <td><InputText v-model="outReqInfo.out_req_emp" class="w-full" disabled /></td>
        </tr>
        <tr>
          <th>출고일</th>
          <td><InputText v-model="outReqInfo.out_date" class="w-full" disabled /></td>

          <th>출고 담당자</th>
          <td><InputText v-model="outReqInfo.out_emp" class="w-full" disabled /></td>
        </tr>
        <tr>
          <th>비고</th>
          <td colspan="3">
            <Textarea v-model="outReqInfo.note" class="w-full" rows="3" disabled />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="button-group2">
      <Button label="출고" severity="info" />
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
    <Column header="규격" field="spec" headerStyle="width: 100px" />
    <Column header="단위" field="unit" headerStyle="width: 100px" />
    <Column header="출고요청수량" field="out_req_amount" headerStyle="width: 120px;" />
    <Column header="기출고수량" field="already_outbnd_qtt" headerStyle="width: 120px;" />
    
    <!-- 출고수량 입력 -->
    <Column header="출고수량" headerStyle="width: 120px;">
      <template #body="{ data }">
        <InputNumber 
          v-model="data.out_amount" 
          :min="0" 
          :max="Math.min(data.not_outbnd_qtt, data.current_stock)" 
          @update:modelValue="handleOutAmountInput(data, $event)" 
        />
      </template>
    </Column>
    
    <Column header="현재재고" field="current_stock" headerStyle="width: 100px;" />
    <Column header="납기일" headerStyle="width: 100px;">
      <template #body="{ data }">
        {{ formatDate(data.delivery_date) }}
      </template>
    </Column>
  </DataTable>
  </Fluid>

  <!-- 출고요청 선택 모달 -->
  <SelectOutReqModal v-model:visible="showOutReqModal" @select="selectOutReq" />
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
  padding: 10px 30px;
}
</style>
