<script setup>
import { defineProps, ref } from 'vue';
const props = defineProps({
  selectedQcr: { type: Object, default: () => ({}) }
});

let qcrInfo = ref({ qcr_code: '', inspection_item: '', range_top: '', range_bot: '', note: '', unit: '' });
qcrInfo.value = props.selectedQcr;

// 선택감지
let insertform = ref(false);
if (qcrInfo.value.qcr_code != '') {
  insertform.value = true;
}
</script>
<template>
  <div class="card border border-gray-200 flex flex-col gap-4 p-fluid">
    <div class="flex items-center justify-between mt-2">
      <div class="font-semibold text-xl" v-if="qcrInfo.qcr_code != ''">품질기준정보 수정</div>
      <div class="font-semibold text-xl" v-else>품질기준정보 등록</div>
      <div v-if="qcrInfo.qcr_code != ''" class="flex flex gap-1">
        <Button label="수정" severity="success" />
        <Button label="삭제" severity="danger" />
      </div>

      <Button label="등록" severity="success" v-else />
    </div>
    <div class="flex flex-wrap gap-4">
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="name2">품질기준코드</label>
        <InputText id="name2" type="text" :value="qcrInfo.qcr_code" :readonly="insertform" />
      </div>
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="email2">검사항목</label>
        <InputText id="email2" type="text" :value="qcrInfo.inspection_item" :readonly="insertform" />
      </div>
    </div>
    <div class="flex flex-wrap gap-4">
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="name2">기준(상한)</label>
        <InputText id="name2" type="text" :value="qcrInfo.range_top" :readonly="insertform" />
      </div>
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="email2">기준(하한)</label>
        <InputText id="email2" type="text" :value="qcrInfo.range_bot" :readonly="insertform" />
      </div>
    </div>
    <div class="flex flex-wrap gap-4">
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="name2">품목유형</label>
        <InputText id="name2" type="text" :value="qcrInfo.note" :readonly="insertform" />
      </div>
      <div class="flex flex-col grow basis-0 gap-2">
        <label for="email2">단위</label>
        <InputText id="email2" type="text" :value="qcrInfo.unit" :readonly="insertform" />
      </div>
    </div>
  </div>
</template>
<style scoped></style>
