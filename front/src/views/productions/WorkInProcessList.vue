<!-- productions / WorkInProcessList.vue -->
<!-- 작업 진행 조회 페이지  -->
<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProductionsStore } from '@/stores/production1';

const router = useRouter();
const store = useProductionsStore();

// store refs (검색조건 + 목록)
const {
  from,
  to,
  line,
  name,
  wko,
  lines,

  // 작업진행조회 전용
  wkoName,
  wipList,
  wipLoading,
  wipError
} = storeToRefs(store);

const convertDate = (d) => {
  if (!d) return '';
  return d.slice(0, 10);
};

const fmtDateTime = (v) => {
  if (!v) return '';
  const s = String(v);
  return s.replace('T', ' ').slice(0, 19);
};

const statusMap = {
  v1: '작업대기',
  v2: '작업완료',
  v3: '진행중',
  v4: '작업취소'
};

// 조회 / 초기화
const onSearch = async () => {
  await store.searchWip();
};

const onReset = async () => {
  await store.resetWip();
};

// 행 클릭, 상세 페이지 이동
const goDetail = (row) => {
  if (!row?.wko_code) return;
  router.push({
    name: 'WorkInProcessBulletin', //router에추가
    params: { wko_code: row.wko_code },
    query: { line_code: row.line_code }
  });
};

onMounted(async () => {
  await store.fetchLines();
  await store.fetchWorkInProcess();
});
</script>

<template>
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <div class="font-semibold text-xl">기본정보</div>

      <div class="flex gap-2">
        <Button label="초기화" severity="secondary" @click="onReset" />
        <Button label="조회" severity="info" @click="onSearch" />
      </div>
    </div>

    <div class="grid grid-cols-12 gap-3">
      <div class="col-span-12 lg:col-span-4 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">작업지시번호</label>
        <InputText v-model="wko" placeholder="작업지시번호 입력" class="w-full" />
      </div>

      <div class="col-span-12 lg:col-span-4 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">작업지시명</label>
        <InputText v-model="wkoName" placeholder="작업지시명 입력" class="w-full" />
      </div>

      <div class="col-span-12 lg:col-span-4 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">제품명</label>
        <InputText v-model="name" placeholder="제품명" class="w-full" />
      </div>

      <div class="col-span-12 lg:col-span-4 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">라인코드</label>
        <Dropdown v-model="line" :options="lines" optionLabel="line_code" optionValue="line_code" placeholder="라인 선택" class="w-full" showClear />
      </div>

      <div class="col-span-12 lg:col-span-4 flex items-center gap-3">
        <label class="w-28 shrink-0 text-lg font-semibold">등록일자</label>
        <div class="flex gap-2 w-full">
          <input type="date" class="p-inputtext w-full" v-model="from" />
          <input type="date" class="p-inputtext w-full" v-model="to" />
        </div>
      </div>

      <div class="col-span-12 lg:col-span-4"></div>
    </div>

    <div v-if="wipError" class="mt-3 text-red-500">작업진행 목록을 불러오지 못했습니다.</div>
  </div>

  <div class="card">
    <div class="flex justify-between items-center mb-3">
      <div class="font-semibold text-xl">작업진행 조회</div>
    </div>

    <DataTable :value="wipList" :loading="wipLoading" dataKey="wko_code" scrollable scrollHeight="520px" selectionMode="single" @rowClick="(e) => goDetail(e.data)" class="w-full">
      <Column field="wko_code" header="작업지시코드" style="min-width: 160px" />
      <Column field="wko_name" header="작업지시명" style="min-width: 180px" />
      <Column field="prod_code" header="제품코드" style="min-width: 120px" />
      <Column field="prod_name" header="제품명" style="min-width: 160px" />

      <Column field="wko_qtt" header="지시수량(개)" style="min-width: 120px" />

      <Column header="지시상태" style="min-width: 110px">
        <template #body="{ data }">
          {{ statusMap[data.stat] || data.stat }}
        </template>
      </Column>

      <Column header="등록일자" style="min-width: 130px">
        <template #body="{ data }">
          {{ convertDate(data.reg_date) }}
        </template>
      </Column>

      <Column header="시작시간" style="min-width: 160px">
        <template #body="{ data }">
          {{ fmtDateTime(data.start_time) }}
        </template>
      </Column>

      <Column header="종료시간" style="min-width: 160px">
        <template #body="{ data }">
          {{ fmtDateTime(data.end_time) }}
        </template>
      </Column>

      <Column field="line_code" header="라인코드" style="min-width: 110px" />

      <template #empty>
        <div class="p-4 text-gray-500">조회 결과가 없습니다.</div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.85rem;
  background: #f3f4f6;
}
</style>
