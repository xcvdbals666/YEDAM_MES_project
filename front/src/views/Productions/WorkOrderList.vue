<!-- views/Productions.WorkOrderList.vue (작업지시서 목록조회 및 검색 wko_tbl ) -->
<!-- http://localhost:3000/produce/workorderList -->
<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductionsStore } from '@/stores/production1';

const store = useProductionsStore();
const { wkoList, loading, error, from, to, stat, line, name, wko, lines } = storeToRefs(store);

const statusOptions = [
  { label: '작업대기', value: 'v1' },
  { label: '작업보류', value: 'v2' },
  { label: '진행중', value: 'v3' },
  { label: '작업취소', value: 'v4' }

];

//
const statusMap = {
  v1: '작업대기',
  v2: '작업보류',
  v3: '진행중',
  v4: '작업취소'
};

onMounted(() => {
  store.fetchWorkOrders();
  store.fetchLines();
});
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl pb-4">작업지시서 조회</div>

    <div class="search-box">
      <div class="search-left">
        <div class="field-row">
          <label>기간</label>
          <div class="date-wrap">
            <input type="date" v-model="from" class="p-inputtext p-component" />
            <input type="date" v-model="to" class="p-inputtext p-component" />
          </div>
        </div>

        <div class="field-row">
          <label>제품명</label>
          <InputText v-model="name" placeholder="제품명" class="w-full" />
        </div>
      </div>

      <div class="search-mid">
        <div class="field-row">
          <label>상태</label>
          <Dropdown v-model="stat" :options="statusOptions" optionLabel="label" optionValue="value" class="w-full" placeholder="상태 선택" />
        </div>

        <div class="field-row">
          <label>작업지시번호</label>
          <InputText v-model="wko" placeholder="작업지시번호 입력" class="w-full" />
        </div>
      </div>

      <div class="search-right">
        <div class="field-row">
          <label>라인</label>
          <Dropdown v-model="line" :options="lines" optionLabel="line_code" optionValue="line_code" placeholder="라인 선택" class="w-full" />
        </div>

        <!-- 공정유형이 어딧는데 ... -->
        <!-- <div class="field-row">
          <label>공정유형</label>
          <Dropdown v-model="procType" :options="procOptions" class="w-full" />
        </div> -->
      </div>
    </div>

    <div class="search-btns">
      <Button label="검색" icon="pi pi-search" @click="store.search()" />
      <Button label="초기화" icon="pi pi-refresh" outlined @click="store.reset()" />
    </div>
  </div>
  <div class="card">
    <div v-if="error" class="p-message p-message-error mb-3">작업지시서 조회 실패</div>

    <DataTable :value="wkoList" :loading="loading" paginator :rows="10" showGridlines>
      <Column field="wko_code" header="지시서번호" />
      <Column field="prod_name" header="제품명" />
      <Column field="line_code" header="라인코드" />
      <Column field="start_date" header="시작시간" />
      <Column field="end_date" header="완료예정일" />
      <Column header="상태">
        <template #body="{ data }">
          {{ statusMap[data.stat] || data.stat }}
        </template>
      </Column>
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

.search-box {
  display: grid;
  grid-template-columns: 3fr 2fr 2fr;
  gap: 20px;
  align-items: start;
}

.search-left,
.search-mid,
.search-right {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-wrap {
  display: flex;
  gap: 10px;
}

.field-row label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #444;
}

.search-btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

@media (max-width: 900px) {
  .search-box {
    grid-template-columns: 1fr;
  }
}
</style>
