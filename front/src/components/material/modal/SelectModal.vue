<script setup>
import { ref, watch, computed } from 'vue';
import { useMaterialStore } from '@/stores/material2';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    required: true // 'employee' | 'material' | 'mpr' | 'client'
  }
});

const emit = defineEmits(['update:visible', 'select']);
const store = useMaterialStore();

const selected = ref(null);
const keyword = ref('');

const CONFIG = {
  employee: {
    title: '작성자 선택',
    placeholder: '사번 또는 사원명을 입력해주세요',
    fetch: (keyword) => store.fetchEmployees({ keyword }),
    list: () => store.employees,
    dataKey: 'emp_code',
    columns: [
      { field: 'emp_code', header: '사원번호' },
      { field: 'emp_name', header: '사원명' },
      { field: 'dept_name', header: '부서명' }
    ]
  },

  material: {
    title: '자재 선택',
    placeholder: '자재명을 입력해주세요',
    fetch: (keyword) => store.fetchMaterials({ keyword }),
    list: () => store.materials,
    dataKey: 'mat_code',
    columns: [
      { field: 'mat_code', header: '자재코드' },
      { field: 'mat_name', header: '자재명' },
      { field: 'current_qty', header: '현재고' },
      { field: 'lack_qty', header: '부족수량' },
      { field: 'client_name', header: '공급업체' }
    ]
  },

  mpr: {
    title: '자재구매요청서 선택',
    placeholder: '자재구매요청번호를 입력해주세요',
    fetch: (keyword) => store.fetchMprList({ keyword }),
    list: () => store.mprList,
    dataKey: 'mpr_code',
    columns: [
      { field: 'mpr_code', header: '요청서 번호' },
      { field: 'mpr_code', header: '요청서 번호' },
      { field: 'mpr_code', header: '요청서 번호' },
      { field: 'mpr_code', header: '요청서 번호' }
    ]
  }

  // 필요하면 여기 계속 추가
  // mpr: { ... }
  // client: { ... }
};

const config = computed(() => CONFIG[props.type]);

// 모달 열릴 때 초기화 + 처음 조회
watch(
  () => props.visible,
  (val) => {
    if (val) {
      selected.value = null;
      keyword.value = '';
      config.value.fetch('');
    }
  }
);

// 검색어 변경 시 조회
watch(keyword, (val) => {
  config.value.fetch(val);
});

// 모달 닫기
const close = () => {
  emit('update:visible', false);
};

// 선택 확정
const confirm = () => {
  if (!selected.value) {
    alert('항목을 선택해주세요.');
    return;
  }
  emit('select', selected.value);
  close();
};
</script>

<template>
  <Dialog :header="config.title" :visible="visible" modal style="width: 900px" @update:visible="close">
    <div class="mb-3">
      <InputText v-model="keyword" :placeholder="config.placeholder" class="w-full" />
    </div>

    <DataTable :value="Array.isArray(config.list()) ? config.list() : []" v-model:selection="selected" selectionMode="single" :dataKey="config.dataKey" scrollable scrollHeight="400px">
      <template #empty>
        <p class="text-center">검색 결과가 없습니다.</p>
      </template>

      <Column selectionMode="single" style="width: 3rem" />

      <Column v-for="col in config.columns" :key="col.field" :field="col.field" :header="col.header" />
    </DataTable>

    <template #footer>
      <Button label="취소" severity="secondary" @click="close" />
      <Button label="확인" @click="confirm" />
    </template>
  </Dialog>
</template>
