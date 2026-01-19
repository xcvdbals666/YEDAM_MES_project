<!-- views/Productions.WorkOrderList.vue (작업지시서 목록조회 및 검색 wko_tbl ) -->
<!-- http://localhost:3000/produce/workorderList -->
<script setup>
import { onMounted, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductionsStore } from '@/stores/production1';

const store = useProductionsStore();
const { wkoList, loading } = storeToRefs(store);

onMounted(store.fetchWorkOrders);

const from = ref('');
const to = ref('');
const stat = ref('');
const line = ref('');
const name = ref('');
const wko = ref('');

// 날짜 비교용
const toStart = (d) => (d ? new Date(d + 'T00:00:00') : null);
const toEnd = (d) => (d ? new Date(d + 'T23:59:59') : null);

const filteredList = computed(() => {
  const f = toStart(from.value);
  const t = toEnd(to.value);

  return (wkoList.value || []).filter((row) => {
    // row.start_date가 '2026-01-19 10:00:00' 같은 문자열이라고 가정
    const rowStart = row.start_date ? new Date(String(row.start_date).replace(' ', 'T')) : null;

    // 기간
    if (f && rowStart && rowStart < f) return false;
    if (t && rowStart && rowStart > t) return false;

    // 상태(정확히 일치)
    if (stat.value && String(row.stat) !== stat.value) return false;

    // 라인(정확히 일치)
    if (line.value && String(row.line_code) !== line.value) return false;

    // 제품명(포함)
    if (name.value && !String(row.wko_name || '').includes(name.value)) return false;

    // 지시서번호(포함)
    if (wko.value && !String(row.wko_code || '').includes(wko.value)) return false;

    return true;
  });
});

const reset = () => {
  from.value = '';
  to.value = '';
  stat.value = '';
  line.value = '';
  name.value = '';
  wko.value = '';
};
</script>

<template>
  <div class="card">
    <!-- 검색  -->
    <div class="flex flex-wrap items-end gap-2 mb-3">
      <div class="flex flex-col gap-1">
        <label class="text-sm">기간(시작)</label>
        <input type="date" v-model="from" class="p-inputtext p-component" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm">기간(종료)</label>
        <input type="date" v-model="to" class="p-inputtext p-component" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm">상태</label>
        <InputText v-model="stat" placeholder="예: v1" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm">라인</label>
        <InputText v-model="line" placeholder="예: LINE01" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm">제품명</label>
        <InputText v-model="name" placeholder="제품명 포함검색" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm">작업지시번호</label>
        <InputText v-model="wko" placeholder="번호 포함검색" />
      </div>

      <div class="flex gap-2">
        <Button label="초기화" outlined icon="pi pi-refresh" @click="reset" />
      </div>
    </div>
  </div>

  <div class="card">
    <h3>작업지시서 목록</h3>

    <DataTable :value="filteredList" :loading="loading" paginator :rows="10" showGridlines>
      <template #empty>데이터가 없습니다.</template>

      <Column field="wko_code" header="지시서번호" />
      <Column field="wko_name" header="제품명" />
      <Column field="line_code" header="라인코드" />
      <Column field="wko_qtt" header="지시수량" />
      <Column field="start_date" header="시작시간" />
      <Column field="end_date" header="완료예정일" />
      <Column field="stat" header="상태" />
    </DataTable>
  </div>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
  font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}
</style>
