<script setup>
import { ref, watch } from 'vue';
import { useMaterialStore } from '@/stores/material1';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'add']);
const store = useMaterialStore();
const selectedMat = ref(null);
const calcShortage = (row) => {
  row.shortage_qtt = Math.max(0, row.req_qtt - Number(row.current_stock));
};
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

// 모달이 열렸는지 확인
watch(
  () => props.visible,
  (val) => {
    if (val) {
      store.fetchMatList();
      console.log('matList:', store.matList);

      selectedMat.value = null;
    }
  }
);

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// mpr 선택
const confirm = () => {
  if (!selectedMat.value) {
    alert('자재를 선택해주세요!');
    return;
  }
  emit('add', {
    mat_code: selectedMat.value.mat_code,
    mat_name: selectedMat.value.mat_name,
    unit: selectedMat.value.unit,
    material_type_code: selectedMat.value.material_type_code,
    supplier_name: selectedMat.value.supplier_name,
    client_code: selectedMat.value.client_code,
    current_stock: selectedMat.value.current_stock,
    req_qtt: 0,
    delivery_date: new Date().toISOString().slice(0, 10),
    selected: true
  });
  close();
};
</script>

<template>
  <Dialog :visible="visible" modal style="width: 700px" @update:visible="close">
    <DataTable :value="store.matList" v-model:selection="selectedMat" selectionMode="single" dataKey="mat_code" scrollable scrollHeight="400px">
      <Column selectionMode="single" style="width: 3rem" />
      <Column field="mat_code" header="자재코드" />
      <Column field="mat_name" header="자재명" />
      <Column field="material_type_code" header="자재유형">
        <template #body="{ data }">
          <span v-if="data.material_type_code === 't1'">원자재</span>
          <span v-else-if="data.material_type_code === 't2'">부자재</span>
        </template>
      </Column>
      <Column field="unit" header="단위">
        <template #body="{ data }">
          {{ getUnitName(data.unit) }}
        </template>
      </Column>
      <Column field="supplier_name" header="공급업체" />
    </DataTable>

    <template #footer>
      <Button label="취소" severity="secondary" @click="close" />
      <Button label="추가" @click="confirm" />
    </template>
  </Dialog>
</template>
