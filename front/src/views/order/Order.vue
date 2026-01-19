<script setup>
import { ref, computed, onBeforeMount } from 'vue';

const dropdownItems = ref([
  { name: 'Option 1', code: 'Option 1' },
  { name: 'Option 2', code: 'Option 2' },
  { name: 'Option 3', code: 'Option 3' }
]);

const dropdownItem = ref(null);
const products = ref([{ selected: false, prod_code: '', unit: 'ea', spec: '', ord_amount: '', prod_price: '', delivery_date: '', ord_priority: '', total_price: '' }]);
const orderInfo = ref({
  ord_code: '',
  ord_name: '',
  ord_date: new Date().toISOString().split('T')[0],
  ord_stat: null,
  client_code: null,
  mcode: '',
  note: '',
  ord_d_tbl: products.value
});
const priority = computed(() => {
  let arr = [];
  for (let i = 1; i <= products.value.length; i++) {
    arr.push(i);
  }
  return arr;
});
const calculateTotal = (product) => {
  const amount = Number(product.ord_amount);
  const price = Number(product.prod_price);
  product.total_price = amount * price;
  console.log(product);
};
const clients = ref([]);
const checkAll = ref(false);
const onCheckAllChange = () => {
  products.value.forEach((product) => {
    product.selected = checkAll.value;
  });
};
onBeforeMount(() => {
  console.log(clients);
});
const totalPrice = computed(() => {
  let total = 0;
  products.value.forEach((product) => {
    total = total + product.ord_amount * product.prod_price;
  });
  return total;
});
const visible = ref(false);
const deleteProduct = () => {
  products.value.forEach((product) => {
    products.value = products.value.filter((p) => !p.selected);
    checkAll.value = false;
  });
};
const addProduct = () => {
  products.value.push({ selected: false, prod_code: '', unit: 'ea', spec: '', ord_amount: '', prod_price: '', delivery_date: '', ord_priority: '', total_price: '' });
};
</script>

<template>
  <Fluid>
    <Button label="모달 열기" @click="visible = true" />

    <Dialog v-model:visible="visible" modal header="주문 상세 정보" :style="{ width: '50rem' }">
      <p>여기에 주문 상세 내용을 넣으세요.</p>
      <div class="flex justify-end gap-2">
        <Button type="button" label="취소" severity="secondary" @click="visible = false"></Button>
        <Button type="button" label="저장" @click="visible = false"></Button>
      </div>
    </Dialog>
    <div class="flex flex-col md:flex-row gap-8">
      <div class="w-full min-w-[800px] border-collapse text-sm">
        <div class="card flex flex-col gap-4">
          <div class="font-semibold text-xl flex justify-between items-center">
            <div>주문 기본 정보</div>
            <div class="flex items-center gap-2">
              <Button label="삭제" severity="danger" variant="outlined" class="min-w-[65px]" />
              <Button label="초기화" severity="contrast" variant="outlined" class="min-w-[65px]" />
              <Button label="저장" severity="info" variant="outlined" class="min-w-[65px]" />
              <Button label="주문정보 불러오기" severity="success" variant="outlined" class="min-w-[130px]" />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <table class="w-full min-w-[800px] border-collapse text-sm">
              <tbody>
                <tr>
                  <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">주문번호</th>
                  <td class="min-w-[275px] border border-gray-200 p-2">
                    <InputText v-model="orderInfo.ord_code" class="w-full" />
                  </td>
                  <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">주문명</th>
                  <td class="min-w-[275px] border border-gray-200 p-2">
                    <InputText v-model="orderInfo.ord_name" class="w-full" />
                  </td>
                </tr>
                <tr>
                  <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">주문일자</th>
                  <td class="min-w-[275px] border border-gray-200 p-2">
                    <InputText type="date" v-model="orderInfo.ord_date" class="w-full" />
                  </td>
                  <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">거래처</th>
                  <td class="min-w-[275px] border border-gray-200 p-2">
                    <Select v-model="orderInfo.client_code" :options="dropdownItems" :name="dropdownItem" optionLabel="name" placeholder="거래처를 선택해주세요." class="w-full" />
                  </td>
                </tr>
                <tr>
                  <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">거래처담당자</th>
                  <td class="min-w-[275px] border border-gray-200 p-2">
                    <Select v-model="orderInfo.mcode" :options="dropdownItems" optionLabel="name" class="w-full" />
                  </td>
                  <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">비고</th>
                  <td class="min-w-[275px] border border-gray-200 p-2">
                    <InputText v-model="orderInfo.note" class="w-full" />
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
            <Button label="제품삭제" severity="danger" variant="outlined" class="min-w-[100px]" @click="deleteProduct" />
            <Button label="제품추가" severity="success" variant="outlined" class="min-w-[100px]" @click="addProduct" />
          </div>
        </div>
        <div>
          <table class="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr>
                <th class="min-w-[10px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700"><Checkbox v-model="checkAll" binary @change="onCheckAllChange()" /></th>
                <th class="min-w-[100px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">제품명</th>
                <th class="min-w-[80px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">유형</th>
                <th class="min-w-[100px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">수량</th>
                <th class="min-w-[100px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">단가</th>
                <th class="min-w-[150px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">납기일</th>
                <th class="min-w-[80px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">우선순위</th>
                <th class="min-w-[80px] bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700">총액</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product of products" :key="product.prod_code">
                <td class="min-w-[10px] border border-gray-200 p-3 text-center text-gray-700">
                  <Checkbox binary v-model="product.selected" />
                </td>
                <td class="min-w-[100px] border border-gray-200 p-3 text-center text-gray-700">
                  <IconField>
                    <InputText v-model="product.prod_code" placeholder="제품명" class="w-full" readonly />
                    <InputIcon class="pi pi-search" style="cursor: pointer" />
                  </IconField>
                </td>
                <td class="min-w-[80px] border border-gray-200 p-3 text-center text-gray-700">
                  <InputText v-model="product.spec" placeholder="유형" class="w-full" readonly />
                </td>
                <td class="min-w-[100px] border border-gray-200 p-3 text-center text-gray-700 flex items-center">
                  <InputGroup>
                    <InputNumber max="9999999999" v-model="product.ord_amount" placeholder="수량" class="w-full" @value-change="calculateTotal(product)" />
                    <InputGroupAddon>{{ product.unit }}</InputGroupAddon>
                  </InputGroup>
                </td>
                <td class="min-w-[100px] border border-gray-200 p-3 text-center text-gray-700">
                  <InputGroup>
                    <InputNumber max="9999999999" v-model="product.prod_price" placeholder="단가" class="w-full" @value-change="calculateTotal(product)" />
                    <InputGroupAddon>원</InputGroupAddon>
                  </InputGroup>
                </td>
                <td class="min-w-[150px] border border-gray-200 p-3 text-center text-gray-700">
                  <InputText type="date" v-model="product.delivery_date" class="w-full" />
                </td>
                <td class="min-w-[80px] border border-gray-200 p-3 text-center text-gray-700">
                  <Select v-model="product.ord_priority" :options="priority" class="w-full" />
                </td>
                <td class="min-w-[80px] border border-gray-200 p-3 text-center text-gray-700">
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
