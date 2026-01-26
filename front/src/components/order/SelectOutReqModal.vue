<!-- src/components/order/SelectOutReqModal.vue -->
<script setup>
import { computed, ref, watch } from 'vue';
import { useOrderStore2 } from '@/stores/order2';

const store = useOrderStore2();
const props = defineProps({
  visible: Boolean,
  excludeStatuses: {
    type: Array,
    default: () => [] // 제외할 상태 코드 배열
  }
});
const emit = defineEmits(['update:visible', 'select']);
const selectedOutReq = ref(null);
const keyword = ref(''); // 검색 입력값

// 출고 상태 변환
const statusMap = {
  r1: { label: '출고 대기', severity: 'danger' },
  r2: { label: '부분 출고', severity: 'warn' },
  r3: { label: '출고 완료', severity: 'success' },
  r4: { label: '요청 취소', severity: 'secondary' }
};

// 출고요청 단위로 그룹화
const groupedOutReq = computed(() => {
  const grouped = {};

  store.requestCode.forEach((outReq) => {
    // 제외할 상태 체크
    if (props.excludeStatuses.includes(outReq.out_req_stat)) {
      return;
    }
    // 새로운 출고요청 객체 생성
    if (!grouped[outReq.out_req_code]) {
      grouped[outReq.out_req_code] = {
        out_req_code: outReq.out_req_code,
        prod_name: outReq.prod_name,
        ord_name: outReq.ord_name,
        out_req_date: outReq.out_req_date,
        out_req_stat: outReq.out_req_stat,
        products: []
      };
    }

    grouped[outReq.out_req_code].products.push(outReq.prod_name);
  });
  return Object.values(grouped).map((outReq) => ({
    ...outReq,
    prod_display: outReq.products.length > 1 ? `${outReq.products[0]} 외 ${outReq.products.length - 1}건` : outReq.products[0]
  }));
});

// 모달 열렸을 때
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.fetchOutReqCode({ keyword: '' });
      selectedOutReq.value = null;
      keyword.value = '';
    }
  }
);

// 검색어 변경될 때
watch(keyword, (val) => {
  store.fetchOutReqCode({ keyword: val });
});

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// 출고 코드 선택
const confirm = () => {
  if (!selectedOutReq.value) return;
  emit('select', selectedOutReq.value);
  // console.log(selectedOutReq.value);
  close();
};

// 날짜 포맷
const formatDate = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};
</script>

<template>
  <Dialog header="출고요청 선택" :visible="visible" modal style="width: 900px" @update:visible="close">
    <div class="mb-3">
      <InputText v-model="keyword" placeholder="출고요청코드 또는 주문명을 입력해주세요" class="w-full" />
    </div>

    <DataTable :value="groupedOutReq" v-model:selection="selectedOutReq" selectionMode="single" dataKey="out_req_code" scrollable scrollHeight="400px">
      <Column selectionMode="single" style="width: 3rem" />
      <Column field="out_req_code" header="출고요청코드" />
      <Column field="prod_display" header="제품명" />
      <Column field="ord_name" header="주문명" />
      <Column header="출고요청일자">
        <template #body="{ data }">
          {{ formatDate(data.out_req_date) }}
        </template>
      </Column>
      <Column header="상태">
        <template #body="{ data }">
          <Tag :value="statusMap[data.out_req_stat]?.label || '알수없음'" :severity="statusMap[data.out_req_stat]?.severity || 'info'" rounded />
        </template>
      </Column>
    </DataTable>

    <template #footer>
      <Button label="취소" severity="secondary" @click="close" />
      <Button label="확인" severity="" @click="confirm" />
    </template>
  </Dialog>
</template>
<style scoped>
/* .button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 18px;
}

.button-group :deep(.p-button) {
  width: auto;
  min-width: auto;
  padding: 10px 35px;
} */
</style>
