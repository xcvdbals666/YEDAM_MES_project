<!-- 선행페이지 : 작업지시서에 대한 공정 전체불레틴 -->
<!-- productions / WorkInProcessBulletin.vue -->
<!-- 이 bulletin에서 각 공정을 누르면 Detail페이지로 넘어가야함.  -->
<script setup>
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProductionsStore } from '@/stores/production1';

const route = useRoute();
const router = useRouter();
const store = useProductionsStore();

const { wipBulletin, wipBulletinLoading } = storeToRefs(store);

const wkoCode = computed(() => route.params.wko_code);

const fmt = (v) => {
  if (!v) return '-';
  return String(v).replace('T', ' ').slice(0, 19);
};

const onRowClick = (row) => {
  router.push({
    name: 'WorkInProcessDetail',
    params: { wko_code: wkoCode.value, po_code: row.po_code }
  });
};

onMounted(async () => {
  await store.fetchWipBulletin(wkoCode.value);
});
</script>

<template>
  <div class="card">
    <div class="flex items-center justify-between mb-3">
      <div class="font-semibold text-xl">작업진행</div>
      <div class="text-sm text-gray-500">작업지시번호: {{ wkoCode }}</div>
    </div>

    <DataTable
      :value="wipBulletin"
      :loading="wipBulletinLoading"
      dataKey="po_code"
      class="w-full"
      scrollable
      scrollHeight="520px"
      @rowClick="(e) => onRowClick(e.data)"
      rowHover
    >
      <Column field="po_name" header="공정명" style="min-width: 140px" />

      <Column header="진행률" style="min-width: 220px">
        <template #body="{ data }">
          <!-- 너 나중에 진행률 계산 붙이면 됨. 지금은 0% 고정 -->
          <div class="w-full">
            <div class="h-3 rounded bg-gray-200 overflow-hidden">
              <div class="h-3 bg-gray-400" style="width:0%"></div>
            </div>
            <div class="text-center text-xs mt-1">0%</div>
          </div>
        </template>
      </Column>

      <Column header="설비" style="min-width: 220px">
        <template #body="{ data }">
          <span class="pill">
            {{ data.eq_code ? `${data.eq_code} ${data.eq_name}` : '-' }}
          </span>
        </template>
      </Column>

      <Column header="시작일시" style="min-width: 170px">
        <template #body="{ data }">
          {{ fmt(data.start_date) }}
        </template>
      </Column>

      <Column header="종료일시" style="min-width: 170px">
        <template #body="{ data }">
          {{ fmt(data.end_date) }}
        </template>
      </Column>

      <Column header="투입량" style="min-width: 100px; text-align:right">
        <template #body="{ data }">
          {{ data.input_qtt ?? '-' }}
        </template>
      </Column>

      <Column header="불량량" style="min-width: 100px; text-align:right">
        <template #body>
          -
        </template>
      </Column>

      <Column header="생산량" style="min-width: 100px; text-align:right">
        <template #body>
          -
        </template>
      </Column>

      <template #empty>
        <div class="p-4 text-gray-500">공정 정보가 없습니다.</div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: #f3f4f6;
  font-size: 0.85rem;
}
</style>
