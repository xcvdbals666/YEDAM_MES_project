<script setup>
import { useProductionStore } from '@/stores/production2';
import { reactive, ref, watch, onMounted } from 'vue';

const store = useProductionStore();

const displayPrdpModal = ref(false); // 생산계획 모달
const displayMaterialModal = ref(false); // 자재 모달
const searchKeyword = ref(''); // 검색어
const selectedPrdp = ref({}); // 생산계획 모달에서 선택한 데이터
const selectedMaterial = ref([]); // 자재 모달에서 선택한 데이터
const prdpList = ref([]); // 검색한 생산계획 목록
const materialList = ref([]); // 검색한 자재 목록
const mrpMaterialList = ref([]); // 행으로 추가한 자재 목록
const selectedMrpMaterialList = ref([]); // 선택한 행
let rownum = 0; // 임시 인덱스
const user = JSON.parse(localStorage.getItem('user'));

// MRP 정보
const mrpInfo = reactive({
  mrpCode: '',
  prdpCode: '',
  planDate: new Date(),
  startDate: '',
  reg: user.emp_code,
  empName: user.emp_name,
  note: ''
});

onMounted(async () => {
  if (!store.mrpCode) return;
  const { info, matList } = await store.fetchMRPDetail();
  console.log(info);
  mrpInfo.mrpCode = info[0].mrp_code;
  mrpInfo.prdpCode = info[0].prdp_code;
  mrpInfo.planDate = new Date(info[0].plan_date);
  mrpInfo.startDate = new Date(info[0].start_date);
  mrpInfo.reg = info[0].emp_code;
  mrpInfo.empName = info[0].emp_name;
  mrpInfo.note = info[0].mrp_note;

  for (const data of matList) {
    const row = {
      mrp_d_code: data.mrp_d_code,
      mat_code: data.mat_code,
      mat_name: data.mat_name,
      req_qtt: data.req_qtt,
      inven: data.inven,
      unit: data.unit,
      unit_note: data.unit_note,
      is_delete: false
    };
    rownum += 1;
    mrpMaterialList.value.push(row);
  }

  mrpMaterialList.value = matList;
});

// mrp 삭제
const remove = async () => {
  if (confirm('정말로 삭제하시겠습니까?')) {
    const result = await store.deleteMrp(mrpInfo.mrpCode);
    if (result.status == 'success') {
      alert('삭제되었습니다!');
      reset();
      return;
    }
  } else {
    return;
  }
};

// mrp 정보 초기화
const reset = () => {
  mrpInfo.mrpCode = '';
  mrpInfo.prdpCode = '';
  mrpInfo.prdpDate = new Date();
  mrpInfo.startDate = '';
  mrpInfo.reg = user.emp_code;
  mrpInfo.empName = user.emp_name;
  mrpInfo.note = '';
  mrpMaterialList.value = [];
};

// mrp 저장
const save = async () => {
  if (!mrpInfo.prdpCode) {
    alert('생산계획을 선택해 주십시오.');
    return;
  }

  if (confirm('저장하시겠습니까?')) {
    const result = await store.saveMrp(mrpMaterialList.value, mrpInfo);
    if (result.status == 'success') {
      mrpInfo.mrpCode = result.mrpCode;
      alert('저장되었습니다!');
    } else {
      alert('저장에 실패하였습니다.');
    }
  }
};

// 생산계획 모달 열기
const openPrdpModal = () => {
  searchPrdp();
  displayPrdpModal.value = true;
};

// 생산계획 모달 닫기
const closePrdpModal = () => {
  displayPrdpModal.value = false;
};

// 생산계획 선택
const selectPrdp = async () => {
  mrpInfo.prdpCode = selectedPrdp.value.prdp_code;
  mrpInfo.prdpDate = new Date(selectedPrdp.value.prdp_date);
  mrpInfo.reg = selectedPrdp.value.reg;
  mrpInfo.empName = selectedPrdp.value.emp_name;
  mrpInfo.startDate = new Date(selectedPrdp.value.start_date);
  mrpInfo.note = selectedPrdp.value.note;

  prdpList.value = [];
  searchKeyword.value = '';
  selectedPrdp.value = {};
  closePrdpModal();
};

// 생산계획 검색
const searchPrdp = async () => {
  const list = await store.fetchPrdps({ q: searchKeyword.value });
  prdpList.value = list;
};

