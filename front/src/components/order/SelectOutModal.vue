<!-- src/components/order/SelectOutModal.vue -->
<script setup>
import { ref, watch } from 'vue';
import { useOrderStore2 } from '@/stores/order2';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const store = useOrderStore2();

const selectedOutCode = ref(null);
const keyword = ref(''); // 검색 입력값

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
  <Dialog header="출고 번호 선택" :visible="visible" modal style="width: 900px" @update:visible="close">
    <div class="mb-3">
      <InputText v-model="keyword" placeholder="출고번호 / 주문번호 / 거래처를 입력해주세요" class="w-full" />
    </div>

    <DataTable :value="store.outboundCode" v-model:selection="selectedOutCode" selectionMode="single" dataKey="out_req_code" scrollable scrollHeight="400px">
      <Column selectionMode="single" style="width: 3rem" />
      <Column field="out_req_code" header="출고번호" />
      <Column header="출고일자">
        <template #body="{ data }">
          {{ formatDate(data.out_req_date) }}
        </template>
      </Column>
      <Column field="ord_code" header="주문번호" />
      <Column field="client_name" header="거래처" />
      <Column field="ord_amount" header="주문수량" />
      <Column field="out_req_d_amount" header="총 출고수량" />
      <Column header="상태">
        <template #body="{ data }">
          <Tag :value="data.ord_stat === 'a1' ? '출고완료' : '출고 대기'" :severity="data.ord_stat === 'a1' ? 'success' : 'warning'" rounded />
        </template>
      </Column>
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
