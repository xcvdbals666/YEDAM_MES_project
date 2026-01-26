<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { downloadExcel } from '@/utils/excel';
import { useMaterialStore } from '@/stores/material2';

const store = useMaterialStore();
const router = useRouter();
const route = useRoute();

// 검색 조건
const searchValue = ref({
  ioType: 'ALL',
  dateFrom: null,
  dateTo: null,
  keyword: '',
  status: 'ALL'
});

onMounted(() => {
  store.fetchInOutList(searchValue.value);
});

const list = computed(() => store.matInOutList);

const selectedRows = ref([]);

const formatDate = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const search = () => {
  store.fetchInOutList(searchValue.value);
};

// 초기화
const doReset = async (askConfirm = true) => {
  if (askConfirm) {
    if (!confirm('입력한 검색 조건을 모두 초기화하시겠습니까?')) return;
  }

  searchValue.value = {
    ioType: 'ALL',
    dateFrom: null,
    dateTo: null,
    keyword: '',
    status: 'ALL'
  };

  store.fetchInOutList(searchValue.value);
};

// 초기화 버튼
const reset = () => doReset(true);

// watch(
//   () => store.matInOutList,
//   () => {
//     selectedRows.value = [];
//   }
// );

// 엑셀 다운로드
const handleExcelDownload = () => {
  if (list.value.length === 0) {
    alert('다운로드할 데이터가 없습니다.');
    return;
  }

  const headers = ['구분', '처리일자', '자재코드', '자재명', '규격', '요청수량', '처리수량', '단위', '처리상태', '담당자'];
  const mapFunction = (item) => [
    item.io_type === 'IN' ? '입고' : '출고',
    formatDate(item.process_date),
    item.mat_code,
    item.mat_name,
    item.spec,
    item.req_qtt,
    item.proc_qtt,
    item.unit_label,
    item.status_code === 'c2' ? '입고완료' : item.status_code === 'c3' ? '부분입고' : item.status_code === 'c4' ? '출고완료' : '-',
    item.emp_name
  ];
  downloadExcel(selectedRows.value.length > 0 ? selectedRows.value : list.value, headers, mapFunction, '입출고내역');
};

// 탭 관련
const tabs = [
  { label: '자재 입출고', path: '/matInout' },
  { label: '완제품 입출고', path: '/prodInout' }
];

const activeTab = computed({
  get() {
    return route.path === '/prodInout' ? 1 : 0;
  },
  set(idx) {
    router.push(tabs[idx].path);
  }
});
</script>

