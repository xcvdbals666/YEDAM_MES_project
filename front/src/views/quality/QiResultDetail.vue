<!-- QiResultDetail.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQualityStore2 } from '@/stores/quality2';

// 라우터 & 스토어
const route = useRoute();
const qualityStore = useQualityStore2();
const qirCode = route.params.qir_code; // URL 파라미터명과 맞춤

// 상단 + 하단 (단건)
const header = computed(() => qualityStore.qiResultDetail?.[0] || {});

// 중단 (검사 기준 여러 건)
const criteriaList = computed(() => qualityStore.qiResultDetail || []);

// 화면 표시용 ref 분리
const criteriaInput = ref({
  note: '',
  mat_code: '',
  mat_name: '',
  req_qtt: ''
});

const resultInput = ref({
  start_date: '',
  end_date: '',
  pass_qty: '',
  fail_qty: '',
  defect_rate: '',
  final_result: '',
  inspector: '',
  remark: ''
});

onMounted(async () => {
  await qualityStore.fetchQiResultDetail(qirCode);

  if (criteriaList.value.length > 0) {
    const first = criteriaList.value[0];

    // 검사 기준 매핑 (API 컬럼명을 확인하세요)
    criteriaInput.value = {
      inspection_item: first.inspection_item || '',           // 검사 항목명
      mat_code: first.mat_code || '',   // 검사 방법
      range_top: first.upper_limit || '', // 상한값 (예시 컬럼명)
      range_bot: first.lower_limit || '', // 하한값 (예시 컬럼명)
      unit: first.unit || ''            // 단위 (예시 컬럼명)
    };

    // 검사 결과 매핑
    resultInput.value = {
      start_date: first.start_date || '',
      end_date: first.end_date || '',
      pass_qtt: first.pass_qtt || '',    // pass_qty로 통일
      unpass_qtt: first.fail_qtt || '',    // fail_qty로 통일
      defect_rate: first.defect_rate || '',
      result: first.final_result || '',
      inspector: first.inspector || '',
      remark: first.remark || ''
    };
  }
});
// 날짜 포맷 함수
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
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
            <label class="col-span-1 font-semibold text-blue-600 whitespace-nowrap">검사 결과 코드</label>
            <InputText class="col-span-2" :value="header.qir_code" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 지시일</label>
            <InputText class="col-span-2" :value="header.qio_date" readonly />
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
            <InputText class="col-span-2" :value="header.inspection_item" readonly />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사일시</label>
            <InputText class="col-span-2" :value="header.inspect_datetime" readonly />
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
            <InputText class="col-span-2" v-model="criteriaInput.note" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 방법</label>
            <InputText class="col-span-2" v-model="criteriaInput.mat_code" readonly />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">상한 값</label>
            <InputText class="col-span-2" v-model="criteriaInput.mat_name" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">하한 값</label>
            <InputText class="col-span-2" v-model="criteriaInput.mat_name" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">단위</label>
            <InputText class="col-span-2" v-model="criteriaInput.req_qtt" readonly />
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
            <InputText class="col-span-2" v-model="resultInput.start_date" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 종료일</label>
            <InputText class="col-span-2" v-model="resultInput.end_date" readonly />
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
            <InputText class="col-span-2" v-model="resultInput.unpass_qtt" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">불량률</label>
            <InputText class="col-span-2" v-model="resultInput.defect_rate" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">최종결과</label>
            <InputText class="col-span-2" v-model="resultInput.final_result" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사자</label>
            <InputText class="col-span-2" v-model="resultInput.inspector" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">비고</label>
            <InputText class="col-span-2" v-model="resultInput.remark" readonly />
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
</style>
