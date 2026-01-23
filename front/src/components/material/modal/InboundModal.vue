<script setup>
import { ref, watch } from 'vue';
import { useMaterialStore } from '@/stores/material1';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const store = useMaterialStore();

const selectedItems = ref([]);
const searchKeyword = ref('');

// 모달 열렸을 때
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.fetchPassedQirList();
      selectedItems.value = [];
      searchKeyword.value = '';
    }
  }
);

// 검색 (프론트 필터링)
const filteredList = ref([]);
watch(
  () => store.passedQirList,
  (list) => {
    filteredList.value = list;
  }
);

const handleSearch = () => {
  if (!searchKeyword.value) {
    filteredList.value = store.passedQirList;
  } else {
    const keyword = searchKeyword.value.toLowerCase();
    filteredList.value = store.passedQirList.filter((item) => item.qir_code?.toLowerCase().includes(keyword) || item.mat_code?.toLowerCase().includes(keyword) || item.mat_name?.toLowerCase().includes(keyword));
  }
};

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// 선택 확인
const confirm = () => {
  if (selectedItems.value.length === 0) {
    alert('항목을 선택해주세요.');
    return;
  }
  emit('select', selectedItems.value);
  close();
};

// 단위 변환
const unitMap = {
  h1: 'kg',
  h2: 't',
  h3: 'L',
  h4: 'ea',
  h5: 'box',
  h6: 'g',
  h7: 'mm',
  h8: '%',
  h9: 'cm',
  ha: 'N'
};
const getUnitName = (code) => unitMap[code] || code;
</script>

<template>
  <Dialog header="품질검사 합격 목록" :visible="visible" modal style="width: 900px" @update:visible="close">
    <div class="mb-3 flex gap-2">
      <InputText v-model="searchKeyword" placeholder="검사코드, 자재코드, 자재명으로 검색" class="flex-1" @keyup.enter="handleSearch" />
      <Button label="검색" @click="handleSearch" />
    </div>

    <DataTable :value="filteredList" v-model:selection="selectedItems" selectionMode="multiple" dataKey="qir_code" scrollable scrollHeight="400px">
      <template #empty><p class="text-center py-4 text-gray-400">검색 결과가 없습니다.</p></template>
      <Column selectionMode="multiple" style="width: 50px" />
      <Column field="qir_code" header="검사코드" style="width: 140px" />
      <Column field="mat_code" header="자재코드" style="width: 100px" />
      <Column field="mat_name" header="자재명" style="min-width: 150px" />
      <Column header="분류" style="width: 80px">
        <template #body="{ data }">
          {{ data.material_type_code === 't1' ? '원자재' : '부자재' }}
        </template>
      </Column>
      <Column header="단위" style="width: 70px">
        <template #body="{ data }">
          {{ getUnitName(data.unit) }}
        </template>
      </Column>
      <Column field="client_name" header="공급업체" style="width: 120px" />
      <Column field="pass_qtt" header="합격수량" style="width: 90px" />
      <Column field="emp_name" header="검사자" style="width: 100px" />
    </DataTable>

    <template #footer>
      <Button label="취소" severity="secondary" @click="close" />
      <Button label="선택" severity="success" @click="confirm" />
    </template>
  </Dialog>
</template>
