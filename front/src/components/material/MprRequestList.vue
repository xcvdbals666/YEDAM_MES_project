<template>
  <div class="card mt-10 min-h-[530px]">
    <div class="flex justify-between align-items-center mb-3">
      <h4 class="m-0">요청 자재 목록</h4>

      <div class="flex gap-2">
        <Button icon="pi pi-file-excel" label="엑셀 다운로드" class="px-3 py-1 h-[35px] text-sm gap-2" />
      </div>
    </div>

    <DataTable selectionMode="checkbox" dataKey="__key" tableStyle="table-layout: fixed; width: 100%;" class="p-datatable-sm" scrollable scroll-height="435px">
      <Column selectionMode="multiple" headerStyle="width: 48px; background-color: #f9fafb; padding: 10px;" />

      <Column header="요청번호" headerStyle="width: 140px; background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }"> </template>
      </Column>

      <Column header="자재명" headerStyle="width: 220px; background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }"> </template>
      </Column>

      <Column header="자재코드" headerStyle="width: 110px; background-color: #f9fafb; padding: 10px;" bodyStyle="padding: 0.5rem">
        <template #body="{ data }"> </template>
      </Column>

      <Column header="요청일자" headerStyle="width: 80px; background-color: #f9fafb; padding: 10px;" bodyStyle="padding: 0.5rem">
        <template #body="{ data }"> </template>
      </Column>

      <Column header="요청수량" headerStyle="width: 160px; background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }"> </template>
      </Column>

      <Column header="단위" headerStyle="background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }"> </template>
      </Column>

      <Column header="공급업체" headerStyle="background-color: #f9fafb; padding: 10px;">
        <template #body="{ data }"> </template>
      </Column>
    </DataTable>
  </div>
</template>
