<!-- src/components/order/SelectVendorModal.vue -->
<script setup>
import { ref, watch } from 'vue';
import { useOrderStore2 } from '@/stores/order2';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const store = useOrderStore2();

const selectedVendor = ref(null);
const keyword = ref(''); // 검색 입력값

// 모달 열렸을 때
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.fetchOutClient({ keyword: '' });
      selectedVendor.value = null;
      keyword.value = '';
    }
  }
);

// 검색어 변경될 때
watch(keyword, (val) => {
  store.fetchOutClient({ keyword: val });
});

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// 거래처 선택
const confirm = () => {
  if (!selectedVendor.value) return;
  emit('select', selectedVendor.value);
  // console.log(selectedVendor.value);
  close();
};
</script>

<template>
  <Dialog header="거래처 선택" :visible="visible" modal style="width: 900px" @update:visible="close">
    <div class="mb-3">
      <InputText v-model="keyword" placeholder="거래처코드 또는 거래처명을 입력해주세요" class="w-full" />
    </div>

    <DataTable :value="store.outboundClient" v-model:selection="selectedVendor" selectionMode="single" dataKey="client_code" scrollable scrollHeight="400px">
      <Column selectionMode="single" style="width: 6rem" />
      <Column />
      <Column field="client_code" header="거래처코드" />
      <Column />
      <Column field="client_name" header="거래처명" />
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
