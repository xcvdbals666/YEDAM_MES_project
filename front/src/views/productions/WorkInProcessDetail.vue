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
const goBack = () => router.back();

const selectedProcess = ref(null);
const selectedEqType = ref(''); //선택한 공정의 eq_type
const equipmentNameText = ref(''); //설비명 표시용

const inputQtt = ref(0); //투입량
const selectedLineEqCode = ref(null);
const selectedEq = ref(null);

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
});

watch(selectedProcess, () => {
  //  processOptions에서 선택된 po_code 찾기
  const processRow = processOptions.value.find((p) => p.po_code === selectedProcess.value);

  // 그 행의 eq_type 저장
  selectedEqType.value = processRow ? processRow.eq_type : '';

  // lineEquipments에서 eq_type 같은 설비만 필터
  const matched = lineEquipments.value.filter((eq) => eq.eq_type === selectedEqType.value);

  // 설비명 문자열 만들기
  if (matched.length > 0) {
    equipmentNameText.value = matched.map((eq) => eq.eq_name).join(', ');
    selectedLineEqCode.value = matched[0].line_eq_code;
  } else {
    equipmentNameText.value = '(해당 공정 설비 없음)';
    selectedLineEqCode.value = null;
  }
});

//작업시작버튼
const onStart = async () => {
  if (!selectedProcess.value) return alert('공정을 선택하세요');
  if (!selectedLineEqCode.value) return alert('해당 공정 설비를 찾지 못했습니다');
  if (Number(inputQtt.value) <= 0) return alert('투입량을 입력하세요');

  await store.startWork({
    wko_code: wkoCode.value,
    line_eq_code: selectedLineEqCode.value,
    input_qtt: Number(inputQtt.value) //이거 투입량
  });

  alert('작업 시작 처리 완료');
};

//카드클릭
const getEqStatus = (lineEqCode) => {
  const row = prdrStatusList.value.find((r) => r.line_eq_code === lineEqCode);
  if (!row || !row.prdr_d_code) return 'none';
  if (row.start_date && !row.end_date) return 'running';
  if (row.end_date) return 'done';
};

const onEqClick = async (eq) => {
  const row = prdrStatusList.value.find((r) => r.line_eq_code === eq.line_eq_code);
  if (!row?.prdr_d_code) return;

  selectedEq.value = eq;
  await store.fetchPrdrDDetail(row.prdr_d_code);
};
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl">작업진행 상세</div>

    <div v-if="wipDetailLoading" class="p-3 text-gray-500">로딩중...</div>

    <div v-else class="grid grid-cols-12 gap-3">
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">공정명</label>
        <Dropdown v-model="selectedProcess" :options="processOptions" optionLabel="po_name" optionValue="po_code" placeholder="공정 선택" class="w-full" showClear />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">설비명</label>
        <InputText 
          :modelValue="selectedEq?.eq_name ?? equipmentNameText"
          class="w-full"
          readonly 
        />
        <!-- <InputText :modelValue="equipmentNameText" class="w-full" readonly /> -->
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
        <input 
          type="text"
          class="w-full p-inputtext"
          :value="prdrDDetail?.start_date 
                  ? prdrDDetail.start_date.replace('T',' ').slice(0,19) 
                  : ''"
          readonly
        />
        <!-- <input type="text" class="w-full p-inputtext" placeholder="작업시작 클릭 시 자동으로 입력됩니다." readonly /> -->
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">종료시간</label>
        <input 
          type="text"
          class="w-full p-inputtext"
          :value="prdrDDetail?.end_date 
                  ? prdrDDetail.end_date.replace('T',' ').slice(0,19) 
                  : ''"
          readonly
        />  
        <!-- <input type="text" class="w-full p-inputtext" placeholder="작업완료 클릭 시 자동으로 입력됩니다." readonly /> -->
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">투입량</label>
          <input
            type="number"
            class="w-full p-inputtext"
            :value="prdrDDetail?.input_qtt ?? ''"
            readonly
          />
        <!-- <input type="number" class="w-full p-inputtext" min="0" v-model.number="inputQtt" placeholder="숫자입력" /> -->
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">지시수량</label>
        <InputText :modelValue="wipDetail?.wko_qtt ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">생산수량</label>
        <input type="number" class="w-full p-inputtext" min="0" placeholder="숫자입력" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">불량수량</label>
        <input type="number" class="w-full p-inputtext" min="0" placeholder="숫자입력" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">진행률</label>
        <input type="text" class="w-full p-inputtext" />
      </div>
    </div>

    <div class="flex gap-2 mt-4">
      <Button label="목록" severity="secondary" @click="goBack" />
      <Button label="작업시작" severity="success" @click="onStart" />
      <Button label="작업종료" severity="info" disabled />
    </div>
  </div>

  <!-- 설비 카드 섹션 -->
  <div class="card">
    <div class="card mt-4">
      <div class="font-semibold text-xl mb-3">사용중인 설비</div>
      <span>{{ wipDetail?.prod_code }} & {{ wipDetail?.line_code }}</span>

      <div class="grid grid-cols-12 gap-3">
        <div
          v-for="eq in lineEquipments"
          :key="eq.line_eq_code"
          @click="onEqClick(eq)"
          :class="[
            'col-span-12 md:col-span-4 lg:col-span-3 border rounded-lg p-3 text-center transition cursor-pointer',
            getEqStatus(eq.line_eq_code) === 'running' && 'bg-yellow-200 border-yellow-400',
            getEqStatus(eq.line_eq_code) === 'done' && 'bg-green-200 border-green-400',
            getEqStatus(eq.line_eq_code) === 'none' && 'bg-gray-50 text-gray-400 cursor-not-allowed'
          ]"
        >
          <div class="font-semibold">{{ eq.eq_code }}</div>
          <div class="text-sm">{{ eq.eq_name }}</div>

          <div class="mt-2 text-xs font-semibold">
            <span v-if="getEqStatus(eq.line_eq_code) === 'running'">진행중</span>
            <span v-else-if="getEqStatus(eq.line_eq_code) === 'done'">작업완료</span>
            <span v-else>미작업</span>
          </div>
        </div>

        <div v-if="!lineEquipments?.length" class="col-span-12 text-gray-500 p-3">해당 라인에 등록된 설비가 없습니다.</div>
      </div>
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
