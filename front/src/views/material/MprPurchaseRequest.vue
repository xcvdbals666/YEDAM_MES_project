<script setup>
import { ref } from 'vue';
import MprRequestHeader from '@/components/material/MprRequestHeader.vue';
import MprRequestItem from '@/components/material/MprRequestItem.vue';
import SelectEmployeeModal from '@/components/material/modal/SelectEmployeeModal.vue';

const headerData = ref({
  mprCode: 'PRQ0007',
  writer: '',
  empCode: '',
  department: '',
  deadline: null,
  reqDate: '2025-12-09'
});

const items = ref([]);
const showWriterModal = ref(false);

const selectWriter = (emp) => {
  headerData.value.empCode = emp.emp_code;
  headerData.value.writer = emp.emp_name;
  headerData.value.department = emp.dept_name;
};

const save = () => {
  console.log('header', headerData.value);
  console.log('items', items.value);
};
</script>

<template>
  <div class="card">
    <MprRequestHeader v-model="headerData" @select-employee="showWriterModal = true" @save="save" />
    <MprRequestItem v-model="items" class="mt-4" />
  </div>
  <SelectEmployeeModal v-model:visible="showWriterModal" @select="selectWriter" />
</template>
