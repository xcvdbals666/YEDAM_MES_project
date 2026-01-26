<!--QcrInfo.vue-->
<!--품질검사항목 추가 및 수정-->
<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useQuality1Store } from '../../stores/quality1.js';

import axios from 'axios';

import SelectBomModal from '../../components/quality/modal/SelectBomModal.vue';
import { FilterMatchMode } from '@primevue/core/api';

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const selectedProducts = ref([]);

const qualityStore = useQuality1Store();

onBeforeMount(async () => {
  await qualityStore.fetchQcrList();
});

// 모달 표시 여부
const orderDisplay = ref(false);

// 모달 열기
let allBomInfo = ref([]);
const openModal = async () => {
  await qualityStore.fetchQiProdList();
  await qualityStore.fetchQiBomList();
  allBomInfo.value = [...qualityStore.qiProdInfo, ...qualityStore.qiBomInfo];
  console.log('allBomInfo', allBomInfo.value);

  orderDisplay.value = true;
};

// 모달 닫기
const closeModal = () => {
  orderDisplay.value = false;
};

// 모달에서 선택된 지시서 받기
let selectedQcr = ref({ mat_code: '', mat_name: '', unit_name: '' });
const selectedOrder = async (orders) => {
  if (!orders || orders.length === 0) {
    orderDisplay.value = false;
    return;
  }

  orders.regdate = formatDate(orders.regdate);
  selectedQcr.value = orders;

  console.log('selectedQcr: ', selectedQcr.value);

  await qualityStore.fetchQiList(orders.mat_code);
  for (let data of qualityStore.qcrList) {
    qualityStore.qiList.forEach((info) => {
      if (info.qcr_code == data.qcr_code) {
        selectedProducts.value.push(data);
      }
    });
  }

  let typeQcr = ref([]);
  qualityStore.qcrList.forEach((data) => {
    if (data.type == selectedQcr.value.prod_type || data.type == selectedQcr.value.mat_type) {
      typeQcr.value.push(data);
    }
  });

  qualityStore.qcrList = typeQcr.value;

  orderDisplay.value = false;
};

const formatDate = (date) => {
  if (!date) return '';

  // date가 문자열이면 그냥 slice
  if (typeof date === 'string') {
    return date.slice(0, 10); // YYYY-MM-DD
  }

  // date가 Date 객체라면 로컬 날짜 기준으로 처리
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
};

// 초기화버튼
const resetQcrForm = async () => {
  await qualityStore.fetchQcrList();

  selectedQcr.value = { qcr_code: '', inspection_item: '', range_top: '', range_bot: '', note: '', unit: '', regdate: '', check_method: '' };
  selectedQcr.value.regdate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
  selectedProducts.value = [];
  qualityStore.qiList = [];
};

// 제품별 품질검사 항목 등록

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
    console.log('전송중');
  });
};

const addQiInfo = async (data) => {
  if (data.length == 0) {
    alert('검사항목을 선택해주세요');
    return;
  }
  let submitInfo = {};
  let count = ref(0);
  for (let info of data) {
    submitInfo = { prod_code: selectedQcr.value.mat_code, qcr_code: info.qcr_code };
    console.log('전송 데이터: ', submitInfo);
    await axios //
      .post('/api/quality/addqiinfo', submitInfo)
      .then((res) => {
        if (res.data.affectedRows == 1) {
          count.value++;
        }
      });
    await sleep(100);
  }
  if (count.value == data.length) {
    alert(`총${count.value}건 등록 완료`);
  }
  await resetQcrForm();
};

// 검사항목 추가
const updateQcrForm = async (data) => {
  console.log('중복제거전', data);
  let count = ref(0);

  let qcr_code = ref([]);
  data.forEach((info) => {
    qualityStore.qiList.forEach((list) => {
      if (info.qcr_code == list.qcr_code) {
        qcr_code.value.push(info.qcr_code);
      }
    });
  });

  let submitInfo = data.filter((info) => !qcr_code.value.includes(info.qcr_code));

  console.log('전송데이터: ', submitInfo);

  for (let info of submitInfo) {
    let newInfo = { prod_code: selectedQcr.value.mat_code, qcr_code: info.qcr_code };
    console.log('전송 데이터: ', newInfo);
    await axios //
      .post('/api/quality/addqiinfo', newInfo)
      .then((res) => {
        if (res.data.affectedRows == 1) {
          count.value++;
        }
      });
    await sleep(100);
  }
  if (count.value == submitInfo.length) {
    alert(`총${count.value}건 등록 완료`);
    resetQcrForm();
    return;
  }
};

