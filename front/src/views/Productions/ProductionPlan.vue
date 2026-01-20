<script setup>
import { useProductionStore } from '@/stores/production2';
import { reactive, ref } from 'vue';

const store = useProductionStore();

const displayOrderModal = ref(false);
const displayProdModal = ref(false);
const displayLineModal = ref(false);
const searchKeyword = ref('');
const selectedOrder = ref({});
const selectedProd = ref({});
const selectedLine = ref({});
const selectedProdList = ref([]);
const orderList = ref([]);
const prodList = ref([]);
const lineList = ref([]);
const planProdList = ref([]);
const idx = ref(null);
let rownum = 0;

const planInfo = reactive({
  prdpCode: '',
  prdpName: '',
  prdpDate: new Date(),
  reg: '',
  startDate: '',
  endDate: '',
  ordCode: '',
  dueDate: '',
  note: ''
});

// 생산계획 삭제
const remove = () => {};

// 생산계획 초기화
const reset = () => {
  planInfo.prdpCode = '';
  planInfo.prdpName = '';
  planInfo.prdpDate = '';
  planInfo.reg = '';
  planInfo.startDate = '';
  planInfo.endDate = '';
  planInfo.ordCode = '';
  planInfo.dueDate = '';
  planInfo.note = '';
};

// 생산계획 저장
const save = () => {};

// 생산계획 불러오기
const load = () => {};

// 주문 검색 모달 열기
const openOrderModal = () => {
  displayOrderModal.value = true;
};
// 주문 검색 모달 닫기
const closeOrderModal = () => {
  displayOrderModal.value = false;
};

// 주문 선택
const selectOrder = () => {
  planInfo.ordCode = selectedOrder.value.ord_code;
  orderList.value = [];
  searchKeyword.value = '';
  closeOrderModal();
};

// 주문 검색
const searchOrder = async () => {
  const list = await store.fetchOrders({ q: searchKeyword.value });
  orderList.value = list.map((item, idx) => ({
    idx: idx,
    ...item,
    ord_date: item.ord_date.slice(0, 10)
  }));
};

// 행 추가
const addList = () => {
  const row = reactive({
    idx: rownum,
    prodCode: '',
    prodName: '',
    comValue: '',
    unit: '',
    spec: '',
    plannedQtt: 0,
    priority: 0,
    lineCode: ''
  });
  rownum += 1;
  planProdList.value.push(row);
};
// 선택 제품 삭제
const deleteList = () => {
  if (!selectedProdList.value || selectedProdList.value.length === 0) {
    alert('삭제할 항목을 선택하여 주십시오.');
    return;
  }
  if (confirm('정말 삭제하시겠습니까?')) {
    planProdList.value = planProdList.value.filter((row) => !selectedProdList.value.includes(row));
    selectedProdList.value = [];
  } else {
    return;
  }
  // 선택 초기화
};

// 라인 검색 모달 열기
const openLineModal = (index) => {
  idx.value = index;
  displayLineModal.value = true;
};

// 라인 검색 모달 닫기
const closeLineModal = () => {
  displayLineModal.value = false;
};

// 라인 선택
const selectLine = () => {
  searchKeyword.value = '';
  lineList.value = [];
  planProdList.value[idx.value].lineCode = selectedLine.value.line_code;
  closeLineModal();
};

// 라인 검색
const searchLine = async () => {
  const list = await store.fetchLines({ q: searchKeyword.value });
  lineList.value = list.map((item, idx) => ({
    idx: idx,
    ...item
  }));
};

// 제품 검색 모달 열기
const openProdModal = (index) => {
  idx.value = index;
  displayProdModal.value = true;
};

// 제품 검색 모달 닫기
const closeProdModal = () => {
  displayProdModal.value = false;
};

// 제품 선택
const selectProd = () => {
  searchKeyword.value = '';
  prodList.value = [];
  planProdList.value[idx.value].prodCode = selectedProd.value.prod_code;
  closeProdModal();
};

