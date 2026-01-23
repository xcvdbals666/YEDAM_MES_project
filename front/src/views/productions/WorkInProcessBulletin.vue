<!-- 선행페이지 : 작업지시서에 대한 공정 전체불레틴 -->
<!-- productions / WorkInProcessBulletin.vue -->
<!-- 이 bulletin에서 각 공정을 누르면 Detail페이지로 넘어가야함.  -->

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProductionsStore } from '@/stores/production1';

const route = useRoute();
const router = useRouter();
const store = useProductionsStore();

const { wipDetail, processOptions, lineEquipments, prdrStatusList } = storeToRefs(store);

const wkoCode = computed(() => route.params.wko_code); // 작업지시 번호

const loading = ref(false);
const error = ref(null);

const fmt = (v) => {
  if (!v) return '-';
  return String(v).replace('T', ' ').slice(0, 19);
};

const bulletinRows = computed(() => {
  const processes = Array.isArray(processOptions.value) ? processOptions.value : [];
  const eqs = Array.isArray(lineEquipments.value) ? lineEquipments.value : [];
  const status = Array.isArray(prdrStatusList.value) ? prdrStatusList.value : [];

  const statusByLineEq = new Map(status.map((s) => [s.line_eq_code, s]));

  return processes
    .slice()
    .sort((a, b) => (a.no ?? 0) - (b.no ?? 0))
    .map((p) => {
      const matchedEqs = eqs.filter((e) => e.eq_type === p.eq_type);

      const eqText = matchedEqs.length
        ? matchedEqs.map((e) => `${e.eq_code} ${e.eq_name}`).join(', ')
        : '-';

      let latest = null;
      for (const e of matchedEqs) {
        const s = statusByLineEq.get(e.line_eq_code);
        if (!s?.start_date) continue;
        const t = new Date(s.start_date).getTime();
        if (!latest || t > latest._t) {
          latest = {
            _t: t,
            line_eq_code: e.line_eq_code,
            eq_code: e.eq_code,
            eq_name: e.eq_name,
            prdr_d_code: s.prdr_d_code ?? null,
            start_date: s.start_date ?? null,
            end_date: s.end_date ?? null,
            input_qtt: s.input_qtt ?? null
          };
        }
      }

      const start_date = latest?.start_date ?? null;
      const end_date = latest?.end_date ?? null;

      let statusText = '미작업';
      if (start_date && !end_date) statusText = '진행중';
      if (end_date) statusText = '작업완료';

      return {
        po_code: p.po_code,
        po_name: p.po_name,
        no: p.no,
        eq_type: p.eq_type,

        eq_text: eqText,

        prdr_d_code: latest?.prdr_d_code ?? null,
        start_date,
        end_date,
        input_qtt: latest?.input_qtt ?? null,

        statusText
      };
    });
});

// 공정명 클릭 디테일 페이지 이동
const goDetail = (row) => {
  router.push({
    name: 'WorkInProcessDetail',
    params: { wko_code: wkoCode.value },
    query: { po_code: row.po_code }
  });
};



onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    await store.fetchWorkInProcessDetail(wkoCode.value);

    const lineCode = wipDetail.value?.line_code;
    if (lineCode) {
      await store.fetchEquipmentsByLine(lineCode);
    } else {
      lineEquipments.value = [];
    }

    await store.fetchProcessByWko(wkoCode.value);

    await store.fetchPrdrStatusByWko(wkoCode.value);
  } catch (e) {
    console.error(e);
    error.value = e;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <Fluid class="card">
    <div class="justify-items-start pb-4">
      <div class="flex gap-2 w-30">
        <Button icon="pi pi-arrow-left" label="목록으로" severity="secondary"></Button>
      </div>
    </div>
    <div class="font-semibold text-xl">작업진행</div>
    <div class="text-sm text-gray-500 pb-4">작업지시번호: {{ wkoCode }}</div>
    <DataTable :value="prdrs" :paginator="true" :rows="8" dataKey="prdr_code" :rowHover="true" showGridlines>
      <template #empty>
        <div class="text-center py-6 text-gray-400">진행 작업 없음</div>
      </template>
      <Column field="" header="공정명" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 60px" />
      <Column field="" header="진행률" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 120px">
        <template #body="{ data }">
          <ProgressBar :value="data.perform_rate"></ProgressBar>
        </template>
      </Column>
      <Column field="" header="설비" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 100px" />
      <Column field="" header="시작일시" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 120px" />
      <Column field="" header="종료일시" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 120px" />
      <Column field="" header="투입량" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 120px" />
      <Column field="" header="불량량" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 100px" />
      <Column field="" header="생산량" headerClass="table-header truncate" bodyClass="table-body text-[14px] truncate" style="width: 60px" />
    </DataTable>
  </Fluid>
  <div class="card">
    <div class="flex items-center justify-between mb-3">
      <div class="font-semibold text-xl">작업진행 불레틴</div>
      <div class="text-sm text-gray-500">작업지시번호: {{ wkoCode }}</div>
    </div>

    <div v-if="error" class="p-3 text-red-500">
      불레틴 조회 중 오류가 발생했습니다.
      <div class="text-xs mt-1 opacity-80">{{ String(error?.message ?? error) }}</div>
    </div>

    <DataTable
      :value="bulletinRows"
      :loading="loading"
      dataKey="po_code"
      class="w-full"
      scrollable
      scrollHeight="520px"
      rowHover
    >
      <!-- 공정명 -->
      <Column header="공정명" style="min-width: 160px">
        <template #body="{ data }">
          <button class="link-btn" type="button" @click="goDetail(data)">
            {{ data.po_name }}
          </button>
          <div class="text-xs text-gray-400 mt-1">순서: {{ data.no ?? '-' }}</div>
        </template>
      </Column>

      <!-- 상태 -->
      <Column header="상태" style="min-width: 110px">
        <template #body="{ data }">
          <span
            :class="[
              'badge',
              data.statusText === '진행중' && 'badge-running',
              data.statusText === '작업완료' && 'badge-done',
              data.statusText === '미작업' && 'badge-none'
            ]"
          >
            {{ data.statusText }}
          </span>
        </template>
      </Column>

      <!-- 설비 -->
      <Column header="설비" style="min-width: 260px">
        <template #body="{ data }">
          <span class="pill">{{ data.eq_text }}</span>
        </template>
      </Column>

      <!-- 시작일시 -->
      <Column header="시작일시" style="min-width: 180px">
        <template #body="{ data }">
          {{ fmt(data.start_date) }}
        </template>
      </Column>

      <!-- 종료일시 -->
      <Column header="종료일시" style="min-width: 180px">
        <template #body="{ data }">
          {{ fmt(data.end_date) }}
        </template>
      </Column>

      <!-- 투입량 -->
      <Column header="투입량" style="min-width: 110px; text-align:right">
        <template #body="{ data }">
          {{ data.input_qtt ?? '-' }}
        </template>
      </Column>

      <Column header="불량량" style="min-width: 110px; text-align:right">
        <template #body> - </template>
      </Column>

      <Column header="생산량" style="min-width: 110px; text-align:right">
        <template #body> - </template>
      </Column>

      <template #empty>
        <div class="p-4 text-gray-500">공정 정보가 없습니다.</div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.link-btn {
  color: #2563eb;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.link-btn:hover {
  opacity: 0.85;
}

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

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
}
.badge-running {
  background: #fef3c7;
  color: #92400e;
}
.badge-done {
  background: #dcfce7;
  color: #166534;
}
.badge-none {
  background: #f3f4f6;
  color: #6b7280;
}
</style>
