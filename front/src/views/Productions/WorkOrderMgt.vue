<!-- views/Productions/WorkOrderMgt.vue (작업지시서 관리) -->
<!-- 1. 생산계획 불러오기 (prdp_tbl, prdp_d_tbl)-->
<!-- 
  생산 계획을 지정해 작업 지시서를 생성할 수 있으며, 
  생산 계획이 없어도 작업 지시서를 생성할 수 있습니다.
  생산 계획이 선택된다면 생산 계획에 해당하는 제품만 선택이 가능하고,
  생산 라인도 선택된 제품이 사용 가능한 라인만 조회됩니다.
  작업 지시서 불러오기 버튼으로 등록된 작업 지시서를 수정할 수 있습니다 
  -->

<!-- 제품코드로 조인해서 prod_proc_tbl에서 정형/비정형 불러오기 -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useProductionsStore } from '@/stores/production1';
import { storeToRefs } from 'pinia';
import 'primeicons/primeicons.css';

const store = useProductionsStore();
const { wkoList, prdpList, prdpLoading, prdpError, prdpItems, allProducts, lines } = storeToRefs(store);

//날짜 자르기
const convertDate = (d) => {
  if (!d) return '';
  return d.slice(0, 10);
};

const statusMap = {
  v1: '작업대기',
  v2: '작업보류',
  v3: '진행중',
  v4: '작업취소'
};

const selectedPlan = ref(null); //모달에서 생산계획 하나 선택

//초기 폼 (리셋에 사용)
const emptyForm = {
  wko_code: '',
  prdp_code: '',
  prdp_date: '',
  prod_code: '',
  prod_name: '',
  wko_qtt: '',
  start_date: '',
  end_date: '',
  stat: 'v1',
  line_code: '',
  wko_name: ''
};

//초기폼 복제해서 값 채워질 용도 form 생성
const form = ref({ ...emptyForm });

const resetForm = () => {
  form.value = { ...emptyForm };
  selectedPlan.value = null;
};

const prdpModalOpen = ref(false);

const openPrdpModal = async () => {
  prdpModalOpen.value = true;
  await store.fetchPrdpActive();
};

const wkoListModalOpen = ref(false);

const openWkoListModal = async () => {
  wkoListModalOpen.value = true;

  await store.fetchWorkOrders({
    from: undefined,
    to: undefined,
    stat: undefined,
    line: undefined,
    name: undefined,
    wko: undefined
  });
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
    form.value.line_code = '';
  }

  prdpModalOpen.value = false;
};

//제품명 드롭다운
const onProdChange = () => {
  //생산계획 안불러오고 작업시 자동세팅X
  if (!form.value.prdp_code) return;

  // 드롭다운에서 고른 생산계획
  const selectedProdCode = form.value.prod_code;

  // 생산계획 상세 목록(prdpItems)에서 같은 제품코드를 가진 항목을 찾기
  const found = prdpItems.value.find((item) => item.prod_code === selectedProdCode);

  // 결과가 있으면(found가 null/undefined가 아니면) 자동으로 값 채우기
  if (found) {
    form.value.wko_qtt = found.planned_qtt;
    form.value.line_code = found.line_code;
  } else {
    // 못 찾았으면 값 비우기(안전장치)
    form.value.wko_qtt = '';
    form.value.line_code = '';
  }
};

const productOptions = computed(() => {
  if (form.value.prdp_code) return prdpItems.value;
  return allProducts.value;
});

onMounted(() => {
  store.fetchAllPrdDistinct();
});

//wko_code 번호 자동으로 만들어 삽입하기
//저장버튼 누르는 순간 실행!
const saveWorkOrder = async () => {
  const now = new Date();
  const year = now.getFullYear();
  // 월, 일은 10보다 작으면 앞에'0을 붙여서 2자리로
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayDate = `${year}${month}${day}`;
  const prefix = `WKO-${todayDate}`;

  // 중복 피하기 위해 DB에서 최신 목록을 한 번 더 - store에 fetchWorkOrders 실행
  await store.fetchWorkOrders();

  // wkoList에서 오늘 만든 번호만 골라냄
  const todayOrders = wkoList.value.filter((item) => {
    return item.wko_code && item.wko_code.startsWith(prefix);
  });

  let nextNumber = 1;

  // 오늘 등록된 데이터가 있으면 젤 큰 번호를 찾아 +1
  if (todayOrders.length > 0) {
    const numbers = todayOrders.map((item) => {
      //- 기준으로 쪼개서
      const parts = item.wko_code.split('-');
      // 3번째(인덱스 2번)를 숫자로 변환
      return parseInt(parts[2]);
    });
    // 찾아낸 숫자들 중 가장 큰 값에 1 더함
    nextNumber = Math.max(...numbers) + 1;
  }

  const finalSeq = String(nextNumber).padStart(3, '0');

  form.value.wko_code = `${prefix}-${finalSeq}`;

  try {
    // 스토어에 새로 만든 insertWorkOrder 함수를 호출
    await store.insertWorkOrder(form.value);
    alert(`저장이 완료되었습니다! 생성된 번호: ${form.value.wko_code}`);

    resetForm();
    await store.fetchWorkOrders();
  } catch (error) {
    console.error('저장 에러 발생:', error);
    alert('저장에 실패했습니다.');
  }
};

