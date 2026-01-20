<script setup>
import { ref, watch } from 'vue';
import { useMaterialStore } from '@/stores/material2';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const store = useMaterialStore();

const selectedMaterial = ref(null);
const keyword = ref(''); // 검색 입력값

// 모달 열렸을 때
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.fetchMaterials({ keyword: '' });
      selectedMaterial.value = null;
      keyword.value = '';
    }
  }
);

// 검색어 변경될 때 서버에 검색
watch(keyword, (val) => {
  store.fetchMaterials({ keyword: val });
});

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// 자재 선택
const confirm = () => {
  if (!selectedMaterial.value) {
    alert('자재를 선택해주세요.');
    return;
  }
  emit('select', selectedMaterial.value);
  close();
};
</script>

<template>
  <Dialog header="자재 선택" :visible="visible" modal style="width: 900px" @update:visible="close">
    <div class="mb-3">
      <InputText v-model="keyword" placeholder="자재명을 입력해주세요" class="w-full" />
    </div>

    <DataTable :value="store.materials" v-model:selection="selectedMaterial" selectionMode="single" dataKey="mat_code" scrollable scrollHeight="400px">
      <template #empty><p class="text-center">검색 결과가 없습니다.</p></template>
      <Column selectionMode="single" style="width: 3rem" />
      <Column field="mat_code" header="자재코드" />
      <Column field="mat_name" header="자재명" />
      <Column field="current_qty" header="현재고" />
      <Column field="lack_qty" header="부족수량" />
      <Column field="client_name" header="공급업체" />
    </DataTable>

    <template #footer>
      <Button label="취소" severity="secondary" @click="close" />
      <Button label="확인" @click="confirm" />
    </template>
  </Dialog>
</template>
