<script setup>
import { ref, watch } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useMaterialStore } from '@/stores/material1';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const store = useMaterialStore();

const selectedEmployee = ref(null);

// 검색(프론트)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// 모달이 열렸는지 확인
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.fetchEmployees();
      selectedEmployee.value = null;
      filters.value.global.value = null;
    }
  }
);

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
      <InputText v-model="filters.global.value" placeholder="사번 또는 사원명을 입력해주세요" class="w-full" />
    </div>

    <DataTable :value="store.employees" v-model:selection="selectedEmployee" selectionMode="single" dataKey="emp_code" :filters="filters" :globalFilterFields="['emp_code', 'empName', 'deptName']" scrollable scrollHeight="400px">
      <Column selectionMode="single" style="width: 3rem" />
      <Column field="empCode" header="사원번호" />
      <Column field="empName" header="사원명" />
      <Column field="deptName" header="부서명" />
    </DataTable>

    <template #footer>
      <Button label="취소" severity="secondary" @click="close" />
      <Button label="확인" @click="confirm" />
    </template>
  </Dialog>
</template>
