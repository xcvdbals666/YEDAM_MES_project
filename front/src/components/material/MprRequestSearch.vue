<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue', 'search', 'reset']);

const data = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<template>
  <Fluid class="card">
    <div class="flex justify-between items-center pb-4">
      <h4 class="m-0">요청 검색</h4>
      <div class="flex items-center gap-3">
        <Button icon="pi pi-undo" label="초기화" severity="secondary" class="whitespace-nowrap" @click="emit('reset')" />
        <Button icon="pi pi-search" label="조회" @click="emit('search')" />
      </div>
    </div>

    <table class="w-full">
      <colgroup>
        <col class="w-25" />
        <col class="w-auto" />
        <col class="w-25" />
        <col class="w-auto" />
      </colgroup>

      <tbody>
        <tr>
          <th>요청번호</th>
          <td>
            <InputText v-model="data.mprCode" placeholder="요청번호 입력" class="w-full" />
          </td>

          <th>MRP 계획번호</th>
          <td>
            <InputText v-model="data.mrpCode" placeholder="MRP 계획번호 입력" class="w-full" />
          </td>
        </tr>

        <tr>
          <th>요청일자</th>
          <td>
            <div class="flex gap-2">
              <DatePicker v-model="data.reqDateFrom" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" placeholder="시작일 선택" class="w-full" />
              <DatePicker v-model="data.reqDateTo" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" placeholder="종료일 선택" class="w-full" />
            </div>
          </td>

          <th>납기일자</th>
          <td>
            <div class="flex gap-2">
              <DatePicker v-model="data.deadlineFrom" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" placeholder="시작일 선택" class="w-full" />
              <DatePicker v-model="data.deadlineTo" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" placeholder="종료일 선택" class="w-full" />
            </div>
          </td>
        </tr>

        <tr>
          <th>요청자</th>
          <td>
            <InputText v-model="data.mcode" placeholder="요청자 코드 입력" class="w-full" />
          </td>
          <th></th>
          <td></td>
        </tr>
      </tbody>
    </table>
  </Fluid>
</template>

<style scoped>
th,
td {
  padding: 6px 8px;
  text-align: left;
  vertical-align: middle;
}

th {
  font-weight: 600;
  white-space: nowrap;
}

td {
  padding-right: 20px;
}
</style>