// 제품 검색
const searchProd = async () => {
  const list = await store.fetchProds({ q: searchKeyword.value });
  prodList.value = list.map((item, idx) => ({
    idx: idx,
    ...item
  }));
};
</script>
<template>
  <div>
    <div class="card">
      <div class="pb-4 flex justify-between">
        <div class="font-semibold text-xl">생산계획</div>
        <div class="flex gap-2 pr-6">
          <Button icon="pi pi-trash" label="삭제" severity="danger" @click="remove"></Button>
          <Button icon="pi pi-undo" label="초기화" severity="secondary" @click="reset"></Button>
          <Button icon="pi pi-save" label="저장" @click="save"></Button>
          <Button icon="pi pi-plus" label="생산계획 불러오기" severity="info" @click="load"></Button>
        </div>
      </div>
      <Fluid>
        <table class="w-full">
          <colgroup>
            <col class="w-25" />
            <col class="w-auto" />
            <col class="w-25" />
            <col class="w-auto" />
          </colgroup>
          <tbody>
            <tr>
              <th>생산계획코드</th>
              <td><InputText placeholder="생산계획코드" v-model="planInfo.prdpCode" disabled></InputText></td>
              <th>계획명</th>
              <td><InputText v-model="planInfo.prdpName"></InputText></td>
            </tr>
            <tr>
              <th>계획일자</th>
              <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="planInfo.prdpDate" disabled></DatePicker></td>
              <th>작성자</th>
              <td><InputText v-model="planInfo.reg" disabled></InputText></td>
            </tr>
            <tr>
              <th>계획시작일</th>
              <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="planInfo.startDate" placeholder="날짜 선택"></DatePicker></td>
              <th>계획종료일</th>
              <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="planInfo.endDate" placeholder="날짜 선택"></DatePicker></td>
            </tr>
            <tr>
              <th>주문코드</th>
              <td>
                <IconField iconPosition="left" @click="openOrderModal">
                  <InputText v-model="planInfo.ordCode" type="text" placeholder="검색" readonly />
                  <InputIcon class="pi pi-search" />
                </IconField>
              </td>
              <th>납기일자</th>
              <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="planInfo.dueDate" placeholder="날짜 선택"></DatePicker></td>
            </tr>
            <tr>
              <th>비고</th>
              <td><InputText v-model="planInfo.note" placeholder="특이사항 입력" class="w-full"></InputText></td>
              <th></th>
              <td></td>
            </tr>
          </tbody>
        </table>
      </Fluid>

      <!-- 주문 검색 모달 -->
      <Dialog header="주문코드 검색" v-model:visible="displayOrderModal" :breakpoints="{ '960px': '75vw' }" :style="{ width: '80vw' }" :modal="true">
        <Fluid class="pb-4">
          <IconField iconPosition="left">
            <InputText type="text" placeholder="주문코드 또는 주문명 검색" v-model="searchKeyword" @keyup.enter="searchOrder" />
            <InputIcon class="pi pi-search" @click="searchOrder" />
          </IconField>
        </Fluid>
        <DataTable :value="orderList" v-model:selection="selectedOrder" :paginator="true" :rows="10" dataKey="idx" :rowHover="true" showGridlines>
          <template #empty>
            <div class="text-center py-6 text-gray-400">데이터 없음</div>
          </template>
          <Column selectionMode="single" style="width: 4px; text-align: center" />
          <Column field="ord_code" header="주문코드" headerClass="table-header" bodyClass="table-body" style="width: 180px" />
          <Column field="prod_code" header="제품코드" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
          <Column field="prod_name" header="제품명" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
          <Column field="ord_amount" header="주문수량" headerClass="table-header" bodyClass="table-body" style="width: 60px" />
          <Column field="ord_name" header="주문명" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
          <Column field="ord_date" header="주문일자" headerClass="table-header" bodyClass="table-body" style="width: 95px" />
        </DataTable>
        <template #footer>
          <div class="flex gap-2 justify-center">
            <Button label="확인" @click="selectOrder" />
            <Button label="취소" @click="closeOrderModal" />
          </div>
        </template>
      </Dialog>
    </div>
    <div class="card">
      <div class="flex justify-between pb-4">
        <div class="font-semibold text-xl">제품</div>
        <div class="flex gap-2">
          <Button icon="pi pi-trash" label="선택 삭제" severity="danger" @click="deleteList"></Button>
          <Button icon="pi pi-plus" label="행 추가" @click="addList"></Button>
        </div>
      </div>
      <DataTable v-model:selection="selectedProdList" :value="planProdList" :paginator="true" :rows="8" dataKey="idx" :rowHover="true" showGridlines>
        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>
        <Column selectionMode="multiple" style="width: 20px" />
        <Column field="prodCode" header="제품코드" headerClass="table-header" bodyClass="table-body" style="width: 120px">
          <template #body="{ data, index }">
            <IconField iconPosition="left" class="w-60" @click="openProdModal(index)">
              <InputText type="text" v-model="data.prodCode" class="w-60" readonly />
              <InputIcon class="pi pi-search" />
            </IconField>
          </template>
        </Column>
        <Column field="prodName" header="제품명" headerClass="table-header" bodyClass="table-body" style="width: 120px"></Column>
        <Column field="comValue" header="제품유형" headerClass="table-header" bodyClass="table-body" style="width: 120px">
          <template #body="{ data }">
            {{ data.comValue == 'J1' ? '봉지라면' : data.comValue == 'J2' ? '컵라면' : '' }}
          </template>
        </Column>
        <Column field="unit" header="단위" headerClass="table-header" bodyClass="table-body" style="width: 120px"></Column>
        <Column field="spec" header="규격" headerClass="table-header" bodyClass="table-body" style="width: 120px"></Column>
        <Column field="planedQtt" header="목표수량" headerClass="table-header" bodyClass="table-body" style="width: 80px">
          <template #body="{ data }">
            <InputNumber v-model="data.plannedQtt" showButtons mode="decimal" inputClass="w-30" :min="0"></InputNumber>
          </template>
        </Column>
        <Column field="priority" header="우선순위" headerClass="table-header" bodyClass="table-body" style="width: 80px">
          <template #body="{ data }">
            <InputNumber v-model="data.priority" showButtons mode="decimal" inputClass="w-20" :min="0"></InputNumber>
          </template>
        </Column>
        <Column field="lineCode" header="생산라인" headerClass="table-header" bodyClass="table-body" style="width: 120px">
          <template #body="{ data, index }">
            <IconField iconPosition="left" class="w-50" @click="openLineModal(index)">
              <InputText type="text" v-model="data.lineCode" class="w-50" readonly />
              <InputIcon class="pi pi-search" />
            </IconField>
          </template>
        </Column>
      </DataTable>

      <!-- 제품 검색 모달 -->
      <Dialog header="제품코드 검색" v-model:visible="displayProdModal" :breakpoints="{ '960px': '75vw' }" :style="{ width: '80vw' }" :modal="true">
        <Fluid class="pb-4">
          <IconField iconPosition="left">
            <InputText type="text" placeholder="제품코드 또는 제품명 또는 제품유형 검색" v-model="searchKeyword" @keyup.enter="searchProd" />
            <InputIcon class="pi pi-search" @click="searchProd" />
          </IconField>
        </Fluid>
        <DataTable :value="prodList" v-model:selection="selectedProd" :paginator="true" :rows="10" dataKey="idx" :rowHover="true" showGridlines>
          <template #empty>
            <div class="text-center py-6 text-gray-400">데이터 없음</div>
          </template>
          <Column selectionMode="single" style="width: 4px; text-align: center" />
          <Column field="prod_code" header="제품코드" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
          <Column field="prod_name" header="제품명" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
          <Column field="com_value" header="유형" headerClass="table-header" bodyClass="table-body" style="width: 60px" />
          <Column field="unit" header="단위" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
          <Column field="spec" header="규격" headerClass="table-header" bodyClass="table-body" style="width: 95px" />
        </DataTable>
        <template #footer>
          <div class="flex gap-2 justify-center">
            <Button label="확인" @click="selectProd" />
            <Button label="취소" @click="closeProdModal" />
          </div>
        </template>
      </Dialog>

      <!-- 라인 검색 모달 -->
      <Dialog header="라인코드 검색" v-model:visible="displayLineModal" :breakpoints="{ '960px': '75vw' }" :style="{ width: '80vw' }" :modal="true">
        <Fluid class="pb-4">
          <IconField iconPosition="left">
            <InputText type="text" placeholder="라인코드 또는 라인명 검색" v-model="searchKeyword" @keyup.enter="searchLine" />
            <InputIcon class="pi pi-search" @click="searchLine" />
          </IconField>
        </Fluid>
        <DataTable :value="lineList" v-model:selection="selectedLine" :paginator="true" :rows="10" dataKey="idx" :rowHover="true" showGridlines>
          <template #empty>
            <div class="text-center py-6 text-gray-400">데이터 없음</div>
          </template>
          <Column selectionMode="single" style="width: 4px; text-align: center" />
          <Column field="line_code" header="라인코드" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
          <Column field="line_name" header="라인명" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
          <Column field="line_type" header="라인유형" headerClass="table-header" bodyClass="table-body" style="width: 60px" />
          <Column field="note" header="비고" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
          <Column field="is_used" header="사용여부" headerClass="table-header" bodyClass="table-body" style="width: 95px" />
        </DataTable>
        <template #footer>
          <div class="flex gap-2 justify-center">
            <Button label="확인" @click="selectLine" />
            <Button label="취소" @click="closeLineModal" />
          </div>
        </template>
      </Dialog>
    </div>
  </div>
</template>

<style>
th,
td {
  padding: 4px;
  text-align: left;
}
td {
  padding-right: 20px;
}
</style>
