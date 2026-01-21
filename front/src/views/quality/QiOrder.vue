<!-- QiOrder.vue -->
<!-- 검사지시서 관리 페이지-->
<script setup>
import QiOrderHeader from '../../components/quality/QiOrderHeader.vue'; // 검사지시서 불러오기
import QiOrderItem from '../../components/quality/QiOrderItem.vue'; // 검사지시서 재고불러오기, 생산실적 불렁괴
import QiOrderMain from '../../components/quality/QiOrderMain.vue'; // 검사 항목 테이블
import SelectMinbndModal from '../../components/quality/modal/SelectMinbndModal.vue'; // 자재 불러오기 모달창
import SelectQiOrderModal from '../../components/quality/modal/SelectQiOrderModal.vue'; // 지시서 불러오기 모달창
import SelectQiProduceModal from '../../components/quality/modal/SelectQiProduceModal.vue'; // 생산실적 불러오기 모달창
import { useQuality1Store } from '../../stores/quality1';

import { onBeforeMount, ref } from 'vue';
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
  await quality1.fetchQiMpoList();
  minbndList.value = quality1.qiMpoList;

  display.value = true;
};

// 재고불러오기 모달창 닫기
const closeMOdal = () => {
  display.value = false;
  orderDisplay.value = false;
  produceDisplay.value = false;
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

// QiOrderItem의 항목 채우기(검사지 불러오기 모달창 선택값)
let seletedMinbnd = ref({ mpo_d_code: '', mat_code: '', mat_name: '', req_qtt: '', mat_type: '' });

// QiOrderMain의 값 선택하기(모달창 선택값)
let selectedQcrList = ref([]);

// 검사지시지 전체 불러오기
let orderDisplay = ref(false);
const searchOrderList = async () => {
  await quality1.fetchOrderList();
  orderDisplay.value = true;
};

// 선택한 검사지시서 정보 조회
let orderInput = ref({ qio_code: '', qio_date: '', emp_name: '' }); // 검사지 불러오기 선택값
const selectedOrder = async (data) => {
  console.log('selectedOrder: ', data);
  orderDisplay.value = false;
  await quality1.fetchOrderItemInfo(data.qio_code);
  orderInput.value = data;

  if (quality1.qiOrderThing.length > 0) {
    seletedMinbnd.value = quality1.qiOrderThing[0];

    allQiList.value.forEach((value) => {
      if (value.com_value == quality1.qiOrderThing[0].mat_type) {
        selectedQcrList.value.push(value);
      }
      console.log('selectedQcrList: ', selectedQcrList.value);
    });
  }
};

// 초기화버튼 누를 경우
const resetQiOrder = () => {
  console.log('adsfasd');
  minbndList = [{ qio_code: '', mat_code: '', mat_name: '', inspection_item: '', com_value: '', note: '', sum: '' }];
  seletedMinbnd = { note: '', mat_code: '', mat_name: '', inbnd_qtt: '' };
  selectedQcrList.value = [];
  orderInput.value = { qio_code: '', qio_date: '', emp_name: '' };
};

// 생산실적 불러오기
let produceDisplay = ref(false);
let produceList = ref({ prdr_code: '', end_date: '', production_qtt: '', note: '' });
const searchProduceList = async () => {
  await quality1.fetchQiProduceList();
  produceDisplay.value = true;
  produceList.value = quality1.qiProduceList;
};
</script>

<template>
  <QiOrderHeader :order-input="orderInput" :key="orderInput" @search-order-list="searchOrderList" @reset-qi-order="resetQiOrder"></QiOrderHeader>
  <QiOrderItem :selected-minbnd="seletedMinbnd" :key="seletedMinbnd" @search-list="searchMinbndList" @search-produce-list="searchProduceList"></QiOrderItem>
  <QiOrderMain :all-qi-list="allQiList" :selected-qcr-list="selectedQcrList" :key="selectedQcrList"></QiOrderMain>
  <SelectQiOrderModal :display="orderDisplay" :qi-order-list="quality1.qiOrderList" @close="closeMOdal" @selected-order="selectedOrder"></SelectQiOrderModal>
  <SelectMinbndModal :display="display" :minbnd="minbndList" @close="closeMOdal" @select-comp="selectComp"></SelectMinbndModal>
  <SelectQiProduceModal :display="produceDisplay" :produce-list="produceList" :key="produceList" @close="closeMOdal"></SelectQiProduceModal>
</template>
