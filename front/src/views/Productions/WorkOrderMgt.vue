<!-- views/Productions/WorkOrderMgt.vue (작업지시서 관리) -->
<!-- 1. 생산계획 불러오기 (prdp_tbl, prdp_d_tbl)-->
<!-- 
  생산 계획을 지정해 작업 지시서를 생성할 수 있으며, 
  생산 계획이 없어도 작업 지시서를 생성할 수 있습니다.
  생산 계획이 선택된다면 생산 계획에 해당하는 제품만 선택이 가능하고,
  생산 라인도 선택된 제품이 사용 가능한 라인만 조회됩니다.
  작업 지시서 불러오기 버튼으로 등록된 작업 지시서를 수정할 수 있습니다 
  -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useProductionsStore } from '@/stores/production1';
import { storeToRefs } from 'pinia';

const store = useProductionsStore();
const { prdpList, prdpLoading, prdpError, prdpItems, allProducts } = storeToRefs(store);

const convertDate = (d) => {
  if (!d) return '';
  return d.slice(0, 10);
};

const selectedPlan = ref(null); //모달에서 생산계획 하나 선택

const form = ref({
  wko_code: '',
  prdp_code: '',
  prdp_date: '',
  prod_code: '',
  prod_name: '',
  wko_qtt: '',
  start_date: '',
  end_date: '',
  stat: '',
  line_code: '',
  line_type: ''
});

const prdpModalOpen = ref(false);

const openPrdpModal = async () => {
  prdpModalOpen.value = true;
  await store.fetchPrdpActive();
};

//생산계획 선택
const applySelectedPlan = async () => {
  if (!selectedPlan.value) return;

  form.value.prdp_code = selectedPlan.value.prdp_code;
  form.value.prdp_date = convertDate(selectedPlan.value.prdp_date);
  form.value.start_date = convertDate(selectedPlan.value.start_date);
  form.value.end_date = convertDate(selectedPlan.value.end_date);
  // 선택한 생산계획의 d테이블 상세 품목 조회(by prdp_code), 드롭다운 옵션 생성
  const items = await store.fetchPrdpItems(form.value.prdp_code);

  if (items?.length) {
    form.value.prod_code = items[0].prod_code;
    form.value.wko_qtt = items[0].planned_qtt;
    form.value.line_code = items[0].line_code;
  } else {
    form.value.prod_code = '';
    form.value.wko_qtt = '';
  }

  prdpModalOpen.value = false;
};

//제품명 드롭다운
const onProdChange = () => {
  //생산계획 안불러오고 작업시 자동세팅
  if (!form.value.prdp_code) return;

  const found = (prdpItems.value ?? []).find((x) => x.prod_code === form.value.prod_code);
  form.value.wko_qtt = found ? found.planned_qtt : '';
  form.value.line_code = found ? found.line_code : '';
  form.value.line_type = found ? found.line_type : '';
};

const productOptions = computed(() => {
  if (form.value.prdp_code) return prdpItems.value;

  return allProducts.value;
});

onMounted(() => {
  store.fetchAllPrdDistinct();
});
</script>

<template>
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <div class="font-semibold text-xl">기본정보</div>

      <div class="flex gap-2">
        <button class="p-button p-button-danger">삭제</button>
        <button class="p-button p-button-secondary">초기화</button>
        <button class="p-button p-button-info">저장</button>
        <button class="p-button p-button-success" @click="openPrdpModal">생산계획 불러오기</button>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-3">
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">작업지시번호</label>
        <input type="text" class="p-inputtext w-full" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">생산계획번호</label>
        <input type="text" class="p-inputtext w-full" v-model="form.prdp_code" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">계획일자</label>
        <input type="date" class="p-inputtext w-full" v-model="form.prdp_date" />
      </div>

      <div class="col-span-12 lg:col-span-6"></div>
    </div>
  </div>

  <div class="card">
    <div class="font-semibold text-xl pb-4">작업지시사항</div>

    <div class="grid grid-cols-12 gap-3">
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">제품명</label>

        <select class="p-inputtext w-full" v-model="form.prod_code" @change="onProdChange">
          <option value="">제품 선택</option>
          <option v-for="p in productOptions" :key="p.prod_code" :value="p.prod_code">
            {{ p.prod_name }}
          </option>
        </select>
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">지시수량</label>
        <input type="text" class="p-inputtext w-full" v-model="form.wko_qtt" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">작업시작일시</label>
        <input type="date" class="p-inputtext w-full" v-model="form.start_date" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">예상완료일시</label>
        <input type="date" class="p-inputtext w-full" v-model="form.end_date" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">지시 상태</label>
        <select class="p-inputtext w-full" v-model="form.stat">
          <option value="">선택</option>
          <option value="v1">진행중</option>
          <option value="v2">작업완료</option>
          <option value="v3">작업보류</option>
        </select>
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">공정 유형</label>
        <input type="text" v-model="form.line_type" class="p-inputtext w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">라인 코드</label>
        <input type="text" v-model="form.line_code" class="p-inputtext w-full" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3"></div>
    </div>
  </div>

  <!-- 모달창에 생산계획 리스트 띄우기 -->
  <Dialog v-model:visible="prdpModalOpen" modal header="생산계획 불러오기" :style="{ width: '70vw' }">
    <div v-if="prdpError" class="p-2 text-red-500">생산계획 목록을 불러오지 못했습니다.</div>

    <!-- <DataTable :value="prdpList" :loading="prdpLoading" scrollable scrollHeight="400px"> -->
    <DataTable :value="prdpList" :loading="prdpLoading" scrollable scrollHeight="400px" dataKey="prdp_code" v-model:selection="selectedPlan" selectionMode="single">
      <Column selectionMode="single" headerStyle="width:3rem" />
      <Column field="prdp_code" header="계획번호" />
      <Column field="prdp_name" header="계획명" />
      <Column field="prdp_date" header="계획일자" />
      <Column field="due_date" header="납기일자" />
      <Column field="start_date" header="작업시작일" />
    </DataTable>

    <template #footer>
      <Button label="취소" class="p-button-text" @click="prdpModalOpen = false" />
      <Button label="확인" @click="applySelectedPlan" :disabled="!selectedPlan" />
    </template>
  </Dialog>
</template>

<style scoped>
.pf-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
