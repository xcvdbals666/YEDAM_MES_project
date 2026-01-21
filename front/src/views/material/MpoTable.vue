<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { useMaterialStore } from '@/stores/material1';
import { useMaterialStore as useMaterialStore2 } from '@/stores/material2';
import SelectMrpModal from '@/components/material/modal/SelectMrpModal.vue';
import AddMaterialModal from '@/components/material/modal/AddMaterialModal.vue';
import SelectEmployeeModal from '@/components/material/modal/SelectEmployeeModal.vue';
import SelectMpoModal from '@/components/material/modal/SelectMpoModal.vue';

const mpoStore = useMaterialStore();
const showMrpModal = ref(false);
const showAddModal = ref(false);
const showMpoModal = ref(false);
const showEmployee = ref(false);
const empStore = useMaterialStore2();

const selectedMaterials = ref([]);

// 페이지를 떠날 때 초기화
onBeforeUnmount(() => {
  mpoStore.resetStore();
});

const unitMap = {
  h1: 'kg',
  h2: 't',
  h3: 'L',
  h4: 'ea',
  h5: 'box',
  h6: 'g',
  h7: 'mm',
  h8: '%',
  h9: 'cm',
  ha: 'N'
};
const getUnitName = (code) => unitMap[code] || code;

// 사원 선택 시
const handleSelectEmployee = (employee) => {
  mpoStore.mpoData.mcode = employee.emp_code;
  mpoStore.mpoData.mcodeName = employee.emp_name;
};

// 자재 추가 함수 추가
const addMaterialToTable = (mat) => {
  mpoStore.materials.push({
    mat_code: mat.mat_code,
    mat_name: mat.mat_name,
    material_type_code: mat.material_type_code,
    unit: mat.unit,
    req_qtt: mat.req_qtt || 0,
    current_stock: mat.current_stock || 0,
    shortage_qtt: 0,
    delivery_date: mat.delivery_date || '',
    supplier_name: mat.supplier_name,
    client_code: mat.client_code
  });
};

// mpr 선택 시
const handleSelectMpr = async (mpr) => {
  mpoStore.mpoData.mprCode = mpr.mpr_code;
  // mrp_code로 자재 조회
  await mpoStore.fetchMprMaterials(mpr.mpr_code);
};

// 발주서 선택 시 함수 추가
const handleSelectMpo = async (mpo) => {
  await mpoStore.fetchMpoDetail(mpo.purchase_code);
};

// 자재추가 버튼 클릭 시 모달 열기
const openAddModal = () => {
  showAddModal.value = true;
};

// 자재 삭제
const deleteMaterials = () => {
  if (selectedMaterials.value.length === 0) {
    alert('삭제할 자재를 선택해주세요.');
    return;
  }
  const selectedCodes = selectedMaterials.value.map((m) => m.mat_code);
  mpoStore.materials = mpoStore.materials.filter((m) => !selectedCodes.includes(m.mat_code));
  selectedMaterials.value = [];
};

// 발주서 삭제
const deleteMpo = async () => {
  if (!mpoStore.mpoData.purchaseCode) {
    alert('삭제할 발주서를 선택해주세요.');
    return;
  }

  if (!confirm('정말 삭제하시겠습니까?')) {
    return;
  }

  try {
    const result = await mpoStore.deleteMpo(mpoStore.mpoData.purchaseCode);
    if (result.status === 'success') {
      alert('삭제되었습니다!');
      resetForm();
    } else {
      alert('삭제 실패');
    }
  } catch (err) {
    alert('삭제 실패');
    console.error(err);
  }
};

// 초기화
const resetForm = () => {
  mpoStore.mpoData = {
    purchaseCode: '',
    purchaseReqDate: new Date(),
    mcode: '',
    mcodeName: '',
    stat: '요청완료',
    mprCode: '',
    note: ''
  };
  mpoStore.materials = [];
  selectedMaterials.value = [];
};

const saveMpo = async () => {
  const payload = {
    stat: mpoStore.mpoData.stat,
    mcode: mpoStore.mpoData.mcode,
    note: mpoStore.mpoData.note || '',
    materials: mpoStore.materials.map((m) => ({
      mat_code: m.mat_code,
      unit: m.unit,
      req_qtt: m.req_qtt,
      deadline: m.delivery_date,
      client_code: m.client_code
    }))
  };

  try {
    let result;

    // 발주서번호가 있으면 수정, 없으면 신규
    if (mpoStore.mpoData.purchaseCode) {
      // 수정
      payload.purchase_code = mpoStore.mpoData.purchaseCode;
      result = await mpoStore.updateMpo(payload);
      if (result.status === 'success') {
        alert('수정되었습니다!');
      } else {
        alert('수정 실패');
      }
    } else {
      // 신규
      result = await mpoStore.saveMpo(payload);
      if (result.status === 'success') {
        alert('저장되었습니다!');
        mpoStore.mpoData.purchaseCode = result.no;
      } else {
        alert('저장 실패');
      }
    }
  } catch (err) {
    alert('저장 실패');
    console.error(err);
  }
};
</script>

