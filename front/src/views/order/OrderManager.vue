<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useOrderStore } from '@/stores/order1';
import BaseDialog from '@/components/order/BaseDialog.vue';
import { FilterMatchMode } from '@primevue/core/api';
const order = useOrderStore();
//제품배열
const products = ref([{ selected: false, prod_code: '', unit: 'ea', spec: '', ord_amount: '', prod_price: '', delivery_date: '', ord_priority: '', total_price: '', com_value: '' }]);
//주문정보
const orderInfo = ref({
  ord_code: '',
  ord_name: '',
  ord_date: new Date().toISOString().split('T')[0],
  ord_stat: null,
  client_code: null,
  mcode: '',
  note: ''
});
// //우선순위 배열
// const priority = computed(() => {
//   let arr = [];
//   for (let i = 1; i <= products.value.length; i++) {
//     arr.push(i);
//   }
//   return arr;
// });
// 초기화 버튼 함수
const resetBtn = () => {
  orderInfo.value = {
    ord_code: '',
    ord_name: '',
    ord_date: new Date().toISOString().split('T')[0],
    ord_stat: null,
    client_code: null,
    mcode: '',
    note: ''
  };
  products.value = [{ selected: false, prod_code: '', unit: 'ea', spec: '', ord_amount: '', prod_price: '', delivery_date: '', ord_priority: '', total_price: '', com_value: '' }];
};
//총액 계산식
const calculateTotal = (product) => {
  const amount = Number(product.ord_amount) || 0;
  const price = Number(product.prod_price) || 0;
  product.total_price = amount * price;
  if (product.total_price == NaN) {
    product.total_price = 0;
  }
  console.log(product);
};
//제품 체크박스 로직
const checkAll = ref(false);
//제품 체크박스 함수
const onCheckAllChange = () => {
  products.value.forEach((product) => {
    product.selected = checkAll.value;
  });
  console.log(orderInfo.value);
};

onBeforeMount(() => {
  order.getClient();
  order.getEmployees();
});
//전체 총액 계산
const totalPrice = computed(() => {
  let total = 0;
  products.value.forEach((product) => {
    total = total + product.ord_amount * product.prod_price;
  });
  return total || 0;
});
// 제품 열 삭제
const deleteProduct = () => {
  products.value.forEach((product) => {
    products.value = products.value.filter((p) => !p.selected);
    checkAll.value = false;
  });
};
// 제품 열 추가.
const addProduct = () => {
  products.value.push({ selected: false, prod_code: '', unit: 'h2', spec: '', ord_amount: '', prod_price: '', delivery_date: '', ord_priority: '', total_price: '', com_value: '' });
  console.log(products.value);
};
// 완제품 모달 보여주기
const prodVisible = ref(false);
// 검색용 필터
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// 완제품 모달함수 켜는 함수
// 현재 어떤 행의 돋보기를 눌렀는지 저장할 변수
const currentRowIndex = ref(null);

// 제품 검색 모달을 여는 함수
const searchProduct = (index) => {
  currentRowIndex.value = index;
  order.getProducts();
  prodVisible.value = true;
};
// rowClass 함수: 데이터 상태에 따라 클래스 문자열 반환
const rowClass = (data) => {
  // 빈 행(isEmpty: true)이면 클릭 방지 클래스 적용
  return data.isEmpty ? 'empty-row pointer-events-none bg-transparent' : '';
};
// 모달에서 제품을 선택했을 때 실행될 함수
const onRowSelect = (event) => {
  if (event.data.isEmpty) return;
  const selectedProduct = event.data;
  const index = currentRowIndex.value;

  if (index !== null) {
    products.value[index] = selectedProduct;

    calculateTotal(products.value[index]);
  }

  prodVisible.value = false;
  currentRowIndex.value = null; // 초기화
};
// 주문모달 보여주기
const ordVisible = ref(false);
// 선택된 주문을 담을 변수
const selectedOrder = ref(null);
// 주문모달 여는 함수
const openOrderList = async () => {
  await order.getOrders();
  console.log(order.orders);
  ordVisible.value = true;
};
// 모달에서 주문 선택 후 불러오는 함수
const getOrderInfo = async () => {
  orderInfo.value = { ...selectedOrder.value };
  await order.getOrderDetail(orderInfo.value.ord_code);
  products.value = JSON.parse(JSON.stringify(order.details));
  console.log(products.value);
  ordVisible.value = false;
};

