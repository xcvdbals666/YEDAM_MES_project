<!-- QiOrder.vue -->
<!-- 검사지시서 관리 페이지-->
<script setup>
import QiOrderHeader from '../../components/quality1/QiOrderHeader.vue';
import QiOrderItem from '../../components/quality1/QiOrderItem.vue';
import QiOrderMain from '../../components/quality1/QiOrderMain.vue';
import SelectMinbndModal from '../../components/quality1/modal/SelectMinbndModal.vue';
import SelectQiOrderModal from '@/components/quality1/modal/SelectQiOrderModal.vue';
import { useQuality1Store } from '../../stores/quality1';

import { onBeforeMount, ref, watch } from 'vue';
import axios from 'axios';

const quality1 = useQuality1Store();

onBeforeMount(async () => {
  // qcr_tbl 데이터 불러오기(맨처음 접속시)
  await quality1.fetchQcrInfo();
  allQiList.value = quality1.qcrInfo;
});
let allQiList = ref([]);

// 재고목록 불러오기
// 모달창 열기
let minbndList = ref([{ qio_code: '', mat_code: '', mat_name: '', inspection_item: '', com_value: '', note: '', sum: '' }]);
let display = ref(false); // 모달창 오픈 위해서

const searchMinbndList = async () => {
  await axios //
    .get('quality/minbndlist')
    .then((res) => {
      minbndList.value = res.data;
      console.log(minbndList.value);
    });
  display.value = true;
};

// 재고불러오기 모달창 닫기
const closeMOdal = () => {
  display.value = false;
  orderDisplay.value = false;
};

// 선택된 값 불러오기
const selectComp = (data) => {
  if (data != null) {
    console.log(data[0]);
    seletedMinbnd.value = data[0];
    console.log(seletedMinbnd.value);
    display.value = false;

    allQiList.value.forEach((value) => {
      console.log(data);
      if (value.com_value == seletedMinbnd.value.com_value) {
        selectedQcrList.value.push(value);
      }
      console.log(selectedQcrList.value);
    });
  } else {
    display.value = false;
  }
};

// QiOrderItem의 항목 채우기(모달창 선택값)
let seletedMinbnd = ref([]);

// QiOrderMain의 값 선택하기(모달창 선택값)
let selectedQcrList = ref([]);

// 검사지시지 전체 불러오기
let orderDisplay = ref(false);
const searchOrderList = async () => {
  await quality1.fetchOrderList();
  orderDisplay.value = true;
};

// 선택한 검사지시서 정보 조회
const selectedOrder = (data) => {
  console.log(data);
  orderDisplay.value = false;
};

// 변화 감지
watch(
  () => [selectedQcrList.value, seletedMinbnd.value],
  ([newVal1, newVal2], [oldVal1, oldVal2]) => {
    console.log('Parent originalUserData changed:', [newVal1, newVal2], '->', [oldVal1, oldVal2]);
  },

  { deep: true },
  { immediate: true }
);
</script>

<template>
  <QiOrderHeader @search-order-list="searchOrderList"></QiOrderHeader>
  <QiOrderItem :selected-minbnd="seletedMinbnd" :key="seletedMinbnd" @search-list="searchMinbndList"></QiOrderItem>
  <QiOrderMain :all-qi-list="allQiList" :selected-qcr-list="selectedQcrList" :key="selectedQcrList"></QiOrderMain>
  <SelectMinbndModal :display="display" :minbnd="minbndList" @close="closeMOdal" @select-comp="selectComp"></SelectMinbndModal>
  <SelectQiOrderModal :display="orderDisplay" :qi-order-list="quality1.qiOrderList" @close="closeMOdal" @selected-order="selectedOrder"></SelectQiOrderModal>
</template>
