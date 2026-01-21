<script setup>
import { ref, onMounted } from 'vue';
import { useMaterialStore } from '@/stores/material2';
import MprRequestSearch from '@/components/material/MprRequestSearch.vue';
import MprRequestHeaderList from '@/components/material/MprRequestHeaderList.vue';

const store = useMaterialStore();

// 검색
const searchValue = ref({
  mprCode: '',
  reqDateFrom: null,
  reqDateTo: null,
  deadlineFrom: null,
  deadlineTo: null,
  mrpCode: '',
  mcode: ''
});

// 날짜 포맷
const formatDate = (v) => {
  const d = new Date(v);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// 조회 결과
const requestList = ref([]);

// 조회(검색)
const search = async () => {
  // 값이 있는 것만 params로 보냄
  const keyword = Object.fromEntries(
    Object.entries({
      mprCode: searchValue.value.mprCode || null,
      reqDateFrom: searchValue.value.reqDateFrom ? formatDate(searchValue.value.reqDateFrom) : null,
      reqDateTo: searchValue.value.reqDateTo ? formatDate(searchValue.value.reqDateTo) : null,
      deadlineFrom: searchValue.value.deadlineFrom ? formatDate(searchValue.value.deadlineFrom) : null,
      deadlineTo: searchValue.value.deadlineTo ? formatDate(searchValue.value.deadlineTo) : null,
      mrpCode: searchValue.value.mrpCode || null,
      mcode: searchValue.value.mcode || null
    }).filter(([_, v]) => v)
  );

  await store.fetchRequest(keyword);
  requestList.value = store.requestList;
};

// 초기화
const reset = async (askConfirm = true) => {
  if (askConfirm) {
    if (!confirm('입력한 검색 조건을 모두 초기화하시겠습니까?')) return;
  }

  searchValue.value = {
    mprCode: '',
    reqDateFrom: null,
    reqDateTo: null,
    deadlineFrom: null,
    deadlineTo: null,
    mrpCode: '',
    mcode: ''
  };

  await search();
};

// 조건 없는 전체 조회
onMounted(() => {
  search();
});
</script>

<template>
  <MprRequestSearch v-model="searchValue" @search="search" @reset="reset" />
  <MprRequestHeaderList :list="requestList" />
</template>
