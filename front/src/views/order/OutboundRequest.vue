<script setup>
const user = JSON.parse(localStorage.getItem('user'));
</script>
<template>
  <Fluid class="card">
    <!-- 헤더 -->
    <div class="header-section">
      <div class="text-2xl font-semibold">출고 요청</div>
      <div class="button-group">
        <Button label="저장" severity="info" />
        <Button label="삭제" severity="danger" />
        <Button label="초기화" severity="contrast" />
        <Button label="주문정보 불러오기" />
        <Button label="출고요청 불러오기" />
      </div>
    </div>
    <!-- 주문정보/출고요청 선택 -->
    <table class="w-full">
      <colgroup>
        <col style="width: 100px" />
        <col />
        <col style="width: 140px" />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <th>출고코드</th>
          <td><InputText class="w-full" disabled /></td>

          <th>주문코드</th>
          <td><InputText class="w-full" disabled /></td>
        </tr>
        <tr>
          <th>출고요청일</th>
          <td><InputText class="w-full" disabled /></td>

          <th>주문일자</th>
          <td><InputText class="w-full" disabled /></td>
        </tr>
        <tr>
          <th>거래처</th>
          <td><InputText class="w-full" disabled /></td>

          <th>출고 요청 담당자</th>
          <td><InputText class="w-full" disabled v-model="user.emp_name" /></td>
        </tr>
      </tbody>
    </table>
  </Fluid>

  <!-- 주문정보/출고요청 상세 -->
  <Fluid class="card min-h-[500px]">
    <div class="border-b pb-2 mb-4">
      <h4 class="font-semibold">요청 자재 상세</h4>
    </div>

    <DataTable :value="store.mprItems" showGridlines class="p-datatable-sm" tableStyle="table-layout: fixed; width: 100%;" :paginator="true" :rows="10">
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>

      <Column header="제품명" field="mat_name" headerStyle="width: 280px; padding: 8px 20px;" bodyStyle="padding: 8px 20px;" />

      <Column header="자재코드" field="mat_code" headerStyle="width: 200px;" bodyStyle="white-space: nowrap;" />

      <Column header="수량" field="req_qtt" headerStyle="width: 150px" />

      <Column header="단위" field="unit_label" headerStyle="width: 150px" />

      <Column header="공급업체" field="client_name" headerStyle="width: 200px;" />

      <Column header="비고" headerStyle="width: auto;">
        <template #body="{ data }">
          {{ data.note ? data.note : '-' }}
        </template>
      </Column>
    </DataTable>
  </Fluid>
</template>
<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

th,
td {
  padding: 8px 0;
  vertical-align: middle;
}

.button-group {
  display: flex;
  gap: 6px;
}

.button-group :deep(.p-button) {
  width: auto;
  min-width: auto;
  padding: 7px 15px;
}
</style>
