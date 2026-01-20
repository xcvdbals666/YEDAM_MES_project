<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Object,
  selectedMrpValue: Object,
  mrpFilteredValue: Array
});
const emit = defineEmits(['update:modelValue', 'update:selectedMrpValue', 'selectEmployee', 'save', 'reset', 'search-mrp']);

const data = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<template>
  <Fluid class="card">
    <div class="flex justify-between items-center pb-4">
      <h4 class="m-0">자재 구매 요청</h4>
      <div class="flex items-center gap-2">
        <Button label="초기화" severity="contrast" class="whitespace-nowrap px-3 py-1 h-[35px] text-sm gap-2" @click="emit('reset')" />
        <Button label="저장" @click="emit('save')" class="px-3 py-1 h-[35px] text-sm gap-2" />
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
            <InputText v-model="data.mprCode" readonly />
          </td>

          <th>작성자</th>
          <td>
            <div class="flex gap-2">
              <InputText v-model="data.writer" placeholder="작성자 선택" readonly @click="emit('selectEmployee')" class="flex-1" />
              <!-- <Button icon="pi pi-search" severity="secondary" @click="emit('selectEmployee')" /> -->
            </div>
          </td>
        </tr>

        <tr>
          <th>요청부서</th>
          <td>
            <InputText v-model="data.department" readonly />
          </td>

          <th>납기일자</th>
          <td>
            <DatePicker v-model="data.deadline" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" placeholder="날짜 선택" class="w-full" />
          </td>
        </tr>

        <tr>
          <th>등록일자</th>
          <td>
            <InputText v-model="data.reqDate" readonly />
          </td>
          <th>MRP 계획번호</th>
          <td>
            <AutoComplete
              :modelValue="selectedMrpValue"
              :suggestions="mrpFilteredValue"
              optionLabel="mrp_code"
              placeholder="MRP 계획번호"
              dropdown
              completeOnFocus
              @complete="emit('search-mrp', $event)"
              @update:modelValue="emit('update:selectedMrpValue', $event)"
            />
          </td>
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
