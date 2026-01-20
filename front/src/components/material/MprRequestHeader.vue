<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Object
});
const emit = defineEmits(['update:modelValue', 'selectEmployee', 'save']);

const data = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const handleSave = () => {
  const { writer, department, deadline } = data.value;

  if (!writer || !department || !deadline) {
    alert('작성자, 요청부서, 납기일자는 필수입니다.');
    return;
  }

  emit('save');
};
</script>

<template>
  <Fluid class="card">
    <div class="flex justify-between items-center pb-4">
      <h4 class="m-0">자재 구매 요청</h4>
      <div class="flex items-center gap-2">
        <Button label="저장" @click="handleSave" />
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
              <InputText v-model="data.writer" placeholder="작성자 선택" @click="emit('selectEmployee')" class="flex-1" />
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
            <DatePicker v-model="data.deadline" :showIcon="true" :showButtonBar="true" placeholder="날짜 선택" class="w-full" />
          </td>
        </tr>

        <tr>
          <th>등록일자</th>
          <td>
            <InputText v-model="data.reqDate" readonly />
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
