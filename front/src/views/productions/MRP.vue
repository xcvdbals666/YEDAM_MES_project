<script setup>
import { useProductionStore } from '@/stores/production2';
import { reactive, ref } from 'vue';

const store = useProductionStore();

const displayPrdpModal = ref(false); // 생산계획 모달
const displayMaterialModal = ref(false); // 자재 모달
const searchKeyword = ref(''); // 검색어
const selectedPrdp = ref({}); // 생산계획 모달에서 선택한 데이터
const selectedMaterial = ref({}); // 자재 모달에서 선택한 데이터
const prdpList = ref([]); // 검색한 생산계획 목록
const materialList = ref([]); // 검색한 자재 목록
const mrpMaterialList = ref([]); // 행으로 추가한 자재 목록
const idx = ref(null); // 선택한 인덱스(제품 및 라인 검색 결과 적용 용도)
let rownum = 0; // 임시 인덱스
const user = JSON.parse(localStorage.getItem('user'));

// MRP 정보
const mrpInfo = reactive({
  mrpCode: '',
  prdpCode: '',
  prdpDate: new Date(),
  startDate: '',
  reg: user.emp_code,
  empName: user.emp_name,
  note: ''
});

// 생산계획 삭제
const remove = () => {};

// 생산계획 초기화
const reset = () => {
  planInfo.prdpCode = '';
  planInfo.prdpName = '';
  planInfo.prdpDate = '';
  planInfo.reg = user.emp_code;
  planInfo.empName = user.emp_name;
  planInfo.startDate = '';
  planInfo.endDate = '';
  planInfo.ordCode = '';
  planInfo.dueDate = '';
  planInfo.note = '';
  planProdList.value = [];
};

// 생산계획 저장
const save = async () => {
  if (!planInfo.prdpName) {
    alert('계획명을 입력해 주십시오.');
    return;
  }

  if (!planInfo.startDate) {
    alert('계획 시작일을 입력해 주십시오.');
    return;
  }

  if (!planInfo.endDate) {
    alert('계획 종료일을 입력해 주십시오.');
    return;
  }

  if (!planInfo.dueDate) {
    alert('납기일자를 입력해 주십시오.');
    return;
  }

  if (confirm('저장하시겠습니까?')) {
    const result = await store.savePrdp(planProdList.value, planInfo);
    if (result.status == 'success') {
      planInfo.prdpCode = result.prdpCode;
      alert('저장되었습니다!');
    } else {
      alert('저장에 실패하였습니다.');
    }
  }
};

// 생산계획 모달 열기
const openPrdpModal = () => {
  displayPrdpModal.value = true;
};

// 생산계획 모달 닫기
const closePrdpModal = () => {
  displayPrdpModal.value = false;
};

// 생산계획 선택
const selectPrdp = async () => {
  planInfo.prdpCode = selectedPrdp.value.prdp_code;
  planInfo.prdpName = selectedPrdp.value.prdp_name;
  planInfo.prdpDate = new Date(selectedPrdp.value.prdp_date);
  planInfo.reg = selectedPrdp.value.reg;
  planInfo.empName = selectedPrdp.value.emp_name;
  planInfo.startDate = new Date(selectedPrdp.value.start_date);
  planInfo.endDate = new Date(selectedPrdp.value.end_date);
  planInfo.ordCode = selectedPrdp.value.ord_code;
  planInfo.dueDate = new Date(selectedPrdp.value.due_date);
  planInfo.note = selectedPrdp.value.note;
  prdpList.value = [];
  searchKeyword.value = '';
  selectedPrdp.value = {};

  // 생산계획 제품목록 가져오기
  const list = await store.fetchPlanProds(planInfo.prdpCode);
  planProdList.value = list.map((item) => ({
    ...item,
    is_delete: false
  }));

  closePrdpModal();
};

