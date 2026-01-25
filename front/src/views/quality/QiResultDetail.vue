<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQualityStore2 } from '@/stores/quality2';

const route = useRoute();
const qualityStore = useQualityStore2();

const qirCode = route.params.qirCode;

onMounted(async () => {
  await qualityStore.fetchQiResultDetail(qirCode);
});

/* 상단 + 하단 (단건) */
const header = computed(() => qualityStore.qiResultDetail?.[0] || {});

/* 중단 (검사기준 여러 건) */
const criteriaList = computed(() => qualityStore.qiResultDetail || []);
</script>


<template>
  <!-- 기본 정보 -->
  <div class="flex">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <div>검사 기본 정보</div>
      </div>

      <!-- 1줄 -->
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3 items-center gap-2">
            <label class="col-span-1 font-semibold text-blue-600 whitespace-nowrap"> 검사 결과 코드 </label>
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

      <!-- 2줄 -->
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

      <!-- 3줄 -->
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
            <label class="col-span-1">상한 값</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.mat_name" readonly />
          </div>
        </div>

                <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">하한 값</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.mat_name" readonly />
          </div>
        </div>


        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">단위</label>
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
            <label class="col-span-1">검사 시작일</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.note" readonly />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">검사 종료일</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.mat_code" readonly />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">합격수량</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.mat_name" readonly />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">불합격수량</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.req_qtt" />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">불량률</label>
            <InputText class="col-span-2" v-model="QiOrderItemInput.req_qtt" />
          </div>
        </div>

        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label class="col-span-1">최종결과</label>
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
