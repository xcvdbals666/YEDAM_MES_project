<!-- productions / WorkInProcessList.vue -->
<!-- 작업 진행 상세 페이지-->
<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const wkoCode = computed(() => route.params.wko_code);

const detail = ref(null);
const loading = ref(false);
const error = ref(null);

const bomList = ref([]);
const bomLoading = ref(false);

const convertDate = (d) => {
  if (!d) return '';
  return String(d).slice(0, 10);
};
const fmtDateTime = (v) => {
  if (!v) return '';
  return String(v).replace('T', ' ').slice(0, 19);
};

const statusMap = {
  v1: '작업대기',
  v2: '작업완료',
  v3: '진행중',
  v4: '작업취소'
};


</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl">작업진행 상세</div>


    <div v-if="loading" class="p-3 text-gray-500">로딩중...</div>


    <div v-else class="grid grid-cols-12 gap-3">
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">공정명</label>
        <InputText :modelValue="detail?.wko_code ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">설비명</label>
        <InputText :modelValue="detail?.wko_code ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">제품명</label>
        <InputText :modelValue="detail?.prod_name ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">라인코드</label>
        <InputText :modelValue="detail?.line_code ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">작업지시명</label>
        <InputText :modelValue="detail?.wko_name ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">작업지시번호</label>
        <InputText :modelValue="detail?.wko_code ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">시작시간</label>
        <InputText :modelValue="detail?.prod_code ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">종료시간</label>
        <InputText :modelValue="detail?.wko_qtt ?? ''" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">투입량</label>
        <InputText :modelValue="statusMap[String(detail?.stat ?? '').toLowerCase()] ?? (detail?.stat ?? '')" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">지시량</label>
        <InputText :modelValue="convertDate(detail?.reg_date)" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">생산수량</label>
        <InputText :modelValue="fmtDateTime(detail?.start_date)" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">불량수량</label>
        <InputText :modelValue="fmtDateTime(detail?.end_date)" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">진행률</label>
        <InputText :modelValue="fmtDateTime(detail?.end_date)" class="w-full" readonly />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3"></div>

    </div>

    <div class="flex gap-2">
        <Button label="목록" severity="secondary" @click="goBack" />
        <Button label="작업시작" severity="success" @click="onStart" :disabled="loading || !detail || !!detail?.start_date" />
        <Button label="작업종료" severity="info" @click="onEnd" :disabled="loading || !detail || !detail?.start_date || !!detail?.end_date" />
      </div>
  </div>
  
  <div class="card">
    <div class="font-semibold text-xl">사용중인 설비</div>
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
