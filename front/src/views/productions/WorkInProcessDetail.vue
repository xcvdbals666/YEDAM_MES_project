<!-- productions / WorkInProcessDetail.vue -->
<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProductionsStore } from '@/stores/production1';

const route = useRoute();
const router = useRouter();
const store = useProductionsStore();

const { wipDetail, wipDetailLoading, lineEquipments, processOptions, prdrStatusList, prdrDDetail } = storeToRefs(store);

const wkoCode = computed(() => route.params.wko_code);
const selectedPoCode = computed(() => route.params.po_code);

const goBack = () => router.back();

const selectedEqType = ref('');
const equipmentNameText = ref('');
const selectedLineEqCode = ref(null);


const inputQtt = ref(null);// 시작 전 입력값
const makeQtt = ref(0);
const defQtt = ref(0);
const procRate = ref(0);

// 공정 row / 공정명
const selectedProcessRow = computed(() => {
  const list = Array.isArray(processOptions.value) ? processOptions.value : [];
  return list.find((p) => p.po_code === selectedPoCode.value) || null;
});

const selectedPoName = computed(() => selectedProcessRow.value?.po_name || '');
const isFirstProcess = computed(() => Number(selectedProcessRow.value?.no) === 1);
const isStarted = computed(() => !!prdrDDetail.value?.start_date);
const isEnded = computed(() => !!prdrDDetail.value?.end_date);

const fmt = (v) => v ? String(v).replace('T', ' ').slice(0, 19) : '';

// 설비 관련
const matchedEquipments = computed(() => {
  const eqs = Array.isArray(lineEquipments.value) ? lineEquipments.value : [];
  return eqs.filter((e) => e.eq_type === selectedEqType.value);
});

const allEquipments = computed(() => Array.isArray(lineEquipments.value) ? lineEquipments.value : []);

const applyProcessToEquipments = () => {
  selectedEqType.value = selectedProcessRow.value?.eq_type || '';
  const matched = matchedEquipments.value;

  if (matched.length > 0) {
    equipmentNameText.value = matched.map((eq) => eq.eq_name).join(', ');
    selectedLineEqCode.value = matched[0].line_eq_code;
  } else {
    equipmentNameText.value = '(해당 공정 설비 없음)';
    selectedLineEqCode.value = null;
  }
};

const loadCurrentPrdrDetailForSelectedEq = async () => {
  if (!selectedLineEqCode.value) {
    prdrDDetail.value = null;
    return;
  }

  const rows = Array.isArray(prdrStatusList.value) ? prdrStatusList.value : [];
  const row = rows.find((r) => r.line_eq_code === selectedLineEqCode.value);

  if (row?.prdr_d_code) {
    await store.fetchPrdrDDetail(row.prdr_d_code);
  } else {
    prdrDDetail.value = null;
  }
};

// 직전 공정 로직
const prevMakeQtt = ref(null);

const loadPrevMakeQtt = async () => {
  if (isFirstProcess.value) {
    prevMakeQtt.value = null;
    return;
  }

  const curNo = Number(selectedProcessRow.value?.no);
  const list = Array.isArray(processOptions.value) ? processOptions.value : [];
  const prevProcess = list.find((p) => Number(p.no) === curNo - 1);
  
  if (!prevProcess) {
    prevMakeQtt.value = null;
    return;
  }

  const rows = Array.isArray(prdrStatusList.value) ? prdrStatusList.value : [];
  const prevStatus = rows.find((r) => r.po_code === prevProcess.po_code && r.prdr_d_code);

  if (prevStatus?.prdr_d_code) {
    const prevDetail = await store.fetchPrdrDDetailRaw(prevStatus.prdr_d_code);
    prevMakeQtt.value = prevDetail?.make_qtt || 0;
  } else {
    prevMakeQtt.value = null;
  }
};

const syncDetailUI = async () => {
  applyProcessToEquipments();
  await loadCurrentPrdrDetailForSelectedEq();
  await loadPrevMakeQtt();

  if (!isFirstProcess.value && prevMakeQtt.value !== null) {
    makeQtt.value = Number(prevMakeQtt.value);
  }
};

// 작업 시작/종료
const onStart = async () => {
  if (!selectedPoCode.value || !selectedLineEqCode.value) return alert('정보가 부족합니다.');
  if (isFirstProcess.value && (!inputQtt.value || inputQtt.value <= 0)) return alert('투입량을 입력하세요.');

  const payload = {
    wko_code: wkoCode.value,
    line_eq_code: selectedLineEqCode.value,
    ...(isFirstProcess.value && { input_qtt: Number(inputQtt.value) })
  };

  try {
    await store.startWork(payload);
    await store.fetchPrdrStatusByWko(wkoCode.value);
    await syncDetailUI();
    alert('작업 시작 처리 완료');
  } catch (error) {
    alert(`오류 발생: ${error.message}`);
  }
};

const onEnd = async () => {
  const prdrDCode = prdrDDetail.value?.prdr_d_code;
  if (!prdrDCode) return alert('작업 코드를 찾을 수 없습니다.');
  if (makeQtt.value == null || Number(makeQtt.value) <= 0) return alert('생산수량은 0 이상');
  if (defQtt.value == null || Number(defQtt.value) < 0) return alert('불량수량은 0 이상');
  if (procRate.value == null || Number(procRate.value) <= 0) return alert('진행률은 0 이상');


  try {
    await store.endWork({
      prdr_d_code: prdrDCode,
      make_qtt: Number(makeQtt.value),
      def_qtt: Number(defQtt.value),
      proc_rate: Number(procRate.value),
      po_code: selectedPoCode.value,
      wko_code: wkoCode.value
    });
    await store.fetchPrdrStatusByWko(wkoCode.value);
    await syncDetailUI();
    alert('작업 종료 처리 완료');
  } catch (error) {
    alert(`오류 발생: ${error.message}`);
  }
};

