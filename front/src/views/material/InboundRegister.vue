<script setup>
import { ref } from 'vue';
import { useMaterialStore } from '@/stores/material1';
import SelectModal from '@/components/material/modal/SelectModal.vue';
import AddMaterialModal from '@/components/material/modal/AddMaterialModal.vue';

import InboundModal from '@/components/material/modal/InboundModal.vue';

const store = useMaterialStore();

// 입고 정보 입력 폼
const inboundForm = ref({
  matCode: '',
  matName: '',
  matType: '',
  unit: '',
  clientCode: '',
  clientName: '',
  empCode: '',
  empName: '',
  inbndQtt: null,
  inbndDate: null
});

// 입고 대기 목록
const inboundList = ref([]);

// 모달 상태
const showMatModal = ref(false);
const showClientModal = ref(false);
const showEmpModal = ref(false);
const showQirModal = ref(false);

// 행별 담당자 모달용
const currentRowIndex = ref(null);
const showRowEmpModal = ref(false);

// 단위 변환
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

// 자재유형 변환
const getMatTypeName = (code) => {
  if (code === 't1') return '원자재';
  if (code === 't2') return '부자재';
  return code;
};

// 자재 선택
const handleSelectMat = (mat) => {
  inboundForm.value.matCode = mat.mat_code;
  inboundForm.value.matName = mat.mat_name;
  inboundForm.value.matType = mat.material_type_code;
  inboundForm.value.unit = mat.unit;
  // 자재에 연결된 공급업체 정보가 있으면 자동 입력
  // if (mat.client_code) {
  //   inboundForm.value.clientCode = mat.client_code;
  //   inboundForm.value.clientName = mat.supplier_name;
  // }
};

// 공급업체 선택
const handleSelectClient = (client) => {
  inboundForm.value.clientCode = client.client_code;
  inboundForm.value.clientName = client.client_name;
};

// 담당자 선택 (상단 폼)
const handleSelectEmp = (emp) => {
  inboundForm.value.empCode = emp.emp_code;
  inboundForm.value.empName = emp.emp_name;
};

// 담당자 선택 (행별)
const openRowEmpModal = (index) => {
  currentRowIndex.value = index;
  showRowEmpModal.value = true;
};

const handleSelectRowEmp = (emp) => {
  if (currentRowIndex.value !== null) {
    inboundList.value[currentRowIndex.value].empCode = emp.emp_code;
    inboundList.value[currentRowIndex.value].empName = emp.emp_name;
  }
  showRowEmpModal.value = false;
};

// 품질검사 합격 목록 선택
const handleSelectQir = (items) => {
  items.forEach((item) => {
    // 중복 체크
    const exists = inboundList.value.some((row) => row.qirCode === item.qir_code);
    if (!exists) {
      inboundList.value.push({
        qirCode: item.qir_code,
        qioCode: item.qio_code,
        mpoDCode: item.mpo_d_code,
        matCode: item.mat_code,
        matName: item.mat_name,
        matType: item.material_type_code,
        unit: item.unit,
        clientCode: item.client_code,
        clientName: item.client_name,
        empCode: item.emp_code || '',
        empName: item.emp_name || '',
        inbndQtt: item.pass_qtt || 0,
        inbndDate: new Date()
      });
    }
  });
};

// 추가 버튼
const addToList = () => {
  if (!inboundForm.value.matCode) {
    alert('자재를 선택해주세요.');
    return;
  }
  if (!inboundForm.value.clientCode) {
    alert('공급업체를 선택해주세요.');
    return;
  }
  if (!inboundForm.value.inbndQtt || inboundForm.value.inbndQtt <= 0) {
    alert('입고수량을 입력해주세요.');
    return;
  }
  if (!inboundForm.value.inbndDate) {
    alert('입고일자를 선택해주세요.');
    return;
  }

  inboundList.value.push({
    qirCode: null,
    qioCode: null,
    mpoDCode: null,
    matCode: inboundForm.value.matCode,
    matName: inboundForm.value.matName,
    matType: inboundForm.value.matType,
    unit: inboundForm.value.unit,
    clientCode: inboundForm.value.clientCode,
    clientName: inboundForm.value.clientName,
    empCode: inboundForm.value.empCode,
    empName: inboundForm.value.empName,
    inbndQtt: inboundForm.value.inbndQtt,
    inbndDate: inboundForm.value.inbndDate
  });

  resetForm();
};

