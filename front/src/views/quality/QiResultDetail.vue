<!-- QiResultDetail.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQualityStore2 } from '@/stores/quality2';

// 라우터 & 스토어
const route = useRoute();
const qualityStore = useQualityStore2();
const qirCode = route.params.qir_code;

// 상단 + 하단 (단건)
// 선택한 qir_code 한 건만 가져오기
const header = computed(() => {
  return qualityStore.qiResultDetail?.[0] || {};
});
// 중단 (검사 기준 여러 건)
const criteriaList = computed(() => qualityStore.qiResultDetail || []);

// 화면 표시용 ref
const criteriaInput = ref({
  inspection_item: '',
  check_method: '',
  range_top: '',
  range_bot: '',
  unit: ''
});

const resultInput = ref({
  start_date: '',
  end_date: '',
  pass_qtt: '',
  unpass_qtt: '',
  unpass_rate: '',
  result: '',
  inspector: '',
  note: ''
});

// 단위 매핑
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
  ha: 'N',
  hb: 'mg',
  hc: 'ml',
  hd: 'mg/g'
};

// API 호출 및 화면 매핑
onMounted(async () => {
  await qualityStore.fetchQiResultDetail(qirCode);

  if (criteriaList.value.length > 0) {
    const first = criteriaList.value[0];

    // 검사 기준 매핑
    criteriaInput.value = {
      inspection_item: first.inspection_item || '',
      check_method: first.check_method || '',
      range_top: first.range_top || '',
      range_bot: first.range_bot || '',
      unit: first.unit || ''
    };

    // 검사 결과 매핑
    resultInput.value = {
      start_date: first.start_date || '',
      end_date: first.end_date || '',
      pass_qtt: first.pass_qtt || '',
      unpass_qtt: first.unpass_qtt || '',
      unpass_rate: first.unpass_rate || '',
      result: first.result || '',
      inspector: first.inspector || '',
      note: first.note || ''
    };
  }
});

// 날짜 포맷 함수 (yyyy-mm-dd)
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
</script>

<template>
  <!-- 기본 정보 -->
  <div class="flex">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <div>검사 기본 정보</div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3 items-center gap-2">
            <label class="col-span-1 text-600 whitespace-nowrap">검사 결과 코드</label>
            <InputText class="col-span-2" :value="header.qir_code" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 지시일</label>
            <InputText class="col-span-2" :value="formatDate(header.qio_date)" readonly />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 요청량</label>
            <InputText class="col-span-2" :value="header.insp_vol" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">품목명</label>
            <InputText class="col-span-2" :value="header.item_name" readonly />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사일시</label>
            <InputText class="col-span-2" :value="formatDate(header.inspect_datetime)" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사유형</label>
            <InputText class="col-span-2" :value="header.inspect_type" readonly />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--------------------------------------------------------------------------------------------------->

  <!-- 검사 기준 -->
  <div class="flex mt-4">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <div>검사 기준</div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 항목명</label>
            <InputText class="col-span-2" v-model="criteriaInput.inspection_item" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 방법</label>
            <InputText class="col-span-2" v-model="criteriaInput.check_method" readonly />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">상한 값</label>
            <InputText class="col-span-2" v-model="criteriaInput.range_top" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">하한 값</label>
            <InputText class="col-span-2" v-model="criteriaInput.range_bot" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">단위</label>
            <InputText class="col-span-2" :value="unitMap[criteriaInput.unit] || criteriaInput.unit || ''" readonly />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--------------------------------------------------------------------------------------------------->

  <!-- 검사 결과 -->
  <div class="flex mt-4">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <div>검사 결과</div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 시작일</label>
            <InputText class="col-span-2" :value="formatDate(resultInput.start_date)" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 종료일</label>
            <InputText class="col-span-2" :value="formatDate(resultInput.end_date)" readonly />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">합격수량</label>
            <InputText class="col-span-2" v-model="resultInput.pass_qtt" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">불합격수량</label>
            <InputText class="col-span-2" :value="resultInput.unpass_qtt || '불합격수량 없음'" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">최종결과</label>
            <InputText class="col-span-2" :value="resultInput.result === 'g1' ? '불합격' : resultInput.result === 'g2' ? '합격' : '미검사'" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사자 코드</label>
            <InputText class="col-span-2" v-model="resultInput.inspector" readonly />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover-table :deep(.p-datatable-tbody > tr:hover td) {
  font-weight: 500;
}

/* 카드 스타일 개선 */
.card {
  background-color: #ffffff; /* 밝은 배경 유지 */
  border-radius: 12px; /* 둥근 모서리 */
  padding: 1.5rem; /* 여백 조금 더 여유롭게 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 부드러운 그림자 */
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px); /* 살짝 띄워지는 느낌 */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* 제목 강조 */
.card > .font-semibold.text-xl {
  border-bottom: 1px solid #e5e7eb; /* 살짝 구분선 */
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  color: #1f2937; /* 진한 회색 */
}

/* InputText readonly 스타일 */
.InputText[readonly] {
  background-color: #f9fafb; /* 연한 회색 배경 */
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  color: #374151; /* 진한 회색 */
  font-weight: 500;
}

/* 그리드 간격 */
.grid > div {
  margin-bottom: 0.5rem;
}

/* 테이블 row hover 고급스러움 */
.hover-table :deep(.p-datatable-tbody > tr:hover td) {
  background-color: #f3f4f6; /* 연한 회색 배경 */
  font-weight: 600;
  transition:
    background-color 0.2s,
    font-weight 0.2s;
}

/* 레이블 스타일 */
label {
  font-weight: 600;
  color: #4b5563; /* 중간 회색 */
}
</style>
