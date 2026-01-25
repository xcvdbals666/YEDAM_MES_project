<script setup>
import { ref, onMounted } from 'vue';
import { useMaterialStore } from '@/stores/material2';

import MaterialStockList from '@/components/material/MaterialStockList.vue';
import MaterialStockDetail from '@/components/material/MaterialStockDetail.vue';

const store = useMaterialStore();

const searchValue = ref({
  keyword: '',
  matType: 'ALL',
  stockStatus: 'ALL'
});

const selectedMatCode = ref(null);
const loading = ref(false);

const search = async () => {
  selectedMatCode.value = null;
  loading.value = true;

  try {
    await store.fetchMaterialStockList(searchValue.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  search();
});

const reset = async (askConfirm = true) => {
  if (askConfirm) {
    if (!confirm('입력한 검색 조건을 모두 초기화하시겠습니까?')) return;
  }

  searchValue.value = {
    keyword: '',
    matType: 'ALL',
    stockStatus: 'ALL'
  };

  await search();
};

const handleSelect = async (matCode) => {
  selectedMatCode.value = matCode;
  loading.value = true;

  try {
    await Promise.all([store.fetchMaterialStockDetail(matCode), store.fetchMaterialStockSuppliers(matCode), store.fetchMaterialStockInOutHistory(matCode)]);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="grid grid-cols-12 gap-4 h-full">
    <div class="col-span-6 flex flex-col gap-4">
      <MaterialStockList :list="store.materialStockList" :searchValue="searchValue" @search="search" @reset="reset" @select="handleSelect" />
    </div>

    <div class="col-span-6">
      <div class="card h-full overflow-auto">
        <h3 class="mb-3 font-semibold">자재 세부 정보</h3>

        <MaterialStockDetail v-if="selectedMatCode" :detail="store.materialStockDetail" :suppliers="store.materialStockSuppliers" :inout="store.materialStockInOutHistory" :loading="loading" />

        <div v-else class="h-full flex items-center justify-center text-gray-400">좌측 목록에서 자재를 선택해주세요</div>
      </div>
    </div>
  </div>
</template>
