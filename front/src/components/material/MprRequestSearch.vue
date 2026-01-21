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
      <div class="flex items-center gap-2">
        <Button label="초기화" severity="contrast" class="px-3 py-1 h-[35px] text-sm gap-2 whitespace-nowrap" @click="emit('reset')" />
        <Button label="조회" class="px-3 py-1 h-[35px] text-sm gap-2" @click="emit('search')" />
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
            <InputText v-model="data.mprCode" placeholder="요청서 선택" readonly class="flex-1" />
          </td>

          <th>자재명</th>
          <td>
            <div class="flex gap-2">
              <InputText v-model="data.matName" placeholder="자재 선택" readonly class="flex-1" />
            </div>
          </td>
        </tr>

        <tr>
          <th>자재코드</th>
          <td>
            <InputText v-model="data.matCode" placeholder="자재 선택" readonly class="flex-1" />
          </td>

          <th>요청일자</th>
          <td>
            <DatePicker v-model="data.reqDate" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" placeholder="날짜 선택" class="w-full" />
          </td>
        </tr>

        <tr>
          <th>거래처</th>
          <td>
            <InputText v-model="data.clientCode" placeholder="공급업체 선택" readonly class="flex-1" />
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