// 저장버튼 이벤트 함수

const saveBtn = async () => {
  // 유효성 체크
  if (orderInfo.value.client_code == null && orderInfo.value.mcode == '') {
    alert('주문정보를 입력해주세요');
    return;
  }
  for (let product of products.value) {
    console.log(products.value);
    console.log(product);
    if (product.prod_code == '') {
      alert('제품을 선택해주세요.');
      return;
    }
    if (product.ord_amount == '' || product.ord_amount == undefined) {
      alert('제품 수량을 입력해주세요.');
      return;
    }
    if (product.prod_price == '' || product.prod_price == undefined) {
      alert('단가를 입력해주세요');
      return;
    }
    if (product.delivery_date == '' || product.delivery_date == undefined) {
      alert('납기일을 입력해주세요.');
      return;
    }
    if (product.ord_priority == '' || product.ord_priority == undefined) {
      alert('우선순위를 입력해주세요.(1~5까지 가능합니다.)');
      return;
    }
  }
  if (orderInfo.value.ord_code.length == 0 && orderInfo.value.client_code != null && orderInfo.value.mcode != '') {
    // ord_code가 없으면(길이가 0임.) 신규등록

    console.log(`ord_code's length 0`);
    let result = await order.registerOrder(orderInfo.value, products.value);
    orderInfo.value.ord_code = result;
    await order.getOrderDetail(orderInfo.value.ord_code);
    products.value = order.details;
  } else if (orderInfo.value.ord_code.length > 0) {
    // ord_code가 있으면 수정
    console.log(`ord_code's length is not 0`);
    if (JSON.stringify(orderInfo.value) == JSON.stringify(selectedOrder.value) && JSON.stringify(products.value) == JSON.stringify(order.details)) {
      alert('수정된게 없음.');
      console.log(orderInfo.value);
    } else {
      let result = await order.updateOrder(orderInfo.value, products.value);
      if (result.order.affectedRows > 0 || result.detail.affectedRows > 0) {
        alert('수정이 완료되었습니다.');
      }
      console.log(result);
    }
  }
};
// 삭제버튼 이벤트 함수
const deleteBtn = async () => {
  if (orderInfo.value.ord_code.length != 0) {
    if (confirm(`${orderInfo.value.ord_name}(${orderInfo.value.ord_code}) 주문을 삭제하시겠습니까?`)) {
      let result = await order.deleteOrder(orderInfo.value.ord_code);
      alert(result);
      resetBtn();
    }
  }
};
</script>

