<!-- 후행페이지: 작업 진행 상세 페이지-->
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
const selectedPoCode = computed(() => route.params.po_code); // Bulletin에서 넘어온 공정코드
//const selectedPoCode = computed(() => 'PO-001');

const goBack = () => router.back();

const selectedEqType = ref('');
const equipmentNameText = ref('');
const selectedLineEqCode = ref(null);

// 시작 전 입력값
const inputQtt = ref(null);

// 공정 row / 공정명
const selectedProcessRow = computed(() => {
  const list = Array.isArray(processOptions.value) ? processOptions.value : [];
  return list.find((p) => p.po_code === selectedPoCode.value) ?? null;
});
const selectedPoName = computed(() => selectedProcessRow.value?.po_name ?? '');

const fmt = (v) => {
  if (!v) return '';
  return String(v).replace('T', ' ').slice(0, 19);
};

const isStarted = computed(() => !!prdrDDetail.value?.start_date);

// 선택 공정(eq_type)에 매칭되는 설비만(대표 설비 선택/설비명 문자열용)
const matchedEquipments = computed(() => {
  const eqs = Array.isArray(lineEquipments.value) ? lineEquipments.value : [];
  if (!selectedEqType.value) return [];
  return eqs.filter((e) => e.eq_type === selectedEqType.value);
});

// 카드에는 라인의 모든 설비가 나와야 함
const allEquipments = computed(() => {
  return Array.isArray(lineEquipments.value) ? lineEquipments.value : [];
});

// 공정(eq_type) 세팅 + 대표 설비(첫번째) 선택
const applyProcessToEquipments = () => {
  const row = selectedProcessRow.value;
  selectedEqType.value = row?.eq_type ?? '';

  const matched = matchedEquipments.value;

  if (matched.length > 0) {
    equipmentNameText.value = matched.map((eq) => eq.eq_name).join(', ');
    selectedLineEqCode.value = matched[0].line_eq_code; // 대표 설비 = 첫번째
  } else {
    equipmentNameText.value = '(해당 공정 설비 없음)';
    selectedLineEqCode.value = null;
  }
};

// 대표 설비의 현재 작업(prdr_d_code)이 있으면 상세 자동 로드 (시작시간/투입량 표시용)
const loadCurrentPrdrDetailForSelectedEq = async () => {
  const lineEq = selectedLineEqCode.value;
  if (!lineEq) {
    prdrDDetail.value = null;
    return;
  }

  const rows = Array.isArray(prdrStatusList.value) ? prdrStatusList.value : [];
  const row = rows.find((r) => r.line_eq_code === lineEq);

  if (row?.prdr_d_code) {
    await store.fetchPrdrDDetail(row.prdr_d_code);
  } else {
    prdrDDetail.value = null;
  }
};

const onStart = async () => {
  // 1. 필수값 사전 검증 (Guard Clauses)
  if (!selectedPoCode.value) return alert('공정 정보가 없습니다.');
  if (!selectedLineEqCode.value) return alert('설비 정보가 없습니다.');

  // 2. 투입량 검증 (1번 공정일 때만)
  const isInvalidInput = isFirstProcess.value && (!inputQtt.value || inputQtt.value <= 0);
  if (isInvalidInput) {
    return alert('투입량을 입력하세요.');
  }

  // 3. 서버에 보낼 데이터 구성
  const payload = {
    wko_code: wkoCode.value,
    line_eq_code: selectedLineEqCode.value
  };

  // 1번 공정이면 input_qtt를 명시적으로 추가
  if (isFirstProcess.value) {
    payload.input_qtt = Number(inputQtt.value);
  }

  try {
    // 4. 작업 실행 및 데이터 갱신
    await store.startWork(payload);

    await Promise.all([store.fetchPrdrStatusByWko(wkoCode.value), loadCurrentPrdrDetailForSelectedEq()]);

    alert('작업 시작 처리 완료');
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

  await store.fetchProcessByWko(wkoCode.value);
  await store.fetchPrdrStatusByWko(wkoCode.value);

  applyProcessToEquipments();
  await loadCurrentPrdrDetailForSelectedEq();
});

// po_code/공정목록/설비목록이 바뀌면 다시 매칭
watch([selectedPoCode, processOptions, lineEquipments], async () => {
  applyProcessToEquipments();
  await loadCurrentPrdrDetailForSelectedEq();
});

// prdrStatusList 갱신되면(작업시작 후) 상세 재로딩
watch(prdrStatusList, async () => {
  await loadCurrentPrdrDetailForSelectedEq();
});

const isFirstProcess = computed(() => Number(selectedProcessRow.value?.no) === 1);

const makeQtt = ref(0);
const defQtt = ref(0);
const procRate = ref(0);

const isEnded = computed(() => !!prdrDDetail.value?.end_date);

//작업종료
const onEnd = async () => {
  const prdrDCode = prdrDDetail.value?.prdr_d_code;
  if (!prdrDCode) return alert('종료할 작업(prdr_d_code)을 찾지 못했습니다.');

  if (makeQtt.value == null || Number(makeQtt.value) <= 0) return alert('생산수량은 0 이상');
  if (defQtt.value == null || Number(defQtt.value) < 0) return alert('불량수량은 0 이상');
  if (procRate.value == null || Number(procRate.value) <= 0) return alert('진행률은 0 이상');

  await store.endWork({
    prdr_d_code: prdrDCode,
    make_qtt: Number(makeQtt.value),
    def_qtt: Number(defQtt.value),
    proc_rate: Number(procRate.value),
    po_code: selectedPoCode.value, // 마지막 공정인거 확인해서 prdr_tbl에 production_qtt삽입하려고
    wko_code: wkoCode.value // 마지막 공정인거 확인해서 prdr_tbl에 production_qtt삽입하려고
  });

  await store.fetchPrdrStatusByWko(wkoCode.value);
  await loadCurrentPrdrDetailForSelectedEq();

  alert('작업 종료 처리 완료');
};
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl">작업진행 상세</div>

    <div v-if="wipDetailLoading" class="p-3 text-gray-500">로딩중...</div>

    <div v-else class="grid grid-cols-12 gap-3 mt-3">
      <!-- 공정명: 고정 표시 -->
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">공정명</label>
        <InputText :modelValue="selectedPoName" class="w-full" readonly />
      </div>

      <!-- 설비명: 선택 공정(eq_type)에 해당하는 설비들 이름 -->
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

      <!-- 투입량: 시작 전 입력 / 시작 후 readonly -->
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

      <!-- 시작 후 , 종료 전에만 열리게 -->
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
      <!-- 작업시작 되면 버튼 못누름 -->
      <Button label="작업시작" severity="success" @click="onStart" :disabled="isStarted" />

      <Button label="작업종료" severity="info" @click="onEnd" :disabled="!isStarted || isEnded" />
    </div>
  </div>

  <!-- 설비 카드 -->
  <div class="card mt-4">
    <div class="font-semibold text-xl mb-3">라인 설비 목록</div>
    <div class="text-sm text-gray-500 mb-3">라인: {{ wipDetail?.line_code || '-' }} / 선택 공정: {{ selectedPoName || '-' }}</div>

    <div class="grid grid-cols-12 gap-3">
      <div v-for="eq in allEquipments" :key="eq.line_eq_code" :class="['col-span-12 md:col-span-4 lg:col-span-3 border rounded-lg p-3 text-center', eq.eq_type === selectedEqType && 'bg-yellow-200 border-yellow-400']">
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