// 선택 자재 삭제
const deleteList = () => {
  if (!selectedMrpMaterialList.value || selectedMrpMaterialList.value.length === 0) {
    alert('삭제할 항목을 선택하여 주십시오.');
    return;
  }
  if (confirm('정말 삭제하시겠습니까?')) {
    selectedMrpMaterialList.value.forEach((row) => {
      row.is_delete = true;
    });
    selectedMrpMaterialList.value = [];
    alert('삭제되었습니다.');
  } else {
    return;
  }
};

// 자재 검색 모달 열기
const openMaterialModal = () => {
  searchMaterial();
  displayMaterialModal.value = true;
};

// 자재 검색 모달 닫기
const closeMaterialModal = () => {
  displayMaterialModal.value = false;
};

// 자재 선택
const selectMaterial = () => {
  if (!selectedMaterial.value) {
    alert('자재를 선택하여 주십시오.');
    return;
  }
  for (const data of selectedMaterial.value) {
    const row = {
      mrp_d_code: `TEMP-${rownum}`, // 임시 code 부여 백에서 처리
      mat_code: data.mat_code,
      mat_name: data.mat_name,
      req_qtt: 0,
      inven: data.inven,
      unit: data.unit,
      unit_note: data.unit_note,
      is_delete: false
    };
    rownum += 1;
    mrpMaterialList.value.push(row);
  }

  searchKeyword.value = '';
  materialList.value = [];
  selectedMaterial.value = [];
  closeMaterialModal();
};

// 자재 검색
const searchMaterial = async () => {
  const list = await store.fetchMaterials({ q: searchKeyword.value });
  materialList.value = list.map((item) => ({
    ...item
  }));
};

