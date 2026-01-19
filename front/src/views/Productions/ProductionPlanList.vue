<script setup></script>
<template>
  <Fluid class="card grid gap-4">
    <div class="font-semibold text-xl">생산계획</div>
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
          <td><InputText placeholder="생산계획코드를 입력하세요"></InputText></td>
          <th>계획명</th>
          <td><InputText placeholder="계획명을 입력하세요"></InputText></td>
        </tr>
        <tr>
          <th>계획일자</th>
          <td>
            <Fluid class="flex gap-2 items-center">
              <div class="flex-1">
                <DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue"></DatePicker>
              </div>
              <span>-</span>
              <div class="flex-1">
                <DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue"></DatePicker>
              </div>
            </Fluid>
          </td>
          <th>납기일자</th>
          <td>
            <Fluid class="flex gap-2 items-center">
              <div class="flex-1">
                <DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue"></DatePicker>
              </div>
              <span>-</span>
              <div class="flex-1">
                <DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue"></DatePicker>
              </div>
            </Fluid>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="justify-items-center">
      <div class="flex gap-2 w-40">
        <Button severity="secondary">초기화</Button>
        <Button>조회</Button>
      </div>
    </div>
  </Fluid>
  <Fluid class="card">
    <div class="font-semibold text-xl pb-4">제품</div>
    <DataTable showGridlines>
      <template #empty>
        <div class="text-center py-6 text-gray-400">데이터 없음</div>
      </template>
      <Column selectionMode="multiple" style="width: 5px" />
      <Column header="생산계획코드" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="계획명" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="계획일자" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="계획시작일" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="계획종료일" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="납기일자" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="작성자" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
      <Column header="비고" headerClass="table-header" bodyClass="table-body" style="width: 120px" />
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