// qi삭제
const delQiInfo = async () => {
  if (!confirm('삭제하시겠습니까?')) {
    return;
  }
  await axios //
    .delete('/api/quality/removeqi/' + selectedQcr.value.mat_code)
    .then((res) => {
      if (res.data.affectedRows >= 1) {
        alert('삭제완료');
      }
    });
  await resetQcrForm();
};
</script>

<!---->

<template>
  <div class="card border border-gray-200 flex flex-col gap-3 p-fluid">
    <!--모달창-->
    <SelectBomModal :display="orderDisplay" :key="allBomInfo" :all-bom-info="allBomInfo" @close="closeModal" @selected-order="selectedOrder" />
    <!------------------------------------------------------------------------------------------------->
    <!-- 검색이 되어야 하는 창-->
    <div class="text-2xl font-bold text-center mb-2">제품별 품질검사항목</div>

    <!-- 검색 조건 영역 -->
    <div class="grid grid-cols-3 gap-6">
      <!-- 지시코드 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">제품코드</label>
        <InputText v-model="selectedQcr.mat_code" placeholder="제품코드" class="w-full cursor-pointer" readonly />
      </div>
      <div class="flex flex-col gap-2">
        <label class="font-semibold">제품명</label>
        <InputText v-model="selectedQcr.mat_name" placeholder="제품명" class="w-full cursor-pointer" readonly />
      </div>
      <!-- 검사유형 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">제품유형</label>
        <InputText v-model="selectedQcr.unit_name" placeholder="제품유형" class="w-full" readonly />
      </div>
    </div>

    <!-- 버튼 영역 -->
    <div class="flex items-center justify-end mt-2">
      <!-- 왼쪽 영역 -->

      <Button label="제품 선택" severity="info" @click="openModal" />
    </div>
  </div>
  <div>
    <section class="col-span-7 flex-1 bg-white px-6 pt-5 pb-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
      <div class="flex items-center justify-end mb-2">
        <div class="flex flex gap-1">
          <Button label="초기화" @click="resetQcrForm" severity="secondary" />
          <Button label="저장" @click="updateQcrForm(selectedProducts)" v-if="qualityStore.qiList.length > 0" />
          <Button label="삭제" @click="delQiInfo" severity="danger" v-if="qualityStore.qiList.length > 0" />

          <Button label="등록" @click="addQiInfo(selectedProducts)" v-else />
        </div>
      </div>
      <!------------------------------------------------------------------------------------------------->

      <!--수정해야함-->
      <div class="flex-1 overflow-auto rounded-lg border border-gray-200">
        <DataTable :filters="filters" :value="qualityStore.qcrList" v-model:selection="selectedProducts" rowHover class="hover-table" scrollable scrollHeight="900px">
          <template #empty>
            <div class="text-center py-6 text-gray-400">데이터 없음</div>
          </template>
          <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
          <Column header="품질기준코드" field="qcr_code" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 10rem" />

          <Column header="검사항목" field="inspection_item" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 10rem" />
          <Column header="검사대상" field="note" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 8rem" />
          <Column header="상한" field="range_top" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 6rem" />
          <Column header="하한" field="range_bot" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 6rem" />
          <Column header="단위" field="unit" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 6rem" />
          <Column field="regdate" header="등록일자" headerClass="table-header" bodyClass="table-body" sortable style="min-width: 8rem">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.regdate) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </section>
  </div>
</template>
<style scoped>
/* hover 시 텍스트 살짝 강조 */
.hover-table :deep(.p-datatable-tbody > tr:hover td) {
  font-weight: 500;
}
</style>
