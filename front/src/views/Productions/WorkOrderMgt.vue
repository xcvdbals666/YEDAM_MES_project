<!-- views/Productions/WorkOrderMgt.vue (작업지시서 관리) -->
<!-- 1. 생산계획 불러오기 (prdp_tbl, prdp_d_tbl)-->
<!-- 
  생산 계획을 지정해 작업 지시서를 생성할 수 있으며, 
  생산 계획이 없어도 작업 지시서를 생성할 수 있습니다.
  생산 계획이 선택된다면 생산 계획에 해당하는 제품만 선택이 가능하고,
  생산 라인도 선택된 제품이 사용 가능한 라인만 조회됩니다.
  작업 지시서 불러오기 버튼으로 등록된 작업 지시서를 수정할 수 있습니다 
  -->
<script setup>
import { ref } from 'vue';
import { useProductionsStore } from '@/stores/production1';
import { storeToRefs } from 'pinia';

const store = useProductionsStore();
const { prdpList, prdpLoading, prdpError } = storeToRefs(store);

const prdpModalOpen = ref(false);

const openPrdpModal = async () => {
  prdpModalOpen.value = true;
  await store.fetchPrdpActive();
};
</script>

<template>
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <div class="font-semibold text-xl">기본정보</div>

      <div class="flex gap-2">
        <button class="p-button p-button-danger">삭제</button>
        <button class="p-button p-button-secondary">초기화</button>
        <button class="p-button p-button-info">저장</button>
        <button class="p-button p-button-success" @click="openPrdpModal">생산계획 불러오기</button>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-3">
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">작업지시번호</label>
        <input type="text" class="p-inputtext w-full" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">생산계획번호</label>
        <input type="text" class="p-inputtext w-full" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">계획일자</label>
        <input type="date" class="p-inputtext w-full" />
      </div>

      <div class="col-span-12 lg:col-span-6"></div>
    </div>
  </div>

  <div class="card">
    <div class="font-semibold text-xl pb-4">작업지시사항</div>

    <div class="grid grid-cols-12 gap-3">
      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">제품명</label>
        <input type="text" v-model="to" class="p-inputtext w-full" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">지시수량</label>
        <input type="text" v-model="to" class="p-inputtext w-full" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">작업시작일시</label>
        <input type="date" v-model="to" class="p-inputtext w-full" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">예상완료일시</label>
        <input type="date" v-model="to" class="p-inputtext w-full" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">지시 상태</label>
        <input type="text" v-model="to" class="p-inputtext w-full" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">라인 유형</label>
        <input type="text" v-model="to" class="p-inputtext w-full" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">라인 코드</label>
        <input type="text" v-model="to" class="p-inputtext w-full" />
      </div>

      <div class="col-span-12 lg:col-span-6 flex items-center gap-3"></div>
    </div>
  </div>

  <!-- 모달창에 생산계획 리스트 띄우기 -->
  <Dialog v-model:visible="prdpModalOpen" modal header="생산계획 불러오기" :style="{ width: '70vw' }">
    <div v-if="prdpError" class="p-2 text-red-500">생산계획 목록을 불러오지 못했습니다.</div>

    <DataTable :value="prdpList" :loading="prdpLoading" scrollable scrollHeight="400px">
      <Column field="prdp_code" header="계획번호" />
      <Column field="prdp_name" header="계획명" />
      <Column field="prdp_date" header="계획일자" />
      <Column field="due_date" header="납기일자" />
      <Column field="start_date" header="작업시작일" />
    </DataTable>

    <template #footer>
      <Button label="닫기" @click="prdpModalOpen = false" />
    </template>
  </Dialog>
</template>

<style scoped>
.pf-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