onMounted(async () => {
  await store.fetchWorkInProcessDetail(wkoCode.value);
  const lineCode = wipDetail.value?.line_code;
  
  if (lineCode) {
    await store.fetchEquipmentsByLine(lineCode);
  } else {
    lineEquipments.value = [];
  }

  await Promise.all([
    store.fetchProcessByWko(wkoCode.value),
    store.fetchPrdrStatusByWko(wkoCode.value)
  ]);

  await syncDetailUI();
});

watch([selectedPoCode, processOptions, lineEquipments, prdrStatusList], async () => {
  await syncDetailUI();
});
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl">작업진행 상세</div>

    <div v-if="wipDetailLoading" class="p-3 text-gray-500">로딩중...</div>

    <div v-else class="grid grid-cols-12 gap-3 mt-3">
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">공정명</label>
        <InputText :modelValue="selectedPoName" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">설비명</label>
        <InputText :modelValue="equipmentNameText" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">제품명</label>
        <InputText :modelValue="wipDetail?.prod_name ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">라인코드</label>
        <InputText :modelValue="wipDetail?.line_code ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">작업지시번호</label>
        <InputText :modelValue="wipDetail?.wko_code ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">작업지시명</label>
        <InputText :modelValue="wipDetail?.wko_name ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">시작시간</label>
        <input type="text" class="w-full p-inputtext" :value="fmt(prdrDDetail?.start_date)" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">종료시간</label>
        <input type="text" class="w-full p-inputtext" :value="fmt(prdrDDetail?.end_date)" readonly />
      </div>

      <!-- 투입량 -->
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">투입량</label>

        <template v-if="isStarted">
          <input type="number" class="w-full p-inputtext" :value="prdrDDetail?.input_qtt ?? ''" readonly />
        </template>

        <template v-else>
          <input v-if="isFirstProcess" type="number" class="w-full p-inputtext" min="0" v-model.number="inputQtt" placeholder="숫자입력" />
          <input v-else type="text" class="w-full p-inputtext" value="첫 공정(원료 배합)에서만 입력합니다" readonly />
        </template>
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">지시수량</label>
        <InputText :modelValue="wipDetail?.wko_qtt ?? ''" class="w-full" readonly />
      </div>

      <!-- 직전 생산량 표시 -->
      <div v-if="!isFirstProcess" class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">직전 생산량</label>
        <InputText :modelValue="prevMakeQtt ?? ''" class="w-full" readonly />
      </div>

      <!-- 생산수량 -->
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">생산수량</label>

        <template v-if="isEnded">
          <input type="number" class="w-full p-inputtext" :value="prdrDDetail?.make_qtt ?? ''" readonly />
        </template>
        <template v-else>
          <input type="number" class="w-full p-inputtext" min="0" v-model.number="makeQtt" placeholder="숫자입력" :disabled="!isStarted" />
        </template>
      </div>

      <!-- 불량수량 -->
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">불량수량</label>

        <template v-if="isEnded">
          <input type="number" class="w-full p-inputtext" :value="prdrDDetail?.def_qtt ?? ''" readonly />
        </template>
        <template v-else>
          <input type="number" class="w-full p-inputtext" min="0" v-model.number="defQtt" placeholder="숫자입력" :disabled="!isStarted" />
        </template>
      </div>

      <!-- 진행률 -->
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">진행률</label>

        <template v-if="isEnded">
          <input type="number" class="w-full p-inputtext" :value="prdrDDetail?.proc_rate ?? ''" readonly />
        </template>

        <template v-else>
          <input type="number" class="w-full p-inputtext" min="0" max="100" v-model.number="procRate" placeholder="0~100" :disabled="!isStarted" />
        </template>
      </div>
    </div>

    <div class="flex gap-2 mt-4">
      <Button label="목록" severity="secondary" @click="goBack" />
      <Button label="작업시작" severity="success" @click="onStart" :disabled="isStarted" />
      <Button label="작업종료" severity="info" @click="onEnd" :disabled="!isStarted || isEnded" />
    </div>
  </div>

  <!-- 설비 카드 -->
  <div class="card mt-4">
    <div class="font-semibold text-xl mb-3">라인 설비 목록</div>
    <div class="text-sm text-gray-500 mb-3">라인: {{ wipDetail?.line_code || '-' }} / 선택 공정: {{ selectedPoName || '-' }}</div>

    <div class="grid grid-cols-12 gap-3">
      <div
        v-for="eq in allEquipments"
        :key="eq.line_eq_code"
        :class="['col-span-12 md:col-span-4 lg:col-span-3 border rounded-lg p-3 text-center', eq.eq_type === selectedEqType && 'bg-yellow-200 border-yellow-400']"
      >
        <div class="font-semibold">{{ eq.eq_code }}</div>
        <div class="text-sm">{{ eq.eq_name }}</div>
        <div class="mt-2 text-xs text-gray-500">유형: {{ eq.eq_type }}</div>
      </div>

      <div v-if="!allEquipments.length" class="col-span-12 text-gray-500 p-3">해당 라인에 등록된 설비가 없습니다.</div>
    </div>
  </div>
</template>

<style scoped>
:deep(input[readonly]) {
  background-color: #f5f5f5;
  border-color: #dcdcdc;
  color: #555;
  cursor: not-allowed;
}
</style>
