<script setup>
import { ref, watch } from 'vue';
import { useMaterialStore } from '@/stores/material1';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const store = useMaterialStore();

const selectedMpr = ref(null);
const searchKeyword = ref('');

// 모달이 열렸는지 확인
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.searchMprList('');
      selectedMpr.value = null;
      searchKeyword.value = '';
    }
  }
);

// 검색
const handleSearch = () => {
  store.searchMprList(searchKeyword.value);
};

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// mpr 선택
const confirm = () => {
  if (!selectedMpr.value) {
    alert('항목을 선택해주세요!');
    return;
  }
  emit('select', selectedMpr.value);
  close();
};
</script>

<template>
  <Dialog :visible="visible" modal style="width: 700px" @update:visible="close">
    <div class="mb-3 flex gap-2">
      <InputText v-model="searchKeyword" placeholder="자재구매요청서번호를 입력해주세요" class="flex-1" @keyup.enter="handleSearch" />
      <Button label="검색" @click="handleSearch" />
    </div>

    <DataTable :value="store.mprList" v-model:selection="selectedMpr" selectionMode="single" dataKey="mpr_code" scrollable scrollHeight="400px">
      <Column selectionMode="single" style="width: 3rem" />
      <Column field="mpr_code" header="요청서 번호" />
      <Column field="reqdate" header="요청일" />
      <Column field="mcode" header="요청자" />
      <Column field="material_names" header="자재명" />
    </DataTable>

    <template #footer>
      <Button label="취소" severity="secondary" @click="close" />
      <Button label="선택" @click="confirm" />
    </template>
  </Dialog>
</template>