<template>
  <div class="card">
    <div class="flex justify-between items-center pb-4">
      <h4 class="m-0 font-semibold">입출고 내역 조회</h4>
      <div class="flex gap-3">
        <Button icon="pi pi-undo" label="초기화" severity="secondary" @click="reset" class="px-4 py-2" />
        <Button icon="pi pi-search" label="조회" @click="search" class="px-4 py-2" />
      </div>
    </div>

    <TabMenu :model="tabs" v-model:activeIndex="activeTab" class="mb-4" />

    <!-- 검색 조건 영역 -->
    <div class="search-section">
      <div class="search-grid">
        <!-- 구분 -->
        <div class="search-item search-item-type">
          <label class="search-label">구분</label>
          <div class="flex gap-2">
            <Button label="전체" :outlined="searchValue.ioType !== 'ALL'" @click="searchValue.ioType = 'ALL'" class="flex-1" />
            <Button label="입고" severity="success" :outlined="searchValue.ioType !== 'IN'" @click="searchValue.ioType = 'IN'" class="flex-1" />
            <Button label="출고" severity="warning" :outlined="searchValue.ioType !== 'OUT'" @click="searchValue.ioType = 'OUT'" class="flex-1" />
          </div>
        </div>

        <!-- 입출고일자 -->
        <div class="search-item search-item-date">
          <label class="search-label">입출고일자</label>
          <div class="flex gap-2">
            <DatePicker v-model="searchValue.dateFrom" dateFormat="yy-mm-dd" :showIcon="true" placeholder="시작일" class="w-full" />
            <DatePicker v-model="searchValue.dateTo" dateFormat="yy-mm-dd" :showIcon="true" placeholder="종료일" class="w-full" />
          </div>
        </div>

        <!-- 자재 검색 -->
        <div class="search-item search-item-keyword">
          <label class="search-label">자재 검색</label>
          <InputText v-model="searchValue.keyword" placeholder="자재코드 / 자재명" class="w-full" />
        </div>

        <!-- 처리 상태 -->
        <div class="search-item search-item-status">
          <label class="search-label">처리 상태</label>
          <Select
            v-model="searchValue.status"
            :options="[
              { label: '전체', value: 'ALL' },
              { label: '부분입고', value: 'c3' },
              { label: '입고완료', value: 'c2' },
              { label: '출고완료', value: 'c4' }
            ]"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
      </div>
    </div>
  </div>

  <div class="card mt-6 h-[560px]">
    <div class="flex justify-between align-items-center mb-3">
      <h4 class="m-0">입출고 내역</h4>
      <Button icon="pi pi-file-excel" label="엑셀 다운로드" @click="handleExcelDownload" class="px-3 py-1 h-[35px] gap-2" />
    </div>

    <div class="flex justify-between items-center mb-2">
      <span
        >총 <span class="font-black">{{ list.length }}</span
        >건</span
      >
    </div>

    <DataTable :value="list" dataKey="io_code" v-model:selection="selectedRows" selectionMode="checkbox" showGridlines scrollable scroll-height="380px" paginator :rows="10" class="p-datatable-sm">
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>

      <Column selectionMode="multiple" headerStyle="width: 48px" />

      <Column header="구분" field="io_type" sortable headerStyle="width: 90px">
        <template #body="{ data }">
          <Tag :value="data.io_type === 'IN' ? '입고' : '출고'" :severity="data.io_type === 'IN' ? 'success' : 'warn'" />
        </template>
      </Column>

      <Column header="처리일자" field="process_date" sortable headerStyle="width: 130px">
        <template #body="{ data }">{{ formatDate(data.process_date) }}</template>
      </Column>

      <Column header="자재코드" field="mat_code" sortable headerStyle="width: 140px" />
      <Column header="자재명" field="mat_name" headerStyle="width: 160px" />
      <Column header="규격" field="spec" headerStyle="width: 150px" />
      <Column header="요청수량" field="req_qtt" sortable headerStyle="width: 120px" />
      <Column header="처리수량" field="proc_qtt" sortable headerStyle="width: 120px" bodyStyle="color: blue; font-weight: bold;" />
      <Column header="단위" field="unit_label" headerStyle="width: 80px">
        <template #body="{ data }">
          {{ data.unit_label ? data.unit_label : '-' }}
        </template>
      </Column>
      <Column header="처리상태" field="status_code" headerStyle="width: 120px">
        <template #body="{ data }">
          <Tag
            :value="data.status_code === 'c2' ? '입고완료' : data.status_code === 'c3' ? '부분입고' : data.status_code === 'c4' ? '출고완료' : '-'"
            :severity="data.status_code === 'c2' ? 'success' : data.status_code === 'c3' ? 'info' : data.status_code === 'c4' ? 'warn' : 'secondary'"
          />
        </template>
      </Column>

      <Column header="담당자" field="emp_name" headerStyle="width: 120px" />
    </DataTable>
  </div>
</template>

<style scoped>
/* 검색 영역 */
.search-section {
  background: #f8f9fa;
  padding: 20px 24px;
  border-radius: 8px;
}

.search-grid {
  display: flex;
  gap: 20px;
}

.search-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.search-item-type {
  flex: 0 0 280px;
}

.search-item-date {
  flex: 0 0 420px;
}

.search-item-keyword {
  flex: 0 0 280px;
}

.search-item-status {
  flex: 0 0 200px;
}

.search-label {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  white-space: nowrap;
  min-width: 70px;
  flex-shrink: 0;
}

/* 테이블 스타일 */
:deep(.p-datatable.p-datatable-gridlines .p-datatable-table th:not(:first-child)),
:deep(.p-datatable.p-datatable-gridlines .p-datatable-table td:not(:first-child)) {
  border-left: 0 !important;
}

:deep(.p-datatable.p-datatable-sm .p-datatable-tbody > tr > td) {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

:deep(.p-datatable.p-datatable-sm .p-datatable-thead > tr > th) {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
</style>
