<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import MprRequestHeader from '@/components/material/MprRequestHeader.vue';
import MprRequestItem from '@/components/material/MprRequestItem.vue';
import SelectEmployeeModal from '@/components/material/modal/SelectEmployeeModal.vue';

const headerData = ref({
  mprCode: '',
  writer: '',
  empCode: '',
  department: '',
  deadline: null,
  reqDate: new Date().toISOString().slice(0, 10)
});

onMounted(async () => {
  try {
    const response = await axios.get('/material/next-code');
    headerData.value.mprCode = response.data.mprCode;
  } catch (err) {
    console.error('요청번호 조회 실패', err);
  }
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
