<script setup>
import { ref, defineProps, watch } from 'vue';
import { useQualityStore } from '@/stores/quality2';

const props = defineProps({
  display: { type: Boolean, required: true },
  qio: { type: Array, required: true }
});

const emit = defineEmits(['update:visible', 'select']);
const store = useQualityStore();

const selectedQio = ref(null);
const keyword = ref('');

// 모달 열렸을 때
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.fetchQiOrderList({ keyword: '' });
      selectedQio.value = null;
      keyword.value = '';
    }
  }
);

// 검색어 변경될 때 서버에 검색
watch(keyword, (val) => {
  store.fetchQiOrderList({ keyword: val });
});

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// 지시서 선택
const confirm = () => {
  if (!selectedQio.value) return;
  emit('select', selectedQio.value);
  close();
};
</script>

<template>
  <Dialog header="지시번호 선택" :visible="visible" modal style="width: 900px" @update:visible="close">
    <div class="mb-3">
      <InputText v-model="keyword" placeholder="지시번호를 입력해주세요" class="w-full" />
    </div>

    <DataTable :value="store.employees" v-model:selection="selectedEmployee" selectionMode="single" dataKey="emp_code" scrollable scrollHeight="400px">
      <Column selectionMode="single" style="width: 3rem" />
      <Column field="qio_code" header="지시번호" />
      <Column field="qio_name" header="지시일자" />
    </DataTable>

    <template #footer>
      <Button label="취소" severity="secondary" @click="close" />
      <Button label="확인" @click="confirm" />
    </template>
  </Dialog>
</template>
