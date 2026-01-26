<script setup>
import { defineProps, ref } from 'vue';
const props = defineProps({
  selectedQcr: { type: Object, default: () => ({}) }
});

let qcrInfo = ref({ qcr_code: '', inspection_item: '', range_top: '', range_bot: '', note: '', unit: '', regdate: '', check_method: '' });
qcrInfo.value = props.selectedQcr;
qcrInfo.value.note = props.selectedQcr.type;

// 선택감지
let insertform = ref(false);
if (qcrInfo.value.qcr_code != '') {
  insertform.value = true;
}

//
</script>
<template>
  <div class="card border border-gray-200 flex flex-col gap-4 p-fluid">
    <div class="flex items-center justify-between mt-2">
      <div class="font-semibold text-xl" v-if="insertform != ''">품질기준정보 수정</div>
      <div class="font-semibold text-xl" v-else>품질기준정보 등록</div>
      <div v-if="insertform" class="flex flex gap-1">
        <Button label="초기화" @click="$emit('resetQcrForm')" severity="contrast" />
        <Button label="저장" @click="$emit('delQcrForm', qcrInfo.qcr_code)" severity="danger" />
      </div>
    </div>
    <div class="flex flex-wrap gap-4 mt-6">
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="name2">제품코드</label>
        <InputText id="name2" type="text" v-model="qcrInfo.qcr_code" disabled />
      </div>
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="inspection_item">제품명</label>
        <InputText id="email2" type="text" v-model="qcrInfo.inspection_item" />
      </div>
    </div>
    <div class="flex flex-wrap gap-4 mt-6">
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="name2">제품유형</label>
        <InputText id="name2" type="text" v-model="qcrInfo.range_top" />
      </div>
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="email2">기준(하한)</label>
        <InputText id="email2" type="text" v-model="qcrInfo.range_bot" />
      </div>
    </div>
    <div class="flex flex-wrap gap-4 mt-6">
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="name2">품목유형</label>
        <Dropdown v-model="qcrInfo.note" :options="['i1', 'i2', 'i3', 'i4']" placeholder="선택" />
      </div>
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="email2">단위</label>
        <InputText id="email2" type="text" v-model="qcrInfo.unit" />
      </div>
    </div>
    <div class="flex flex-wrap gap-4 mt-6">
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="name2">판정방식</label>
        <InputText id="email2" type="text" v-model="qcrInfo.check_method" />
      </div>
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="email2">등록일</label>
        <InputText id="email2" type="text" v-model="qcrInfo.regdate" disabled />
      </div>
    </div>
  </div>
</template>
<style scoped></style>