<template>
  <Fluid>
    <BaseDialog v-model:visible="ordVisible" header="주문불러오기" width="60rem">
      <DataTable
        :isDataSelectable="isRowSelectable"
        v-model:filters="filters"
        :globalFilterFields="['ord_code', 'ord_name', 'client_name']"
        dataKey="ord_code"
        v-model:selection="selectedOrder"
        :value="order.orders"
        tableStyle="min-width: 60rem"
        paginator="true"
        :rows="5"
        selection-mode="single"
        :rowClass="rowClass"
        :metaKeySelection="false"
      >
        <template #header>
          <div class="flex justify-end">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="주문번호, 주문명, 거래처 검색" />
            </IconField>
          </div>
        </template>
        <Column selectionMode="single" headerStyle="width: 3rem"></Column>
        <Column field="ord_code" header="주문코드"></Column>
        <Column field="ord_name" header="주문명"></Column>
        <Column field="client_name" header="거래처명"></Column>
        <Column field="client_code" header="거래처코드" hidden></Column>
        <Column field="ord_date" header="주문일자" />
      </DataTable>
      <template #footer>
        <Button label="불러오기" severity="success" variant="outlined" class="min-w-[65px]" @click="getOrderInfo" />
        <Button label="취소" severity="danger" variant="outlined" class="min-w-[65px]" @click="ordVisible = false" />
      </template>
    </BaseDialog>
    <BaseDialog v-model:visible="prodVisible" header="제품검색" width="60rem">
      <DataTable
        :value="order.products"
        v-model:filters="filters"
        :globalFilterFields="['prod_code', 'prod_name', 'prod_type']"
        paginator
        :rows="10"
        :rowClass="rowClass"
        selection-mode="single"
        @row-click="onRowSelect"
        :metaKeySelection="true"
        tableStyle="min-width: 50rem"
      >
        <template #header>
          <div class="flex justify-end">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="제품명 또는 코드 검색" />
            </IconField>
          </div>
        </template>
        <Column field="prod_code" header="제품코드"></Column>
        <Column field="prod_name" header="제품명"></Column>
        <Column field="edate" header="유통기한"></Column>
        <Column field="unit_note" header="단위">
          <!-- <template #body="slotProps">
            {{ order.converUnit(slotProps.data.unit) }}
          </template> -->
        </Column>
        <Column field="com_note" header="완제품 유형" />
      </DataTable>
    </BaseDialog>

    <div class="flex flex-col md:flex-row gap-8">
      <div class="w-full min-w-[800px] border-collapse text-sm">
        <div class="card flex flex-col gap-4">
          <div class="font-semibold text-xl flex justify-between items-center">
            <div>주문 기본 정보</div>
            <div class="flex items-center gap-2">
              <Button label="삭제" severity="danger" variant="outlined" class="min-w-[65px]" @click="deleteBtn" :disabled="orderInfo.ord_stat != 'a1'" />
              <Button label="초기화" severity="contrast" variant="outlined" class="min-w-[65px]" @click="resetBtn" />
              <Button label="저장" severity="info" variant="outlined" class="min-w-[65px]" @click="saveBtn" />
              <Button label="주문정보 불러오기" severity="success" variant="outlined" class="min-w-[130px]" @click="openOrderList" />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <table class="w-full min-w-[800px] border-collapse text-sm">
              <tbody>
                <tr>
                  <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">주문코드</th>
                  <td class="min-w-[275px] border border-gray-200 p-2">
                    <InputText v-model="orderInfo.ord_code" class="w-full" disabled="true" placeholder="주문코드" />
                  </td>
                  <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">주문명</th>
                  <td class="min-w-[275px] border border-gray-200 p-2">
                    <InputText v-model="orderInfo.ord_name" class="w-full" placeholder="주문명" />
                  </td>
                </tr>
                <tr>
                  <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">주문일자</th>
                  <td class="min-w-[275px] border border-gray-200 p-2">
                    <InputText type="date" v-model="orderInfo.ord_date" class="w-full" disabled="true" />
                  </td>
                  <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">거래처</th>
                  <td class="min-w-[275px] border border-gray-200 p-2">
                    <Select
                      v-model="orderInfo.client_code"
                      :options="order.clients"
                      option-label="client_name"
                      option-value="client_code"
                      placeholder="거래처를 선택해주세요."
                      class="w-full"
                      :disabled="orderInfo.ord_stat !== 'a1' && orderInfo.ord_stat != null"
                    />
                  </td>
                </tr>
                <tr>
                  <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">거래처담당자</th>
                  <td class="min-w-[275px] border border-gray-200 p-2">
                    <Select v-model="orderInfo.mcode" :options="order.employees" option-label="emp_name" option-value="emp_code" class="w-full" :disabled="orderInfo.ord_stat !== 'a1' && orderInfo.ord_stat != null">
                      <template #option="slotProps">
                        <div class="flex items-center">
                          <span>{{ `${slotProps.option.emp_name}(${slotProps.option.emp_code})` }}</span>
                        </div>
                      </template>
                    </Select>
                  </td>
                  <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">비고</th>
                  <td class="min-w-[275px] border border-gray-200 p-2">
                    <InputText v-model="orderInfo.note" class="w-full" placeholder="특이사항 입력" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="flex mt-8">
      <div class="card flex flex-col gap-4 w-full">
        <div class="font-semibold text-xl flex justify-between items-center">
          <div>제품</div>
          <div class="flex items-center gap-2">
            <Button label="제품삭제" severity="danger" variant="outlined" class="min-w-[100px]" @click="deleteProduct" :disabled="orderInfo.ord_stat !== 'a1' && orderInfo.ord_stat != null" />
            <Button label="제품추가" severity="success" variant="outlined" class="min-w-[100px]" @click="addProduct" :disabled="orderInfo.ord_stat !== 'a1' && orderInfo.ord_stat != null" />
          </div>
        </div>
        <div>
          <table class="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr>
                <th class="min-w-[10px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700"><Checkbox v-model="checkAll" binary @change="onCheckAllChange()" /></th>
                <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">제품명</th>
                <th class="min-w-[80px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">유형</th>
                <th class="min-w-[10px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">규격</th>
                <th class="min-w-[90px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">수량</th>
                <th class="min-w-[100px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">단가(원)</th>
                <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">납기일</th>
                <th class="min-w-[80px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">우선순위</th>
                <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">총액</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, index) of products" :key="index">
                <td class="min-w-[10px] border border-gray-200 p-3 text-center text-gray-700">
                  <Checkbox binary v-model="product.selected" />
                </td>
                <td class="min-w-[150px] border border-gray-200 p-3 text-center text-gray-700">
                  <IconField>
                    <InputText v-model="product.prod_name" placeholder="제품명" class="w-full" :disabled="orderInfo.ord_stat != 'a1' && orderInfo.ord_stat != null" readonly />
                    <input type="hidden" v-model="product.prod_code" readonly />
                    <InputIcon class="pi pi-search" style="cursor: pointer" @click="!(orderInfo.ord_stat != 'a1' && orderInfo.ord_stat != null) ? searchProduct(index) : null" />
                  </IconField>
                </td>
                <td class="min-w-[80px] border border-gray-200 p-3 text-center text-gray-700">
                  <InputText v-model="product.com_note" placeholder="유형" class="w-full" readonly />
                </td>
                <td class="min-w-[10px] border border-gray-200 p-3 text-center text-gray-700">
                  <InputGroup>
                    <InputNumber v-model="product.spec_note" placeholder="규격" class="w-full" readonly />
                    <InputGroupAddon>{{ product.unit_note || 'ea' }}</InputGroupAddon>
                  </InputGroup>
                </td>
                <td class="min-w-[90px] border border-gray-200 p-3 text-center text-gray-700">
                  <InputNumber max="9999999999" min="0" v-model="product.ord_amount" placeholder="수량" class="w-full" @value-change="calculateTotal(product)" show-buttons="true" :disabled="orderInfo.ord_stat != 'a1' && orderInfo.ord_stat != null" />
                </td>
                <td class="min-w-[100px] border border-gray-200 p-3 text-center text-gray-700">
                  <InputNumber max="9999999999" min="0" v-model="product.prod_price" placeholder="단가" class="w-full" @value-change="calculateTotal(product)" :disabled="orderInfo.ord_stat != 'a1' && orderInfo.ord_stat != null" />
                </td>
                <td class="min-w-[150px] border border-gray-200 p-3 text-center text-gray-700">
                  <InputText type="date" v-model="product.delivery_date" class="w-full" />
                </td>
                <td class="min-w-[80px] border border-gray-200 p-3 text-center text-gray-700">
                  <InputNumber min="1" max="5" v-model="product.ord_priority" class="w-full" show-buttons="true" />
                </td>
                <td class="min-w-[150px] border border-gray-200 p-3 text-center text-gray-700">
                  <InputGroup>
                    <InputNumber max="99999999999999999999" v-model="product.total_price" readonly />
                    <InputGroupAddon>원</InputGroupAddon>
                  </InputGroup>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="flex justify-end mt-4">
            <h5>
              전체 주문 총액 <span class="text-orange-700 font-bold text-4xl">{{ totalPrice.toLocaleString() }}</span
              >원
            </h5>
          </div>
        </div>
      </div>
    </div>
  </Fluid>
</template>
<style scoped>
/* 빈 행은 클릭 안 되게 처리 */
:deep(.p-datatable-tbody > tr) {
  height: 50px; /* 행 높이 강제 고정 (선택사항) */
}
/* 빈 행(empty-row) 안에 있는 라디오 버튼 영역 숨기기 */
:deep(.empty-row .p-selection-column .p-radiobutton),
:deep(.empty-row .p-selection-column .p-checkbox) {
  visibility: hidden; /* 공간은 차지하되 눈에만 안 보이게 (정렬 유지) */
  /* 또는 display: none; 아예 없애버리기 */
}
</style>