// 상단 폼 초기화
const resetForm = () => {
  inboundForm.value = {
    matCode: '',
    matName: '',
    matType: '',
    unit: '',
    clientCode: '',
    clientName: '',
    empCode: '',
    empName: '',
    inbndQtt: null,
    inbndDate: null
  };
};

// 행 삭제
const deleteRow = (index) => {
  inboundList.value.splice(index, 1);
};

// 전체 취소
const cancelAll = () => {
  inboundList.value = [];
  resetForm();
};

// 날짜 포맷
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// 등록
const submitInbound = async () => {
  if (inboundList.value.length === 0) {
    alert('입고할 항목이 없습니다.');
    return;
  }

  // 담당자 확인
  const noEmp = inboundList.value.some((item) => !item.empCode);
  if (noEmp) {
    alert('모든 항목의 담당자를 선택해주세요.');
    return;
  }

  const payload = inboundList.value.map((item) => ({
    mat_code: item.matCode,
    mat_type: item.matType,
    unit: item.unit,
    inbnd_qtt: item.inbndQtt,
    inbnd_date: formatDate(item.inbndDate),
    mat_sup: item.clientCode,
    mcode: item.empCode,
    qio_code: item.qioCode
  }));

  const result = await store.addInbound(payload);

  if (result.status === 'success') {
    alert('입고 등록이 완료되었습니다!');
    cancelAll();
  } else {
    alert('등록에 실패했습니다.');
  }
};
</script>

