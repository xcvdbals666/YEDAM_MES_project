<!--QiOrderList.vue-->

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQualityStore } from '@/stores/quality2.js';
// import SelectQioModal from '@/components/material/modal/SelectQioModal.vue';

const qualityStore = useQualityStore();

const displaQiomodal = ref(false);
const searchKeyword = ref('');


//검색
const qio_code = ref('');
const mat_name = ref('');
const qio_date = ref('');

const headerData = ref({
  qio_code: '',
  mat_name: '',
  qio_date: ''
});

onMounted(async () => {
  try {
    const response = await axios.get('');
    headerData.value.qio_code = response.data.aio_code;
  } catch (err) {
    console.error('요청번호 조회 실패', err);
  }
});

const items = ref([]);

const selectQio = (qio) => {
  headerData.value.qio_code = qio.qio_code;
  headerData.value.qio_date = qio.qio_date;
};

const search = () => {
  qualityStore.fetchQiOrderList(qio_code.value);
};

const filteredOrders = computed(() => {
  return qualityStore.qiOrderList.filter((item) => {
    return (!qio_code.value || item.qio_code.includes(qio_code.value)) && (!mat_name.value || item.mat_name?.includes(mat_name.value));
  });
});
</script>

<template>
  <div class="card border border-gray-200 flex flex-col gap-6 p-fluid">
    <!--모달창-->
    <!-- <SelectQioModal v-model:visible="items" class="mt-4" /> -->

    <div class="text-2xl font-bold text-center">품질 검사 지시 조회</div>

    <!-- 검색 조건 영역 -->
    <div class="grid grid-cols-4 gap-6">
      <!-- 지시코드 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">지시코드</label>
        <InputText v-model="qio_code" placeholder="입력 하면 아래에 떠야 함" class="w-full" @select="selectQio" />
      </div>

      <!-- 제품명 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">제품명</label>
        <InputText v-model="mat_name" placeholder="입력 하면 아래에 떠야 함" class="w-full" />
      </div>

      <!-- 시작일 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">지시일자 - 시작일</label>
        <DatePicker v-model="qio_date" class="w-full" inputClass="w-full" showIcon showButtonBar appendTo="body" placeholder="시작일" />
      </div>

      <!-- 종료일 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">지시일자 - 종료일</label>
        <DatePicker v-model="insp_date" class="w-full" inputClass="w-full" showIcon showButtonBar appendTo="body" placeholder="종료일" />
      </div>
    </div>

    <!-- 버튼 영역 -->
    <div class="flex items-center justify-between mt-2">
      <!-- 왼쪽 영역 -->
      <div class="flex gap-4">
        <Button label="전체" severity="contrast" />
        <Button label="조회" severity="warn" @click="search" />
      </div>
    </div>
  </div>

  <section class="flex-1 bg-white px-6 pt-15 pb-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
    <div class="flex justify-between items-center mb-5">
      <div class="text-s text-gray-800">
        검색결과
        <span class="text-orange-500 font-bold">{{ filteredOrders.length }}</span> 건
      </div>
    </div>

    <!--수정해야함-->
    <div class="flex-1 overflow-auto rounded-lg border border-gray-200">
      <DataTable :value="filteredOrders">
        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>

        <Column selectionMode="multiple" headerStyle="width:48px" />
        <Column header="지시코드" field="qio_code" headerClass="table-header" bodyClass="table-body" />
        <Column header="지시일자" field="qio_date" headerClass="table-header" bodyClass="table-body" />
        <Column header="검사유형" field="inspect_type" headerClass="table-header" bodyClass="table-body" />
        <Column header="제품명" field="mat_name" headerClass="table-header" bodyClass="table-body" />
        <Column header="상태" field="qio_status" headerClass="table-header" bodyClass="table-body" />
      </DataTable>
    </div>
  </section>
</template>
