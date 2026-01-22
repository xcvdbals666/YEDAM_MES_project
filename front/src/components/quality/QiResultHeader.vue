<script setup>
import { defineProps } from 'vue';
const props = defineProps({
  qualityState: { type: Number, required: true }
});
</script>
<template>
  <div class="flex">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <h4>기본 정보</h4>
        <div class="flex flex-row gap-2">
          <Button type="button" label="삭제" severity="danger" />
          <Button type="button" label="초기화" severity="secondary" />
          <Button v-if="qualityState == 0" type="button" label="등록" @click="$emit('submitQiResult')" severity="success" />
          <Button v-else type="button" label="저장" severity="success" />
          <Button type="button" @click="$emit('callQiResult')" label="검사결과 불러오기" />
        </div>
      </div>
      <div class="grid grid-cols-8 gap-20" style="margin-top: 20px">
        <div class="col-span-2">
          <div class="grid grid-cols-2">
            <label for="OrderCode" class="col">검사결과 코드</label>
            <InputText id="OrderCode" type="text" class="col-span-2" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-2">
            <label for="orderDate" class="col">검사자</label>
            <InputText id="orderDate" type="text" class="col-span-2" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-2">
            <label for="orderPeople" class="col-span-1">시작일시</label>
            <InputText id="orderPeople" type="text" class="col-span-2" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-2">
            <label for="orderPeople" class="col-span-1">비고</label>
            <InputText id="orderPeople" type="text" class="col-span-2" readonly />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