// BOM 불러오기
const importBOM = async () => {
  if (!mrpInfo.prdpCode) {
    alert('생산계획을 먼저 불러와야 BOM을 불러올 수 있습니다.');
    return;
  }
  const result = await store.fetchBoms(mrpInfo.prdpCode);
  const list = [];
  for (const data of result) {
    const row = {
      mrp_d_code: `TEMP-${rownum}`, // 임시 code 부여 백에서 처리
      mat_code: data.mat_code,
      mat_name: data.mat_name,
      req_qtt: data.req_qtt,
      inven: data.inven,
      unit: data.unit,
      unit_note: data.unit_note,
      is_delete: false
    };
    rownum += 1;
    list.push(row);
  }
  mrpMaterialList.value = list;
};
</script>
<template>
  <div>
    <div class="card">
      <div class="pb-4 flex justify-between">
        <div class="font-semibold text-xl">MRP</div>
        <div class="flex gap-2 pr-6">
          <Button icon="pi pi-trash" label="삭제" severity="danger" @click="remove" :disabled="!mrpInfo.mrpCode"></Button>
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
              <td><InputText placeholder="MRP 코드" v-model="mrpInfo.mrpCode" disabled></InputText></td>
              <th>생산계획코드</th>
              <td><InputText v-model="mrpInfo.prdpCode" disabled></InputText></td>
            </tr>
            <tr>
              <th>계획수립일</th>
              <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="mrpInfo.planDate" dateFormat="yy-mm-dd" disabled></DatePicker></td>
              <th>생산시작일</th>
              <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="mrpInfo.startDate" dateFormat="yy-mm-dd" disabled></DatePicker></td>
            </tr>
            <tr>
              <th>작성자</th>
              <td><InputText v-model="mrpInfo.empName" disabled></InputText></td>
              <th>비고</th>
              <td><InputText v-model="mrpInfo.note"></InputText></td>
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
        <DataTable :value="prdpList" v-model:selection="selectedPrdp" sortField="prdp_code" :sortOrder="-1" :paginator="true" :rows="10" dataKey="prdp_code" :rowHover="true" showGridlines>
          <template #empty>
            <div class="text-center py-6 text-gray-400">데이터 없음</div>
          </template>
          <Column selectionMode="single" style="width: 4px; text-align: center" />
          <Column sortable field="prdp_code" header="생산계획코드" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
          <Column field="prdp_name" header="계획명" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
          <Column sortable field="prdp_date" header="계획일자" headerClass="table-header" bodyClass="table-body" style="width: 95px">
            <template #body="{ data }">
              {{ data.prdp_date.slice(0, 10) }}
            </template>
          </Column>
          <Column sortable field="start_date" header="계획시작일" headerClass="table-header" bodyClass="table-body" style="width: 95px">
            <template #body="{ data }">
              {{ data.start_date.slice(0, 10) }}
            </template>
          </Column>
          <Column sortable field="end_date" header="계획종료일" headerClass="table-header" bodyClass="table-body" style="width: 95px">
            <template #body="{ data }">
              {{ data.end_date.slice(0, 10) }}
            </template>
          </Column>
          <Column sortable field="due_date" header="납기일자" headerClass="table-header" bodyClass="table-body" style="width: 95px">
            <template #body="{ data }">
              {{ data.due_date.slice(0, 10) }}
            </template>
          </Column>
          <Column field="emp_name" header="작성자" headerClass="table-header" bodyClass="table-body" style="width: 60px" />
          <Column field="note" header="비고" headerClass="table-header" bodyClass="table-body" style="width: 100px" />
        </DataTable>
        <template #footer>
          <div class="flex gap-2 justify-center">
            <Button label="확인" @click="selectPrdp" />
            <Button label="취소" severity="secondary" @click="closePrdpModal" />
          </div>
        </template>
      </Dialog>
    </div>
    <div class="card">
      <div class="flex justify-between pb-4">
        <div class="font-semibold text-xl">자재</div>
        <div class="flex gap-2">
          <Button icon="pi pi-trash" label="선택 삭제" severity="danger" @click="deleteList"></Button>
          <Button icon="pi pi-plus" label="자재 추가" @click="openMaterialModal"></Button>
          <Button icon="pi pi-plus" label="BOM 불러오기" severity="info" @click="importBOM"></Button>
        </div>
      </div>
      <DataTable v-model:selection="selectedMrpMaterialList" :value="mrpMaterialList.filter((row) => !row.is_delete)" :paginator="true" :rows="6" dataKey="mrp_d_code" :rowHover="true" showGridlines>
        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>
        <Column selectionMode="multiple" style="width: 20px" />
        <Column field="mat_name" header="자재명" headerClass="table-header" bodyClass="table-body" style="width: 160px"></Column>
        <Column field="req_qtt" header="필요수량" headerClass="table-header" bodyClass="table-body" style="width: 80px">
          <template #body="{ data }">
            <InputNumber v-model="data.req_qtt" showButtons mode="decimal" inputClass="w-40" :min="0"></InputNumber>
          </template>
        </Column>
        <Column field="inven" header="현재재고" headerClass="table-header" bodyClass="table-body" style="width: 120px"> </Column>
        <Column field="unit_note" header="단위" headerClass="table-header" bodyClass="table-body" style="width: 120px"> </Column>
      </DataTable>

      <!-- 자재 추가 모달 -->
      <Dialog header="자재 검색" v-model:visible="displayMaterialModal" :breakpoints="{ '960px': '75vw' }" :style="{ width: '80vw' }" :modal="true">
        <Fluid class="pb-4">
          <IconField iconPosition="left">
            <InputText type="text" placeholder="자재코드 또는 자재명 검색" v-model="searchKeyword" @keyup.enter="searchMaterial" />
            <InputIcon class="pi pi-search" @click="searchMaterial" />
          </IconField>
        </Fluid>
        <DataTable :value="materialList" v-model:selection="selectedMaterial" :paginator="true" :rows="10" dataKey="mat_code" :rowHover="true" showGridlines>
          <template #empty>
            <div class="text-center py-6 text-gray-400">데이터 없음</div>
          </template>
          <Column selectionMode="multiple" style="width: 4px; text-align: center" />
          <Column field="mat_code" header="자재코드" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
          <Column field="mat_name" header="자재명" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
          <Column field="mat_type" header="자재유형" headerClass="table-header" bodyClass="table-body" style="width: 60px" />
          <Column field="unit_note" header="단위" headerClass="table-header" bodyClass="table-body" style="width: 60px" />
          <Column field="note" header="비고" headerClass="table-header" bodyClass="table-body" style="width: 140px" />
        </DataTable>
        <template #footer>
          <div class="flex gap-2 justify-center">
            <Button label="확인" @click="selectMaterial" />
            <Button label="취소" severity="secondary" @click="closeMaterialModal" />
          </div>
        </template>
      </Dialog>
    </div>
  </div>
</template>

<style scoped>
th,
td {
  padding: 4px;
  text-align: left;
}
td {
  padding-right: 20px;
}
</style>
