<!-- src/components/order/SelectOrderModal.vue -->
<script setup>
import { computed, ref, watch } from 'vue';
import { useOrderStore2 } from '@/stores/order2';

const store = useOrderStore2();
const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const selectedOrder = ref(null);
const keyword = ref(''); // 검색 입력값

// 주문 상태 변환
// const statusMap = {
//   q1: { label: '출고 대기', severity: 'warn' },
//   q2: { label: '부분 출고', severity: 'help' },
//   q3: { label: '출고 완료', severity: 'success' }
// };

// 주문 단위로 그룹화
const groupedOrders = computed(() => {
  const grouped = {};

  store.orderCode.forEach((order) => {
    // q3(출고 완료) 상태인 주문은 제외
    if (order.ord_stat === 'q3') {
      return;
    }

    // 새로운 주문 객체 생성
    if (!grouped[order.ord_code]) {
      grouped[order.ord_code] = {
        ord_code: order.ord_code,
        ord_date: order.ord_date,
        ord_name: order.ord_name,
        ord_stat: order.ord_stat,
        products: []
      };
    }

    grouped[order.ord_code].products.push(order.prod_name);
  });
  return Object.values(grouped).map((order) => ({
    ...order,
    prod_display: order.products.length > 1 ? `${order.products[0]} 외 ${order.products.length - 1}건` : order.products[0]
  }));
});

// 모달 열렸을 때
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.fetchOrdCode({ keyword: '' });
      selectedOrder.value = null;
      keyword.value = '';
    }
  }
);

// 검색어 변경될 때
watch(keyword, (val) => {
  store.fetchOrdCode({ keyword: val });
});

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// 주문 코드 선택
const confirm = () => {
  if (!selectedOrder.value) return;
  emit('select', selectedOrder.value);
  // console.log(selectedOrder.value);
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
  <Dialog header="주문 선택" :visible="visible" modal style="width: 900px" @update:visible="close">
    <div class="mb-3">
      <InputText v-model="keyword" placeholder="주문코드 또는 주문명을 입력해주세요" class="w-full" />
    </div>

    <DataTable :value="groupedOrders" v-model:selection="selectedOrder" selectionMode="single" dataKey="ord_code" scrollable scrollHeight="400px">
      <Column selectionMode="single" style="width: 3rem" />
      <Column field="ord_code" header="주문코드" />
      <Column field="prod_display" header="제품명" />
      <Column field="ord_name" header="주문명" />
      <Column header="주문일자">
        <template #body="{ data }">
          {{ formatDate(data.ord_date) }}
        </template>
      </Column>
      <!-- <Column header="상태">
        <template #body="{ data }">
          <Tag :value="statusMap[data.ord_stat]?.label || '출고 요청전'" :severity="statusMap[data.ord_stat]?.severity || 'info'" rounded />
        </template>
      </Column> -->
    </DataTable>

    <template #footer>
      <div class="button-group">
        <Button label="취소" severity="contrast" @click="close" />
        <Button label="확인" severity="warn" @click="confirm" />
      </div>
    </template>
  </Dialog>
</template>
<style scoped>
.button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 18px;
}

.button-group :deep(.p-button) {
  width: auto;
  min-width: auto;
  padding: 10px 35px;
}
</style>