// 생산계획 검색
const searchPrdp = async () => {
  const list = await store.fetchPrdps({ q: searchKeyword.value });
  prdpList.value = list;
};

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
  const row = {
    prdp_d_code: `TEMP-${rownum}`, // 임시 code 부여 백에서 실제 코드 처리
    prod_code: selectedOrder.value.prod_code,
    prod_name: selectedOrder.value.prod_name,
    emp_code: planInfo.reg,
    com_value: selectedOrder.value.com_value,
    unit: selectedOrder.value.unit,
    spec: selectedOrder.value.spec,
    planned_qtt: selectedOrder.value.ord_amount,
    priority: 0,
    line_code: '',
    is_delete: false
  };
  rownum += 1;
  planProdList.value.push(row);
  orderList.value = [];
  searchKeyword.value = '';
  selectedOrder.value = {};
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
  const row = {
    prdp_d_code: `TEMP-${rownum}`, // 임시 code 부여 백에서 처리
    prod_code: '',
    prod_name: '',
    emp_code: planInfo.reg,
    com_value: '',
    unit: '',
    spec: '',
    planned_qtt: 0,
    priority: 0,
    line_code: '',
    is_delete: false
  };
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
    selectedProdList.value.forEach((row) => {
      row.is_delete = true;
    });
    selectedProdList.value = [];
    alert('삭제되었습니다.');
  } else {
    return;
  }
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
  planProdList.value[idx.value].line_code = selectedLine.value.line_code;
  searchKeyword.value = '';
  lineList.value = [];
  selectedLine.value = {};
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
  planProdList.value[idx.value].prod_code = selectedProd.value.prod_code;
  planProdList.value[idx.value].prod_name = selectedProd.value.prod_name;
  planProdList.value[idx.value].com_value = selectedProd.value.com_value;
  planProdList.value[idx.value].unit = selectedProd.value.unit;
  planProdList.value[idx.value].spec = selectedProd.value.spec;

  searchKeyword.value = '';
  prodList.value = [];
  selectedProd.value = {};
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
          <Button icon="pi pi-plus" label="생산계획 불러오기" severity="info" @click="openPrdpModal"></Button>
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
              <th>MRP코드</th>
              <td><InputText placeholder="MRP 코드" v-model="mrpInfo.prdpCode" disabled></InputText></td>
              <th>생산계획코드</th>
              <td><InputText v-model="planInfo.prdpCode" disabled></InputText></td>
            </tr>
            <tr>
              <th>계획수립일</th>
              <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="mrpInfo.prdpDate" disabled></DatePicker></td>
              <th>생산시작일</th>
              <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="mrpInfo.startDate" disabled></DatePicker></td>
            </tr>
            <tr>
              <th>작성자</th>
              <td><InputText v-model="mrpInfo.empName" disabled></InputText></td>
              <th>비고</th>
              <td><InputText v-model="mrpInfo.note" placeholder="특이사항 입력"></InputText></td>
            </tr>
          </tbody>
        </table>
      </Fluid>

      <!-- 생산계획 검색 모달 -->
      <Dialog header="생산계획 검색" v-model:visible="displayPrdpModal" :breakpoints="{ '960px': '75vw' }" :style="{ width: '90vw' }" :modal="true">
        <Fluid class="pb-4">
          <IconField iconPosition="left">
            <InputText type="text" placeholder="생산계획 코드 또는 계획명 검색" v-model="searchKeyword" @keyup.enter="searchPrdp" />
            <InputIcon class="pi pi-search" @click="searchPrdp" />
          </IconField>
        </Fluid>
        <DataTable :value="prdpList" v-model:selection="selectedPrdp" :paginator="true" :rows="10" dataKey="prdp_code" :rowHover="true" showGridlines>
          <template #empty>
            <div class="text-center py-6 text-gray-400">데이터 없음</div>
          </template>
          <Column selectionMode="single" style="width: 4px; text-align: center" />
          <Column field="prdp_code" header="생산계획코드" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
          <Column field="prdp_name" header="계획명" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
          <Column field="prdp_date" header="계획일자" headerClass="table-header" bodyClass="table-body" style="width: 95px">
            <template #body="{ data }">
              {{ data.prdp_date.slice(0, 10) }}
            </template>
          </Column>
          <Column field="start_date" header="계획시작일" headerClass="table-header" bodyClass="table-body" style="width: 95px">
            <template #body="{ data }">
              {{ data.start_date.slice(0, 10) }}
            </template>
          </Column>
          <Column field="end_date" header="계획종료일" headerClass="table-header" bodyClass="table-body" style="width: 95px">
            <template #body="{ data }">
              {{ data.end_date.slice(0, 10) }}
            </template>
          </Column>
          <Column field="due_date" header="납기일자" headerClass="table-header" bodyClass="table-body" style="width: 95px">
            <template #body="{ data }">
              {{ data.due_date.slice(0, 10) }}
            </template>
          </Column>
          <Column field="emp_name" header="작성자" headerClass="table-header" bodyClass="table-body" style="width: 60px" />
          <Column field="ord_code" header="주문코드" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
          <Column field="note" header="비고" headerClass="table-header" bodyClass="table-body" style="width: 100px" />
        </DataTable>
        <template #footer>
          <div class="flex gap-2 justify-center">
            <Button label="확인" @click="selectPrdp" />
            <Button label="취소" @click="closePrdpModal" />
          </div>
        </template>
      </Dialog>

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
      <DataTable v-model:selection="selectedProdList" :value="planProdList.filter((row) => !row.is_delete)" :paginator="true" :rows="8" dataKey="prdp_d_code" :rowHover="true" showGridlines>
        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>
        <Column selectionMode="multiple" style="width: 20px" />
        <Column field="prod_code" header="제품코드" headerClass="table-header" bodyClass="table-body" style="width: 120px">
          <template #body="{ data, index }">
            <IconField iconPosition="left" class="w-60" @click="openProdModal(index)">
              <InputText type="text" v-model="data.prod_code" class="w-60" readonly />
              <InputIcon class="pi pi-search" />
            </IconField>
          </template>
        </Column>
        <Column field="prod_name" header="제품명" headerClass="table-header" bodyClass="table-body" style="width: 120px"></Column>
        <Column field="com_value" header="제품유형" headerClass="table-header" bodyClass="table-body" style="width: 120px"> </Column>
        <Column field="unit" header="단위" headerClass="table-header" bodyClass="table-body" style="width: 120px"> </Column>
        <Column field="spec" header="규격" headerClass="table-header" bodyClass="table-body" style="width: 120px"> </Column>
        <Column field="planed_qtt" header="목표수량" headerClass="table-header" bodyClass="table-body" style="width: 80px">
          <template #body="{ data }">
            <InputNumber v-model="data.planned_qtt" showButtons mode="decimal" inputClass="w-30" :min="0"></InputNumber>
          </template>
        </Column>
        <Column field="priority" header="우선순위" headerClass="table-header" bodyClass="table-body" style="width: 80px">
          <template #body="{ data }">
            <InputNumber v-model="data.priority" showButtons mode="decimal" inputClass="w-20" :min="0"></InputNumber>
          </template>
        </Column>
        <Column field="line_code" header="생산라인" headerClass="table-header" bodyClass="table-body" style="width: 120px">
          <template #body="{ data, index }">
            <IconField iconPosition="left" class="w-50" @click="openLineModal(index)">
              <InputText type="text" v-model="data.line_code" class="w-50" readonly />
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
          <Column field="prod_code" header="제품코드" headerClass="table-header" bodyClass="table-body" style="width: 120px"></Column>
          <Column field="prod_name" header="제품명" headerClass="table-header" bodyClass="table-body" style="width: 120px"></Column>
          <Column field="com_value" header="유형" headerClass="table-header" bodyClass="table-body" style="width: 60px"> </Column>
          <Column field="unit" header="단위" headerClass="table-header" bodyClass="table-body" style="width: 60px"> </Column>
          <Column field="spec" header="규격" headerClass="table-header" bodyClass="table-body" style="width: 60px"> </Column>
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
