<script setup>
import { useOrderStore2 } from '@/stores/order2';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  visible: Boolean,
  productInfo: Object // { prod_code, prod_name, max_amount }
});

const emit = defineEmits(['update:visible', 'confirm']);
const store = useOrderStore2();

const lotList = ref([]);
const loading = ref(false);

watch(
  () => props.visible,
  async (val) => {
    if (val && props.productInfo?.prod_code) {
      loading.value = true;
      try {
        const lots = await store.fetchLotsByProdCode(props.productInfo.prod_code);
        lotList.value = lots.map((lot) => ({
          ...lot,
          lot_stock: Number(lot.lot_stock),
          out_amount: 0
        }));
      } catch (error) {
        console.error('로트 조회 실패: ', error);
      } finally {
        loading.value = false;
      }
    }
  }
);

const totalOutAmount = computed(() => {
  return lotList.value.reduce((sum, lot) => sum + (lot.out_amount || 0), 0);
});

const close = () => {
  emit('update:visible', false);
  lotList.value = [];
};

const confirm = () => {
  if (totalOutAmount.value === 0) {
    alert('출고수량을 입력해주세요.');
    return;
  }

  if (totalOutAmount.value > props.productInfo.max_amount) {
    alert(`출고요청수량(${props.productInfo.max_amount})을 초과했습니다.`);
    return;
  }

  const selectedLots = lotList.value
    .filter((lot) => lot.out_amount > 0)
    .map((lot) => ({
      lot_num: lot.lot_num,
      out_qtt: lot.out_amount
    }));

  emit('confirm', {
    total_amount: totalOutAmount.value,
    lots: selectedLots
  });

  close();
};

// 수정된 부분: 로트 재고수량과 출고요청수량 모두 체크
const handleLotAmountInput = (lot, value) => {
  const currentLotAmount = Number(value) || 0;

  // 1. 로트 재고수량 초과 체크
  if (currentLotAmount > lot.lot_stock) {
    lot.out_amount = lot.lot_stock;
    return;
  }

  // 2. 음수 체크
  if (currentLotAmount < 0) {
    lot.out_amount = 0;
    return;
  }

  // 3. 출고요청수량 초과 체크
  const otherLotsTotal = lotList.value.filter((l) => l.lot_num !== lot.lot_num).reduce((sum, l) => sum + (l.out_amount || 0), 0);

  const maxAllowedForThisLot = props.productInfo.max_amount - otherLotsTotal;

  if (currentLotAmount > maxAllowedForThisLot) {
    lot.out_amount = Math.max(0, maxAllowedForThisLot);
    alert(`출고요청수량(${props.productInfo.max_amount})을 초과할 수 없습니다.`);
    return;
  }

  lot.out_amount = currentLotAmount;
};

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
  <Dialog header="출고 수량 선택" :visible="visible" modal style="width: 700px" @update:visible="close">
    <!-- 제품 정보 -->
    <div class="product-info">
      <div class="grid grid-cols-2 gap-2">
        <div><strong>제품코드:</strong> {{ productInfo?.prod_code }}</div>
        <div><strong>제품명:</strong> {{ productInfo?.prod_name }}</div>
        <div><strong>출고요청수량:</strong> {{ productInfo?.max_amount }}</div>
        <div>
          <strong>현재 선택:</strong>
          <span :class="totalOutAmount > productInfo?.max_amount ? 'text-red-500' : 'text-blue-500'">
            {{ totalOutAmount }}
          </span>
        </div>
      </div>
    </div>

    <!-- 로트 목록 -->
    <DataTable :value="lotList" :loading="loading" showGridlines class="p-datatable-sm" scrollable scrollHeight="300px">
      <template #empty>
        <div class="text-center py-6 text-gray-400">재고가 없습니다.</div>
      </template>
      <Column field="lot_num" header="LOT 번호" style="width: 200px" />
      <Column header="입고일" style="width: 120px">
        <template #body="{ data }">
          {{ formatDate(data.pinbnd_date) }}
        </template>
      </Column>
      <Column field="lot_stock" header="재고수량" style="width: 100px" />
      <Column header="출고수량" style="width: 150px">
        <template #body="{ data }">
          <InputNumber v-model="data.out_amount" :min="0" :max="data.lot_stock" @update:modelValue="handleLotAmountInput(data, $event)" class="w-full" />
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
.product-info {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
}
</style>