<template>
  <div>
    <!-- 페이지 헤더 -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">자재 입고 등록</h2>
      <span class="text-sm text-gray-500">자재 관리 > 입고 등록</span>
    </div>

    <!-- 입고 정보 입력 -->
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h4 class="m-0 flex items-center gap-2">
          <i class="pi pi-pencil"></i>
          입고 정보 입력
        </h4>
        <span class="text-sm text-red-500">* 필수 입력 항목</span>
      </div>

      <div class="grid grid-cols-4 gap-4 mb-4">
        <!-- 자재코드 -->
        <div>
          <label class="block mb-1 text-sm font-medium">자재코드 *</label>
          <div class="flex gap-1">
            <InputText v-model="inboundForm.matCode" placeholder="자재코드를 검색하세요" class="flex-1" readonly />
            <Button icon="pi pi-search" severity="secondary" @click="showMatModal = true" />
          </div>
        </div>

        <!-- 자재명 -->
        <div>
          <label class="block mb-1 text-sm font-medium">자재명</label>
          <InputText v-model="inboundForm.matName" placeholder="자동 입력" class="w-full" disabled />
        </div>

        <!-- 자재분류 -->
        <div>
          <label class="block mb-1 text-sm font-medium">자재분류</label>
          <InputText :value="getMatTypeName(inboundForm.matType)" placeholder="분류" class="w-full" disabled />
        </div>

        <!-- 단위 -->
        <div>
          <label class="block mb-1 text-sm font-medium">단위</label>
          <InputText :value="getUnitName(inboundForm.unit)" placeholder="Unit" class="w-full" disabled />
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4 mb-4">
        <!-- 공급업체 -->
        <div>
          <label class="block mb-1 text-sm font-medium">공급업체 *</label>
          <div class="flex gap-1">
            <InputText v-model="inboundForm.clientName" placeholder="공급업체를 검색하세요" class="flex-1" readonly />
            <Button icon="pi pi-search" severity="secondary" @click="showClientModal = true" />
          </div>
        </div>

        <!-- 담당자 -->
        <div>
          <label class="block mb-1 text-sm font-medium">담당자</label>
          <div class="flex gap-1">
            <InputText v-model="inboundForm.empName" placeholder="담당자를 검색하세요" class="flex-1" readonly />
            <Button icon="pi pi-search" severity="secondary" @click="showEmpModal = true" />
          </div>
        </div>

        <!-- 입고수량 -->
        <div>
          <label class="block mb-1 text-sm font-medium">입고수량 *</label>
          <InputNumber v-model="inboundForm.inbndQtt" placeholder="수량 입력" class="w-full" />
        </div>

        <!-- 입고일자 -->
        <div>
          <label class="block mb-1 text-sm font-medium">입고일자 *</label>
          <DatePicker v-model="inboundForm.inbndDate" dateFormat="yy-mm-dd" placeholder="YYYY-MM-DD" showIcon class="w-full" />
        </div>
      </div>

      <!-- 버튼 -->
      <div class="flex justify-center gap-2">
        <Button label="추가" icon="pi pi-plus" severity="success" @click="addToList" />
        <Button label="초기화" icon="pi pi-refresh" severity="secondary" @click="resetForm" />
      </div>
    </div>

    <!-- 입고 대기 목록 -->
    <div class="card mt-4">
      <div class="flex justify-between items-center mb-4">
        <h4 class="m-0 flex items-center gap-2">
          <i class="pi pi-list"></i>
          입고 대기 목록
          <span class="text-sm text-gray-500">(총 {{ inboundList.length }}건)</span>
        </h4>
        <Button label="품질검사 합격 목록 불러오기" severity="success" @click="showQirModal = true" />
      </div>

      <DataTable :value="inboundList" showGridlines>
        <template #empty>
          <div class="text-center py-6 text-gray-400">추가된 입고 품목이 없습니다.</div>
        </template>

        <Column header="No." style="width: 60px">
          <template #body="{ index }">{{ index + 1 }}</template>
        </Column>

        <Column field="matCode" header="자재코드" sortable style="width: 120px">
          <template #body="{ data }">{{ data.matCode }}</template>
        </Column>

        <Column field="matName" header="자재명" sortable style="min-width: 150px">
          <template #body="{ data }">{{ data.matName }}</template>
        </Column>

        <Column header="분류" sortable style="width: 80px">
          <template #body="{ data }">{{ getMatTypeName(data.matType) }}</template>
        </Column>

        <Column header="단위" sortable style="width: 70px">
          <template #body="{ data }">{{ getUnitName(data.unit) }}</template>
        </Column>

        <Column field="clientName" header="공급업체" sortable style="width: 120px">
          <template #body="{ data }">{{ data.clientName }}</template>
        </Column>

        <Column header="담당자" style="width: 120px">
          <template #body="{ data, index }">
            <Button v-if="!data.empName" label="△ 선택" size="small" severity="success" @click="openRowEmpModal(index)" />
            <span v-else class="flex items-center gap-1">
              {{ data.empName }}
              <i class="pi pi-pencil text-xs cursor-pointer text-gray-400" @click="openRowEmpModal(index)"></i>
            </span>
          </template>
        </Column>

        <Column header="입고수량" sortable style="width: 100px">
          <template #body="{ data }">{{ data.inbndQtt }}</template>
        </Column>

        <Column header="입고일자" sortable style="width: 150px">
          <template #body="{ data }">{{ formatDate(data.inbndDate) }}</template>
        </Column>

        <Column header="삭제" style="width: 70px">
          <template #body="{ index }">
            <Button label="삭제" size="small" severity="danger" text @click="deleteRow(index)" />
          </template>
        </Column>
      </DataTable>

      <!-- 하단 버튼 -->
      <div class="flex justify-center gap-2 mt-4">
        <Button label="등록" icon="pi pi-check" severity="success" @click="submitInbound" />
        <Button label="취소" icon="pi pi-times" severity="secondary" @click="cancelAll" />
      </div>
    </div>

    <!-- 자재 모달 -->
    <AddMaterialModal :visible="showMatModal" @update:visible="showMatModal = $event" @add="handleSelectMat" />

    <!-- 공급업체 선택 -->
    <SelectModal :visible="showClientModal" type="client" @update:visible="showClientModal = $event" @select="handleSelectClient" />

    <!-- 담당자 선택 (상단 폼) -->
    <SelectModal :visible="showEmpModal" type="employee" @update:visible="showEmpModal = $event" @select="handleSelectEmp" />

    <!-- 담당자 선택 (행별) -->
    <SelectModal :visible="showRowEmpModal" type="employee" @update:visible="showRowEmpModal = $event" @select="handleSelectRowEmp" />

    <!-- 품질검사 합격 목록 모달 -->
    <InboundModal :visible="showQirModal" @update:visible="showQirModal = $event" @select="handleSelectQir" />
  </div>
</template>

<style scoped>
:deep(.p-datepicker) {
  width: 100%;
}
:deep(.p-inputnumber) {
  width: 100%;
}
</style>
