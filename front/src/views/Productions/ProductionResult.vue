<script setup></script>
<template>
  <Fluid class="card">
    <table class="w-full">
      <colgroup>
        <col class="w-25" />
        <col class="w-auto" />
        <col class="w-25" />
        <col class="w-auto" />
        <col class="w-25" />
        <col class="w-auto" />
      </colgroup>
      <tbody>
        <tr>
          <th>생산실적코드</th>
          <td><InputText></InputText></td>
          <th>제품명</th>
          <td><InputText></InputText></td>
          <th>작업지시코드</th>
          <td><InputText></InputText></td>
        </tr>
        <tr>
          <th>시작일자</th>
          <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue" placeholder="날짜 선택"></DatePicker></td>
          <th>종료일자</th>
          <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue" placeholder="날짜 선택"></DatePicker></td>
          <th></th>
          <td></td>
        </tr>
      </tbody>
    </table>
  </Fluid>
  <Fluid class="card">
    <div class="font-semibold text-xl pb-4">생산실적조회</div>
    <DataTable showGridlines>
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>
      <Column header="생산실적코드" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="작업지시코드" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="제품코드" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="제품명" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="시작일시" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="종료일시" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="소요시간" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="생산수량(개)" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="달성률(%)" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
    </DataTable>
  </Fluid>
</template>
