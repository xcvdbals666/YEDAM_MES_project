<script setup>
import { ref } from 'vue';

/* =====================
   더미 데이터 (화면 확인용)
===================== */
const orderInput = ref({
  qio_code: 'QIO-20260123-001',
  qio_date: '2026-01-23',
  emp_name: '홍길동'
});

const QiOrderItemInput = ref({
  note: '완제품',
  mat_code: 'MAT-001',
  mat_name: '제품A',
  req_qtt: 100
});

const allQiList = ref([
  {
    qcr_code: 'QCR-001',
    inspection_item: '외관검사',
    range_top: 10,
    range_bot: 5,
    note: 'EA'
  },
  {
    qcr_code: 'QCR-002',
    inspection_item: '치수검사',
    range_top: 20,
    range_bot: 10,
    note: 'mm'
  },
  {
    qcr_code: 'QCR-003',
    inspection_item: '기능검사',
    range_top: 1,
    range_bot: 0,
    note: 'PASS/FAIL'
  }
]);

/* =====================
   버튼 disabled 상태
===================== */
const callQiOrder = ref(false);
const callQiMinbnd = ref(false);
const callQiProd = ref(false);

/* =====================
   DataTable 선택
===================== */
const selectedProducts = ref([]);

/* =====================
   PrimeVue filters
===================== */
const filters = ref({
  global: { value: null, matchMode: 'contains' }
});
</script>

<template>
  <!-- 기본 정보 -->
  <div class="flex">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <div>검사 기본 정보</div>
        <div class="flex flex-row gap-2">
          <!--버튼 영역-->
          <Button label="임시버튼" severity="danger" />
          <Button label="임시버튼" severity="secondary" />
          <Button label="임시버튼" severity="success" />
          <Button label="임시버튼" :disabled="callQiOrder" />
        </div>
      </div>

      <!-- 1줄 -->
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3 items-center gap-2">
            <label class="col-span-1 font-semibold text-blue-600 whitespace-nowrap"> 검사 결과 코드 </label>
            <InputText class="col-span-2" :value="orderInput.qio_code" readonly />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 지시일</label>
            <InputText class="col-span-2" :value="orderInput.qio_date" readonly />
          </div>
        </div>
      </div>

      <!-- 2줄 -->
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 요청량</label>
            <InputText class="col-span-2" :value="orderInput.emp_name" readonly />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">품목명</label>
            <InputText class="col-span-2" :value="orderInput.inspect_type" readonly />
          </div>
        </div>
      </div>

      <!-- 3줄 -->
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사유형</label>
            <InputText class="col-span-2" :value="orderInput.qio_date" readonly />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사일시</label>
            <InputText class="col-span-2" :value="orderInput.complete_date" readonly />
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--------------------------------------------------------------------------------------------------->
  <!-- 검사 대상 정보 -->
  <div class="flex mt-4">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <div>검사 기준</div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 항목명</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.note" readonly />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 방법</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.mat_code" readonly />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">품질 규격</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.mat_name" readonly />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">값</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.req_qtt" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--------------------------------------------------------------------------------------------------->
  <!-- 아랫단 -->
  <div class="flex mt-4">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <div>검사 결과</div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사기간</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.note" readonly />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">합/불</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.mat_code" readonly />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">불량률</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.mat_name" readonly />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">최종판정</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.req_qtt" />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사자</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.req_qtt" />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">비고</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.req_qtt" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
