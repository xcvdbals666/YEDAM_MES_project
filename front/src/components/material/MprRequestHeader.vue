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
</script>

<template>
  <div class="card">
    <div class="flex justify-between align-items-center mb-3">
      <h4 class="m-0">자재 구매 요청</h4>

      <div class="flex justify-end gap-2 mt-4">
        <Button label="초기화" severity="secondary" />
        <Button label="저장" @click="emit('save')" />
      </div>
    </div>

    <div class="formgrid grid">
      <div class="field col-6">
        <label>요청번호</label>
        <InputText v-model="data.mprCode" readonly />
      </div>

      <div class="field col-6">
        <label>작성자</label>
        <InputText v-model="data.writer" readonly placeholder="작성자 선택" @click="emit('selectEmployee')" />
      </div>

      <div class="field col-6">
        <label>요청부서</label>
        <InputText v-model="data.department" />
      </div>

      <div class="field col-6">
        <label>납기일자</label>
        <DatePicker v-model="data.deadline" showIcon dateFormat="yy-mm-dd" />
      </div>

      <div class="field col-6">
        <label>등록일자</label>
        <InputText v-model="data.reqDate" readonly />
      </div>
    </div>
  </div>
</template>