//작업지시서 불러오기
const selectedWko = ref(null);

const applySelectedWko = async () => {
  if (!selectedWko.value) return;

  form.value.wko_code = selectedWko.value.wko_code ?? '';
  form.value.prdp_code = selectedWko.value.prdp_code ?? '';
  form.value.prod_code = selectedWko.value.prod_code ?? '';
  form.value.wko_qtt = selectedWko.value.wko_qtt ?? '';
  form.value.start_date = convertDate(selectedWko.value.start_date);
  form.value.end_date = convertDate(selectedWko.value.end_date);
  form.value.stat = selectedWko.value.stat ?? 'v1';
  form.value.line_code = selectedWko.value.line_code ?? '';
  form.value.wko_name = selectedWko.value.wko_name ?? '';

  if (form.value.prdp_code) {
    await store.fetchPrdpItems(form.value.prdp_code);
  }

  wkoListModalOpen.value = false;
};

//불러온 작업지시서 삭제하기
const deleteCurrentWko = async () => {
  const code = form.value.wko_code;

  if (!code) {
    alert('삭제할 작업 지시서를 먼저 불러오세요');
    return;
  }

  if (!confirm(`[${code}] 작업지시서를 삭제할까요?`)) return;

  await store.deleteWorkOrderByWkoCode(code);
  alert(`${code}를 삭제했습니다`);
  resetForm();
};
</script>

<template>
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <div class="font-semibold text-xl">기본정보</div>

      <div class="flex gap-2">
        <button class="p-button p-button-danger" @click="deleteCurrentWko">삭제</button>
        <button class="p-button p-button-secondary" @click="resetForm">초기화</button>
        <button class="p-button p-button-info" @click="saveWorkOrder">저장</button>
        <button class="p-button p-button-success" @click="openWkoListModal">작업지시서 불러오기</button>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-3">
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">작업지시번호</label>
        <input type="text" class="p-inputtext w-full" v-model="form.wko_code" readonly />
      </div>

      <div class="col-span-12 lg:col-span-5 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">생산계획번호</label>
        <input type="text" class="p-inputtext w-full" v-model="form.prdp_code" readonly />
      </div>

      <div class="col-span-12 lg:col-span-1 flex items-center gap-3">
        <Button icon="pi pi-search" class="p-button-success custom-btn" @click="openPrdpModal" />
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
          <option value="v1" selected>작업대기</option>
          <option value="v2">작업보류</option>
          <option value="v3">진행중</option>
        </select>
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">라인 코드</label>
        <Dropdown v-model="form.line_code" :options="lines" optionLabel="line_code" optionValue="line_code" placeholder="라인 선택" class="w-full" />
      </div>

      <div class="col-span-12 lg:col-span-12 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">작업이름</label>
        <input type="text" class="p-inputtext w-full" v-model="form.wko_name" />
      </div>
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

  <!-- 모달창에 작업지시서 리스트 띄우기 -->
  <Dialog v-model:visible="wkoListModalOpen" modal header="작업지시서 불러오기" :style="{ width: '70vw' }">
    <DataTable :value="wkoList" scrollable scrollHeight="400px" dataKey="wko_code" v-model:selection="selectedWko" selectionMode="single">
      <Column selectionMode="single" headerStyle="width:3rem" />
      <Column field="wko_code" header="작업지시번호" />
      <Column field="prdp_code" header="생산계획번호" />
      <Column field="prod_code" header="제품코드" />
      <Column field="wko_qtt" header="수량" />
      <Column header="시작일">
        <template #body="{ data }">
          {{ convertDate(data.start_date) }}
        </template>
      </Column>
      <Column field="line_code" header="라인" />
      <Column header="완료예정일">
        <template #body="{ data }">
          {{ convertDate(data.end_date) }}
        </template>
      </Column>
      <Column header="상태">
        <template #body="{ data }">
          {{ statusMap[data.stat] ?? data.stat }}
        </template>
      </Column>
      <Column field="line_code" header="라인" />
    </DataTable>

    <template #footer>
      <Button label="취소" class="p-button-text" @click="wkoListModalOpen = false" />
      <Button label="확인" @click="applySelectedWko" :disabled="!selectedWko" />
    </template>
  </Dialog>
</template>

<style scoped>
:deep(.p-datatable-frozen-tbody) {
  font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}
.pf-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

input[readonly] {
  background-color: #f5f5f5;
  border-color: #dcdcdc;
  color: #666;
  cursor: not-allowed;
}
</style>
