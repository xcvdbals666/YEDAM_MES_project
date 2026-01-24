<!-- 선행페이지 : 작업지시서에 대한 공정 전체불레틴 -->
<!-- productions / WorkInProcessBulletin.vue -->
<!-- 이 bulletin에서 각 공정을 누르면 Detail페이지로 넘어가야함.  -->

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductionStore } from '@/stores/production2';

const route = useRoute();
const router = useRouter();
const store = useProductionStore();

const wkoCode = computed(() => route.params.wko_code); // 작업지시 번호
const lineCode = computed(() => route.query.line_code);
const bulletinRows = ref([]);

onMounted(async () => {
  bulletinRows.value = await store.fetchPrdrDetail(wkoCode.value, lineCode.value);
});

const fmt = (v) => {
  if (!v) return '-';
  return String(v).replace('T', ' ').slice(0, 19);
};

// 공정명 클릭 디테일 페이지 이동
const goDetail = (row) => {
  router.push({
    name: 'WorkInProcessDetail',
    params: { wko_code: wkoCode.value },
    query: { po_code: row.po_code }
  });
};
</script>

<template>
  <Fluid class="card">
    <div class="justify-items-start pb-4">
      <div class="flex gap-2 w-30">
        <Button icon="pi pi-arrow-left" label="목록으로" severity="secondary" @click="router.push({ name: 'WorkInProcessList' })"></Button>
      </div>
    </div>
    <div class="flex items-center justify-between mb-3">
      <div class="font-semibold text-xl">작업진행</div>
      <div class="text-sm text-gray-500">작업지시번호: {{ wkoCode }}</div>
    </div>
    <DataTable :value="bulletinRows" dataKey="po_code" :rowHover="true" scrollable scrollHeight="h-full" showGridlines @row-click="goDetail($event.data)">
      <template #empty>
        <div class="text-center py-6 text-gray-400">진행 작업 없음</div>
      </template>
      <Column field="po_name" header="공정명" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 40px">
        <template #body="{ data }">
          <div>{{ data.no ?? '-' }}.{{ data.po_name }}</div>
          <div class="text-xs text-gray-400 mt-1">순서: {{ data.no ?? '-' }}</div>
        </template>
      </Column>
      <Column field="" header="진행률" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 200px">
        <template #body="{ data }">
          <ProgressBar :value="data.proc_rate"></ProgressBar>
        </template>
      </Column>
      <Column field="eq_name" header="설비" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 100px">
        <template #body="{ data }">
          <span class="pill">{{ data.eq_name }}</span>
        </template>
      </Column>
      <Column field="start_date" header="시작일시" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 100px">
        <template #body="{ data }">
          {{ fmt(data.start_date) }}
        </template>
      </Column>
      <Column field="end_date" header="종료일시" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 100px">
        <template #body="{ data }">
          {{ fmt(data.end_date) }}
        </template>
      </Column>
      <Column field="input_qtt" header="투입량" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 40px" />
      <Column field="def_qtt" header="불량량" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 40px" />
      <Column field="make_qtt" header="생산량" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 40px" />
    </DataTable>
  </Fluid>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: #f3f4f6;
  font-size: 0.85rem;
  line-height: 1.1;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
