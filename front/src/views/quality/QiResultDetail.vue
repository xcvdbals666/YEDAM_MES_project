<!-- QiResultDetail.vue -->
<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQualityStore2 } from '@/stores/quality2';

// 라우터 & 스토어
const route = useRoute();
const router = useRouter();
const qualityStore = useQualityStore2();
const qirCode = route.params.qir_code;

const goToQiResultList = () => {
  router.push({ name: 'QiResultList' }); // 라우터 이름 기반
};

// 상단 + 하단 (단건)
// 선택한 qir_code 한 건만 가져오기
const header = computed(() => {
  return qualityStore.qiResultDetail.find((item) => item.qir_code === qirCode) || {};
});

const criteriaList = computed(() => {
  return qualityStore.qiResultDetail.filter((item) => item.qir_code === qirCode) || [];
});

watch(
  () => route.params.qir_code,
  async (newCode) => {
    if (!newCode) return;
    await qualityStore.fetchQiResultDetail(newCode);
  }
);
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
      unit: first.unit || '',
      mat_name: first.mat_name || ''
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
        <div class="flex gap-4 pb-2">
          <Button label="목록으로" severity="" @click="goToQiResultList" />
        </div>
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
            <label class="col-span-1">자재명</label>
            <InputText class="col-span-2" :value="header.mat_name" readonly />
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
            <label class="col-span-1">검사 요청량</label>
            <InputText class="col-span-2" :value="header.insp_vol" readonly />
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
            <InputText class="col-span-2" :value="resultInput.pass_qtt || '합격수량 없음'" readonly />
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
            <InputText
              class="col-span-2 font-semibold"
              :class="{
                'text-green-600 !important': resultInput.result === 'g2',
                'text-red-600 !important': resultInput.result === 'g1'
              }"
              :value="resultInput.result === 'g1' ? '불합격' : resultInput.result === 'g2' ? '합격' : '미검사'"
              readonly
            />
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
/* 테이블 row hover 고급스러움 */
.hover-table :deep(.p-datatable-tbody > tr:hover td) {
  background-color: #f9fafb; /* 연한 회색 배경 */
  font-weight: 600;
  color: #1f2937;
  transition:
    background-color 0.3s,
    color 0.3s,
    font-weight 0.3s;
}

/* 카드 스타일 */
.card {
  background: #ffffff;
  border-radius: 16px; /* 조금 더 둥글게 */
  padding: 1.8rem;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.04); /* 두 겹 그림자 */
  transition:
    transform 0.3s,
    box-shadow 0.3s,
    background 0.3s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.12),
    0 6px 16px rgba(0, 0, 0, 0.06);
  background: #fefefe;
}

/* 카드 제목 */
.card > .font-semibold.text-xl {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.6rem;
  margin-bottom: 1rem;
  color: #111827; /* 더 진한 색 */
  font-size: 1.25rem;
  letter-spacing: 0.5px;
}

/* InputText readonly 고급화 */
.InputText[readonly] {
  background: linear-gradient(135deg, #fefefe, #f4f5f7);
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
  /* color: #1f2937; */
  font-weight: 500;
  transition:
    border 0.2s,
    background 0.2s,
    box-shadow 0.2s;
}

.InputText[readonly]:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
}

/* 그리드 간격 */
.grid > div {
  margin-bottom: 0.6rem;
}

/* 레이블 스타일 고급화 */
label {
  font-weight: 600;
  color: #4b5563;
  letter-spacing: 0.3px;
}

/* 버튼 스타일 개선 (Optional) */
button {
  transition: all 0.2s ease-in-out;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 반응형 마진/패딩 부드럽게 */
@media (max-width: 1024px) {
  .card {
    padding: 1.2rem;
  }
}
</style>
