<script setup>
import { defineProps } from 'vue';
const props = defineProps({
  orderInput: { type: Object, required: true }
});
</script>
<template>
  <div class="flex">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <div>기본 정보</div>
        <div class="flex flex-row gap-2">
          <Button type="button" label="삭제" @click="$emit('delQiOrder', orderInput.qio_code)" severity="danger" />
          <Button type="button" label="초기화" @click="$emit('resetQiOrder')" severity="secondary" />
          <Button type="button" label="저장" @click="$emit('submitQiOrder')" severity="success" />
          <Button type="button" label="검사지 불러오기" @click="$emit('searchOrderList')" />
        </div>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="OrderCode" class="col-span-1">검사지시 코드</label>
            <InputText id="OrderCode" type="text" class="col-span-2" :value="orderInput.qio_code" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="orderDate" class="col-span-1">지시일자</label>
            <InputText id="orderDate" type="text" class="col-span-2" :value="orderInput.qio_date" readonly />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="orderPeople" class="col-span-1">지시자</label>
            <InputText id="orderPeople" type="text" class="col-span-2" :value="orderInput.emp_name" readonly />
          </div>
        </div>
        <div class="col-span-2"></div>
      </div>
    </div>
  </div>
</template>
