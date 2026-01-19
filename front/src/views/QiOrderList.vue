<script setup>
import { ref } from 'vue';

const startDate = ref(null);
const endDate = ref(null);
</script>

<template>
  <div class="card border border-gray-200 flex flex-col gap-6 p-fluid">
    <div class="text-2xl font-bold text-center">품질 검사 지시 조회</div>

    <!-- 검색 조건 영역 -->
    <div class="grid grid-cols-4 gap-6">
      <!-- 지시코드 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">지시코드</label>
        <InputText v-model="orderCode" placeholder="지시코드 선택" class="w-full" />
      </div>

      <!-- 제품명 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">제품명</label>
        <InputText v-model="productName" placeholder="제품 선택" class="w-full" />
      </div>

      <!-- 시작일 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">지시일자 - 시작일</label>
        <DatePicker v-model="startDate" class="w-full" inputClass="w-full" showIcon showButtonBar appendTo="body" placeholder="시작일" />
      </div>

      <!-- 종료일 -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">지시일자 - 종료일</label>
        <DatePicker v-model="endDate" class="w-full" inputClass="w-full" showIcon showButtonBar appendTo="body" placeholder="종료일" />
      </div>
    </div>

    <!-- 버튼 영역 -->
    <div class="flex gap-4 justify-center mt-2">
      <Button label="전체" severity="warn" />
      <Button label="조회" />
    </div>
  </div>

  <section class="flex-1 bg-white px-6 pt-15 pb-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-s text-gray-800">검색결과 {{}} 건</h2>
    </div>

    <div class="flex-1 overflow-auto rounded-lg border border-gray-200">
      <DataTable :value="filteredUsers" v-model:selection="selectedRows" dataKey="user_no" :paginator="true" :rows="rows" v-model:filters="filters" :globalFilterFields="globalFilterFields" showGridlines @page="onPageChange" :selectionPageOnly="true">
        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>

        <Column selectionMode="multiple" headerStyle="width:48px" />
        <Column header="지시코드" field="name" headerClass="table-header" bodyClass="table-body" />
        <Column header="공정명" field="id" headerClass="table-header" bodyClass="table-body" />
        <Column header="제품명" field="phone" headerClass="table-header" bodyClass="table-body" />
        <Column header="검사예정일" field="email" headerClass="table-header" bodyClass="table-body" />
        <Column header="지시일자" headerClass="table-header" bodyClass="table-body" />
        <Column header="상태" headerClass="table-header" bodyClass="table-body" />
      </DataTable>
    </div>
  </section>
</template>
