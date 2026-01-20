<script setup>
import { ref, watch } from 'vue';
import { useMaterialStore } from '@/stores/material2';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const store = useMaterialStore();

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

// 검색어 변경될 때 서버에 검색
watch(keyword, (val) => {
  store.fetchEmployees({ keyword: val });
});

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// 작성자 선택
const confirm = () => {
  if (!selectedEmployee.value) return;
  emit('select', selectedEmployee.value);
  close();
};
</script>

<template>
  <Dialog header="작성자 선택" :visible="visible" modal style="width: 900px" @update:visible="close">
    <div class="mb-3">
      <InputText v-model="keyword" placeholder="사번 또는 사원명을 입력해주세요" class="w-full" />
    </div>

    <DataTable :value="store.employees" v-model:selection="selectedEmployee" selectionMode="single" dataKey="emp_code" scrollable scrollHeight="400px">
      <Column selectionMode="single" style="width: 3rem" />
      <Column field="emp_code" header="사원번호" />
      <Column field="emp_name" header="사원명" />
      <Column field="dept_name" header="부서명" />
    </DataTable>

    <template #footer>
      <Button label="취소" severity="secondary" @click="close" />
      <Button label="확인" @click="confirm" />
    </template>
  </Dialog>
</template>
