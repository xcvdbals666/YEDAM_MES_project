<!-- src/components/order/SelectEmployeeModal.vue -->
<script setup>
import { ref, watch } from 'vue';
import { useOrderStore2 } from '@/stores/order2';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const store = useOrderStore2();

const selectedProduct = ref(null);
const keyword = ref(''); // 검색 입력값

// 모달 열렸을 때
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.fetchOutProd({ keyword: '' });
      selectedProduct.value = null;
      keyword.value = '';
    }
  }
);

// 검색어 변경될 때
watch(keyword, (val) => {
  store.fetchOutProd({ keyword: val });
});

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// 출고 제품 선택
const confirm = () => {
  if (!selectedProduct.value) return;
  emit('select', selectedProduct.value);
  // console.log(selectedProduct.value);
  close();
};
</script>

<template>
  <Dialog header="출고 제품 선택" :visible="visible" modal style="width: 900px" @update:visible="close">
    <div class="mb-3">
      <InputText v-model="keyword" placeholder="사번 또는 사원명을 입력해주세요" class="w-full" />
    </div>

    <DataTable :value="store.outboundProd" v-model:selection="selectedProduct" selectionMode="single" dataKey="prod_code" scrollable scrollHeight="400px">
      <Column selectionMode="single" style="width: 6rem" />
      <Column />
      <Column field="prod_code" header="제품코드" />
      <Column field="prod_name" header="제품명" />
      <Column header="제품유형">
        <template #body="{ data }">
          {{ data.com_value === 'j1' ? '봉지라면' : '컵라면' }}
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
