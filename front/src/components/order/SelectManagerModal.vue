<!-- src/components/order/SelectManagerModal.vue -->
<script setup>
import { ref, watch } from 'vue';
import { useOrderStore2 } from '@/stores/order2';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const store = useOrderStore2();

const selectedEmployee = ref(null);
const keyword = ref(''); // 검색 입력값

// 모달 열렸을 때
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.fetchEmployees({ keyword: '' });
      selectedEmployee.value = null;
      keyword.value = '';
    }
  }
);

// 검색어 변경될 때
watch(keyword, (val) => {
  store.fetchEmployees({ keyword: val });
});

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// 출고 담당자 선택
const confirm = () => {
  if (!selectedEmployee.value) return;
  emit('select', selectedEmployee.value);
  // console.log(selectedEmployee.value);
  close();
};
</script>

<template>
  <Dialog header="출고 담당자 선택" :visible="visible" modal style="width: 900px" @update:visible="close">
    <div class="mb-3">
      <InputText v-model="keyword" placeholder="사번 또는 사원명을 입력해주세요" class="w-full" />
    </div>

    <DataTable :value="store.employees" v-model:selection="selectedEmployee" selectionMode="single" dataKey="emp_code" scrollable scrollHeight="400px">
      <Column selectionMode="single" style="width: 6rem" />
      <Column />
      <Column field="emp_code" header="사원번호" />
      <Column />
      <Column field="emp_name" header="사원명" />
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
