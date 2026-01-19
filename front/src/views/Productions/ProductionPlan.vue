<script setup></script>
<template>
  <Fluid class="card">
    <div class="font-semibold text-xl pb-4">생산계획</div>
    <table class="w-full">
      <colgroup>
        <col class="w-25" />
        <col class="w-auto" />
        <col class="w-25" />
        <col class="w-auto" />
      </colgroup>
      <tbody>
        <tr>
          <th>생산계획코드</th>
          <td><InputText placeholder="생산계획코드" disabled></InputText></td>
          <th>계획명</th>
          <td><InputText></InputText></td>
        </tr>
        <tr>
          <th>계획일자</th>
          <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue" disabled></DatePicker></td>
          <th>작성자</th>
          <td><InputText disabled></InputText></td>
        </tr>
        <tr>
          <th>계획시작일</th>
          <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue" placeholder="날짜 선택"></DatePicker></td>
          <th>계획종료일</th>
          <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue" placeholder="날짜 선택"></DatePicker></td>
        </tr>
        <tr>
          <th>주문코드</th>
          <td><InputText placeholder="검색" class="w-full"></InputText></td>
          <th>납기일자</th>
          <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue" placeholder="날짜 선택"></DatePicker></td>
        </tr>
        <tr>
          <th>비고</th>
          <td><InputText placeholder="특이사항 입력" class="w-full"></InputText></td>
          <th></th>
          <td></td>
        </tr>
      </tbody>
    </table>
  </Fluid>
  <Fluid class="card">
    <div class="font-semibold text-xl pb-4">제품</div>
    <DataTable showGridlines>
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>
      <Column selectionMode="multiple" style="width: 5px" />
      <Column header="제품코드" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="제품명" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="제품유형" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="단위" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="규격" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="목표수량" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="우선순위" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="생산라인" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
    </DataTable>
  </Fluid>
</template>

<style>
th,
td {
  padding: 4px;
  text-align: left;
}
td {
  padding-right: 20px;
}
</style>
