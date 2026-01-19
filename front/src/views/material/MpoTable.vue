<!--발주 관리-->
<script setup>
import { ref } from 'vue';
import { useMaterialStore } from '@/stores/material1';
import SelectMrpModal from '@/components/material/modal/SelectMrpModal.vue';

const mpoStore = useMaterialStore();
const showMrpModal = ref(false);

// mpr 선택 시
const handleSelectMpr = async (mpr) => {
  await mpoStore.fetchMrpMaterials(mpr.mpr_code);
};
</script>

<template>
  <div>
    <!-- 상단 버튼 -->
    <div class="flex justify-end gap-2 mb-4">
      <Button label="저장" severity="info" />
      <Button label="초기화" severity="secondary" />
      <Button label="삭제" severity="danger" />
      <Button label="발주정보 불러오기" severity="success" />
    </div>

    <!-- 발주 기본정보 -->
    <div class="card">
      <div class="font-semibold text-xl mb-4">발주 기본정보</div>

      <table class="w-full">
        <colgroup>
          <col class="w-25" />
          <col class="w-auto" />
          <col class="w-25" />
          <col class="w-auto" />
        </colgroup>
        <tbody>
          <tr>
            <th>발주서번호</th>
            <td>
              <InputText v-model="mpoStore.mpoData.purchaseCode" disabled placeholder="자동생성" class="w-full" />
            </td>
            <th>발주제안일</th>
            <td>
              <DatePicker v-model="mpoStore.mpoData.purchaseReqDate" showIcon dateFormat="yy-mm-dd" class="w-full" />
            </td>
            <th>작성자</th>
            <td>
              <InputText v-model="mpoStore.mpoData.mcode" placeholder="작성자 선택" class="w-full" />
            </td>
            <th>발주상태</th>
            <td>
              <InputText v-model="mpoStore.mpoData.stat" disabled class="w-full" />
            </td>
          </tr>
          <tr>
            <th>자재구매요청서번호</th>
            <td>
              <InputText v-model="mpoStore.mpoData.mprCode" disabled class="w-full" />
            </td>
            <th>비고</th>
            <td>
              <InputText v-model="mpoStore.mpoData.note" placeholder="특이사항 입력" class="w-full" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 자재 상세목록 -->
    <div class="card mt-4">
      <div class="flex justify-between items-center mb-4">
        <div class="font-semibold text-xl">자재 상세목록</div>
        <div class="flex gap-2">
          <Button label="자재추가" severity="info" size="small" />
          <Button label="자재삭제" severity="danger" size="small" />
          <Button label="자재구매요청서 불러오기" severity="success" size="small" @click="showMrpModal = true" />
        </div>
      </div>

      <DataTable :value="mpoStore.materials" showGridlines>
        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>

        <Column selectionMode="multiple" style="width: 50px" />
        <Column field="mat_name" header="자재명" style="min-width: 150px" />
        <Column field="material_type_code" header="자재유형" style="min-width: 100px" />
        <Column field="mat_code" header="자재코드" style="min-width: 120px" />
        <Column field="unit" header="단위" style="min-width: 80px" />
        <Column field="req_qtt" header="물품수량" style="min-width: 100px" />
        <Column field="current_stock" header="현재고" style="min-width: 100px" />
        <Column field="shortage_qtt" header="부족수량" style="min-width: 100px" />
        <Column field="lead_time" header="리드타임" style="min-width: 100px" />
        <Column field="delivery_date" header="입고납기일" style="min-width: 120px">
          <template #body="slotProps">
            {{ slotProps.data.delivery_date?.split('T')[0] }}
          </template>
        </Column>
        <Column field="supplier_name" header="공급업체" style="min-width: 120px" />
      </DataTable>
    </div>
    <!-- 모달 -->
    <SelectMrpModal :visible="showMrpModal" @update:visible="showMrpModal = $event" @select="handleSelectMpr" />
  </div>
</template>
<style scoped>
th,
td {
  padding: 8px;
  text-align: left;
}
td {
  padding-right: 20px;
}
</style>
