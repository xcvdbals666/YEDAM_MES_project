<script setup>
import { useOrderStore2 } from '@/stores/order2';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  visible: Boolean,
  productInfo: Object // { prod_code, prod_name, max_amount }
});

const emit = defineEmits(['update:visible', 'confirm']);
const store = useOrderStore2();

const lotList = ref([]); // 로트 목록
const loading = ref(false);

// 모달 열렸을 때 로트 조회
watch(
  () => props.visible,
  async (val) => {
    if (val && props.productInfo?.prod_code) {
      loading.value = true;
      try {
        const lots = await store.fetchLotsByProdCode(props.productInfo.prod_code);
        // out_amount 필드 추가 (사용자 입력값)
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

// 총 출고수량 계산
const totalOutAmount = computed(() => {
  return lotList.value.reduce((sum, lot) => sum + (lot.out_amount || 0), 0);
});

// 모달 닫기
const close = () => {
  emit('update:visible', false);
  lotList.value = []; // 초기화
};

// 확인 버튼
const confirm = () => {
  // 1. 유효성 검사
  if (totalOutAmount.value === 0) {
    alert('출고수량을 입력해주세요.');
    return;
  }

  if (totalOutAmount.value > props.productInfo.max_amount) {
    alert(`출고 가능 수량(${props.productInfo.max_amount})을 초과했습니다.`);
    return;
  }

  // 2. 출고수량이 있는 로트만 필터링
  const selectedLots = lotList.value
    .filter((lot) => lot.out_amount > 0)
    .map((lot) => ({
      lot_num: lot.lot_num,
      out_qtt: lot.out_amount
    }));

  // 3. 부모에게 전달
  emit('confirm', {
    total_amount: totalOutAmount.value,
    lots: selectedLots
  });

  close();
};

// 로트별 수량 입력 제한
const handleLotAmountInput = (lot, value) => {
  if (value > lot.lot_stock) {
    lot.out_amount = lot.lot_stock;
  } else if (value < 0) {
    lot.out_amount = 0;
  }
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
  <Dialog header="출고 수량 선택" :visible="visible" modal style="width: 700px" @update:visible="close">
    <!-- 제품 정보 -->
    <div class="product-info">
      <div class="grid grid-cols-2 gap-2">
        <div><strong>제품코드:</strong> {{ productInfo?.prod_code }}</div>
        <div><strong>제품명:</strong> {{ productInfo?.prod_name }}</div>
        <div><strong>출고 가능 수량:</strong> {{ productInfo?.max_amount }}</div>
        <div>
          <strong>현재 선택:</strong> <span :class="totalOutAmount > productInfo?.max_amount ? 'text-red-500' : 'text-blue-500'">{{ totalOutAmount }}</span>
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
/* 
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
} */
</style>
