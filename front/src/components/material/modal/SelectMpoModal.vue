<script setup>
import { ref, watch } from 'vue';
import { useMaterialStore } from '@/stores/material1';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const store = useMaterialStore();

const selectedMpo = ref(null);
const searchKeyword = ref('');

// 모달 열렸을 때
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.fetchMpoList();
      selectedMpo.value = null;
      searchKeyword.value = '';
    }
  }
);

// 검색
const handleSearch = async () => {
  await store.searchMpoList(searchKeyword.value);
};
// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// 발주서 선택
const confirm = () => {
  if (!selectedMpo.value) {
    alert('발주서를 선택해주세요.');
    return;
  }
  emit('select', selectedMpo.value);
  close();
};
</script>

<template>
  <Dialog header="발주상태" :visible="visible" modal style="width: 700px" @update:visible="close">
    <div class="mb-3 flex gap-2">
      <InputText v-model="searchKeyword" placeholder="발주서번호를 입력해주세요." class="flex-1" @keyup.enter="handleSearch" />
      <Button label="검색" @click="handleSearch" />
    </div>

    <DataTable :value="store.mpoList" v-model:selection="selectedMpo" selectionMode="single" dataKey="purchase_code" scrollable scrollHeight="400px">
      <template #empty><p class="text-center py-4 text-gray-400">검색 결과가 없습니다.</p></template>
      <Column selectionMode="single" header="선택" style="width: 5rem" />
      <Column field="purchase_code" header="발주서 번호" />
      <Column field="purchase_req_date" header="발주제안일" />
      <Column field="material_names" header="자재명" />
    </DataTable>

    <template #footer>
      <Button label="취소" severity="secondary" @click="close" />
      <Button label="확인" severity="warning" @click="confirm" />
    </template>
  </Dialog>
</template>