<template>
  <div>
    <!-- 발주 기본정보 -->
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <div class="font-semibold text-xl">발주 기본정보</div>
        <div class="flex gap-2">
          <Button label="삭제" severity="danger" size="small" @click="deleteMpo" />
          <Button label="초기화" severity="contrast" size="small" @click="resetForm" />
          <Button label="저장" severity="info" size="small" @click="saveMpo" />
          <Button label="발주정보 불러오기" severity="success" size="small" @click="showMpoModal = true" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <!-- 왼쪽 -->
        <div class="flex flex-col gap-3">
          <div>
            <label class="block mb-1 text-sm font-medium">발주서번호</label>
            <InputText v-model="mpoStore.mpoData.purchaseCode" disabled class="w-full" />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium">작성자</label>
            <InputText v-model="mpoStore.mpoData.mcodeName" placeholder="작성자 선택" class="w-full" readonly @click="showEmployee = true" />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium">자재구매요청서번호</label>
            <InputText v-model="mpoStore.mpoData.mprCode" disabled class="w-full" />
          </div>
        </div>

        <!-- 오른쪽 -->
        <div class="flex flex-col gap-3">
          <div>
            <label class="block mb-1 text-sm font-medium">발주제안일</label>
            <DatePicker v-model="mpoStore.mpoData.purchaseReqDate" showIcon dateFormat="yy-mm-dd" class="w-full" />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium">발주상태</label>
            <InputText v-model="mpoStore.mpoData.stat" disabled class="w-full" />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium">비고</label>
            <InputText v-model="mpoStore.mpoData.note" placeholder="특이사항 입력" class="w-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- 자재 상세목록 -->
    <div class="card mt-4">
      <div class="flex justify-between items-center mb-4">
        <div class="font-semibold text-xl">자재 상세목록</div>
        <div class="flex gap-2">
          <Button label="자재추가" severity="info" size="small" @click="openAddModal" />
          <Button label="자재삭제" severity="danger" size="small" @click="deleteMaterials" />
          <Button label="자재구매요청서 불러오기" severity="success" size="small" @click="showMrpModal = true" />
        </div>
      </div>

      <DataTable :value="mpoStore.materials" v-model:selection="selectedMaterials" dataKey="mat_code" showGridlines>
        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>

        <Column selectionMode="multiple" style="width: 50px" />

        <Column field="mat_name" header="자재명" style="min-width: 200px">
          <template #body="{ data }">
            <InputText v-model="data.mat_name" class="w-full" />
          </template>
        </Column>

        <Column field="material_type_code" header="자재유형" style="min-width: 100px">
          <template #body="{ data }">
            <InputText :value="data.material_type_code === 't1' ? '원자재' : '부자재'" disabled class="w-full" />
          </template>
        </Column>

        <Column field="mat_code" header="자재코드" style="min-width: 120px">
          <template #body="{ data }">
            <InputText v-model="data.mat_code" disabled class="w-full" />
          </template>
        </Column>

        <Column field="unit" header="단위" style="min-width: 80px">
          <template #body="{ data }">
            <InputText :value="getUnitName(data.unit)" disabled class="w-full" />
          </template>
        </Column>

        <Column field="req_qtt" header="필요수량" style="width: 90px">
          <template #body="{ data }">
            <InputNumber v-model="data.req_qtt" class="w-full" />
          </template>
        </Column>

        <Column field="current_stock" header="현재고" style="min-width: 100px">
          <template #body="{ data }">
            <InputText :value="data.current_stock" disabled class="w-full" />
          </template>
        </Column>

        <Column field="shortage_qtt" header="부족수량" style="min-width: 100px">
          <template #body="{ data }">
            <InputText :value="data.shortage_qtt" disabled class="w-full" />
          </template>
        </Column>

        <Column field="delivery_date" header="입고납기일" style="width: 200px">
          <template #body="{ data }">
            <DatePicker v-model="data.delivery_date" showIcon dateFormat="yy-mm-dd" class="w-full" />
          </template>
        </Column>

        <Column field="supplier_name" header="공급업체" style="min-width: 120px">
          <template #body="{ data }">
            <InputText v-model="data.supplier_name" disabled class="w-full" />
          </template>
        </Column>
      </DataTable>
      <div v-if="showAddPanel" class="mb-4 p-4 border rounded bg-gray-50">
        <div class="flex gap-3 items-center">
          <InputNumber v-model="newItem.req_qtt" placeholder="발주수량" class="w-32" />

          <DatePicker v-model="newItem.delivery_date" showIcon dateFormat="yy-mm-dd" class="w-40" />

          <Button label="추가" severity="success" size="small" @click="addRow" />
          <Button label="취소" severity="secondary" size="small" @click="cancelAdd" />
        </div>
      </div>
    </div>
    <!-- 모달 -->
    <SelectMrpModal :visible="showMrpModal" @update:visible="showMrpModal = $event" @select="handleSelectMpr" />
    <AddMaterialModal :visible="showAddModal" @update:visible="showAddModal = $event" @add="addMaterialToTable" />
    <!-- 사원 모달 -->
    <SelectEmployeeModal :visible="showEmployee" @update:visible="showEmployee = $event" @select="handleSelectEmployee" />
    <!--발주정보 불러오기 모달-->
    <SelectMpoModal :visible="showMpoModal" @update:visible="showMpoModal = $event" @select="handleSelectMpo" />
  </div>
</template>
<style scoped>
:deep(.p-datepicker) {
  width: 100%;
}
:deep(.p-datepicker-input) {
  width: 100%;
}
th,
td {
  padding: 8px;
  text-align: left;
}
td {
  padding-right: 20px;
}
</style>
