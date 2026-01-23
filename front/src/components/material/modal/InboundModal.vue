<script setup>
import { ref, watch } from 'vue';
import { useMaterialStore } from '@/stores/material1';

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['update:visible', 'select']);
const store = useMaterialStore();

const activeTab = ref(0); //완제품/자제 구분
const selectedItems = ref([]);
const searchKeyword = ref('');

// 모달 열렸을 때
watch(
  () => props.visible,
  (val) => {
    if (val) {
      // 탭에 따라 데이터 불러오기
      if (activeTab.value === 0) {
        store.fetchPassedQioList(); //자재
      } else {
        store.fetchPassedProductQioList(); // 완제품
      }
      selectedItems.value = [];
      searchKeyword.value = '';
    }
  }
);

// 탭 변경 시
watch(activeTab, (newTab) => {
  if (props.visible) {
    if (newTab === 0) {
      store.fetchPassedQioList(); // 자재
    } else {
      store.fetchPassedProductQioList(); // 완제품
    }
    selectedItems.value = [];
    searchKeyword.value = '';
  }
});

// 현재 탭에 따른 리스트
const currentList = ref([]);

watch(
  () => [activeTab.value, store.passedQioList, store.passedProductQioList],
  () => {
    currentList.value = activeTab.value === 0 ? store.passedQioList : store.passedProductQioList;

    filteredList.value = currentList.value; // 화면 즉시 반영
  },
  { deep: true }
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
    filteredList.value = currentList.value;
  } else {
    const keyword = searchKeyword.value.toLowerCase();

    if (activeTab.value === 0) {
      // 자재 검색
      filteredList.value = currentList.value.filter((item) => item.qio_code?.toLowerCase().includes(keyword) || item.mat_code?.toLowerCase().includes(keyword) || item.mat_name?.toLowerCase().includes(keyword));
    } else {
      // 완제품 검색
      filteredList.value = currentList.value.filter((item) => item.qio_code?.toLowerCase().includes(keyword) || item.prod_code?.toLowerCase().includes(keyword) || item.prod_name?.toLowerCase().includes(keyword));
    }
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
  // 자재/완제품 구분 정보 추가
  const itemsWithType = selectedItems.value.map((item) => ({
    ...item,
    itemType: activeTab.value === 0 ? 'material' : 'product'
  }));
  emit('select', itemsWithType);
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
    <!-- 탭 메뉴 -->
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="0">자재 입고</Tab>
        <Tab value="1">완제품 입고</Tab>
      </TabList>

      <TabPanels>
        <!-- 자재 입고 탭 -->
        <TabPanel value="0">
          <div class="mb-3 flex gap-2">
            <InputText v-model="searchKeyword" placeholder="검사코드, 자재코드, 자재명으로 검색" class="flex-1" @keyup.enter="handleSearch" />
            <Button label="검색" @click="handleSearch" />
          </div>

          <DataTable :value="filteredList" v-model:selection="selectedItems" selectionMode="multiple" dataKey="qio_code" scrollable scrollHeight="400px">
            <template #empty><p class="text-center py-4 text-gray-400">검색 결과가 없습니다.</p></template>
            <Column selectionMode="multiple" style="width: 50px" />
            <Column field="qir_code" sortable header="지시코드" style="width: 140px" />
            <Column field="mat_code" sortable header="자재코드" style="width: 120px" />
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
        </TabPanel>

        <!-- 완제품 입고 탭 -->
        <TabPanel value="1">
          <div class="mb-3 flex gap-2">
            <InputText v-model="searchKeyword" placeholder="검사코드, 제품코드, 제품명으로 검색" class="flex-1" @keyup.enter="handleSearch" />
            <Button label="검색" @click="handleSearch" />
          </div>

          <DataTable :value="filteredList" v-model:selection="selectedItems" selectionMode="multiple" dataKey="qio_code" scrollable scrollHeight="400px">
            <template #empty><p class="text-center py-4 text-gray-400">검색 결과가 없습니다.</p></template>
            <Column selectionMode="multiple" style="width: 50px" />
            <Column field="qio_code" sortable header="지시코드" style="width: 140px" />
            <Column field="prod_code" sortable header="제품코드" style="width: 120px" />
            <Column field="prod_name" header="제품명" style="min-width: 150px" />
            <Column header="분류" style="width: 80px">
              <template #body="{ data }">
                {{ data.product_type_code === 'p1' ? '완제품' : '반제품' }}
              </template>
            </Column>
            <Column header="단위" style="width: 70px">
              <template #body="{ data }">
                {{ getUnitName(data.unit) }}
              </template>
            </Column>
            <Column field="pass_qtt" header="합격수량" style="width: 90px" />
            <Column field="emp_name" header="검사자" style="width: 100px" />
          </DataTable>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <template #footer>
      <Button label="취소" severity="secondary" @click="close" />
      <Button label="선택" severity="success" @click="confirm" />
    </template>
  </Dialog>
</template>
