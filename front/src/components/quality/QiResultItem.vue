<script setup>
import { ref, defineProps } from 'vue';
const props = defineProps({
  selectedMinbnd: { type: Object, required: true },
  checkCallQir: { type: Boolean, required: true },
  callQiList: { type: Boolean, required: true }
});
let QiOrderItemInput = ref({ mpo_d_code: '', mat_code: '', mat_name: '', insp_vol: '', note: '', mat_type: '' });
QiOrderItemInput.value = props.selectedMinbnd;
</script>
<template>
  <div class="flex mt-8">
    <div class="card flex flex-col gap-4 w-full">
      <div class="font-semibold text-xl flex justify-between">
        <p>지시 정보</p>
        <div class="flex flex-row gap-2">
          <Button type="button" label="검사지시 불러오기" @click="$emit('selectQiOrder')" />
        </div>
      </div>
      <div class="grid grid-cols-8 gap-20" style="margin-top: 20px">
        <div class="col-span-2">
          <div class="grid grid-cols-2">
            <label for="checkThing" class="col-span-1">검사대상</label>
            <InputText id="checkThing" type="text" class="col-span-2" v-model="QiOrderItemInput.note" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-2">
            <label for="thingCode" class="col-span-1">품목코드</label>
            <InputText id="thingCode" type="text" class="col-span-2" v-model="QiOrderItemInput.mat_code" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-2">
            <label for="thingName" class="col-span-1">품목이름</label>
            <InputText id="thingName" type="text" class="col-span-2" v-model="QiOrderItemInput.mat_name" readonly />
          </div>
        </div>
        <div class="col-span-2">
          <div class="grid grid-cols-2">
            <label for="checkNum" class="col-span-1">검사수량</label>
            <InputText id="checkNum" type="text" class="col-span-2" v-model="QiOrderItemInput.insp_vol" :readonly="checkCallQir" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
