<script setup>
import { defineEmits, defineProps, ref } from 'vue';

const props = defineProps({
  selectedMinbnd: { type: Array, required: true }
});

const emit = defineEmits();

// 항목에 채울 내용
let QiOrderItemInput = ref({ mpo_d_code: '', mat_code: '', mat_name: '', req_qtt: '', note: '', mat_type: '' });
QiOrderItemInput.value = props.selectedMinbnd;
</script>
<template>
  <div class="flex">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <div>기본 정보</div>
        <div class="flex flex-row gap-2">
          <Button type="button" @click="$emit('searchList')" label="재고목록 불러오기" />

          <Button type="button" @click="$emit('searchProduceList')" label="생산목록 불러오기" />
        </div>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="checkThing" class="col-span-1">검사대상</label>
            <InputText id="checkThing" type="text" class="col-span-2" v-model="QiOrderItemInput.note" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="thingCode" class="col-span-1">품목코드</label>
            <InputText id="thingCode" type="text" class="col-span-2" v-model="QiOrderItemInput.mat_code" readonly />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="thingName" class="col-span-1">품목이름</label>
            <InputText id="thingName" type="text" class="col-span-2" v-model="QiOrderItemInput.mat_name" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-3">
            <label for="checkNum" class="col-span-1">검사수량</label>
            <InputText id="checkNum" type="text" class="col-span-2" v-model="QiOrderItemInput.req_qtt" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
