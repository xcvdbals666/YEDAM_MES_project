<!-- src/components/order/SelectOutModal.vue -->
<script setup>
import { ref, watch, computed } from 'vue';
import { useOrderStore2 } from '@/stores/order2';

const store = useOrderStore2();
const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const selectedOutCode = ref(null);
const keyword = ref(''); // 검색 입력값

// 출고 상태 변환
const statusMap = {
  r1: { label: '출고 대기', severity: 'danger' },
  r2: { label: '부분 출고', severity: 'warn' },
  r3: { label: '출고 완료', severity: 'success' },
  r4: { label: '요청 취소', severity: 'secondary' }
};

// 모달 열렸을 때
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.fetctOutCode({ keyword: '' });
      selectedOutCode.value = null;
      keyword.value = '';
    }
  }
);

// 검색어 변경될 때
watch(keyword, (val) => {
  store.fetctOutCode({ keyword: val });
});

// 그룹화
const groupedOutboundCode = computed(() => {
  const grouped = {};

  store.outboundCode.forEach((item) => {
    if (!grouped[item.out_req_code]) {
      grouped[item.out_req_code] = {
        out_req_code: item.out_req_code,
        out_req_date: item.out_req_date,
        ord_code: item.ord_code,
        client_name: item.client_name,
        ord_amount: item.ord_amount,
        out_req_stat: item.out_req_stat
      };
    }
  });

  return Object.values(grouped);
});

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// 출고 코드 선택
const confirm = () => {
  if (!selectedOutCode.value) return;
  emit('select', selectedOutCode.value);
  // console.log(selectedOutCode.value);
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
  <Dialog header="출고요청 코드 선택" :visible="visible" modal style="width: 900px" @update:visible="close">
    <div class="mb-3">
      <InputText v-model="keyword" placeholder="출고요청코드 / 주문코드 / 거래처를 입력해주세요" class="w-full" />
    </div>

    <DataTable :value="groupedOutboundCode" v-model:selection="selectedOutCode" selectionMode="single" dataKey="out_req_code" scrollable scrollHeight="400px">
      <Column selectionMode="single" style="width: 3rem" />
      <Column field="out_req_code" header="출고요청 코드" />
      <Column header="출고요청 일자">
        <template #body="{ data }">
          {{ formatDate(data.out_req_date) }}
        </template>
      </Column>
      <Column field="ord_code" header="주문번호" />
      <Column field="client_name" header="거래처" />
      <Column field="ord_amount" header="주문수량" />
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
