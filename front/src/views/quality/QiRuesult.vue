<!-- QiOrder.vue -->
<!-- 검사지시서 관리 페이지-->
<script setup>
import QiResultHeader from '../../components/quality/QiResultHeader.vue';
import QiResultItem from '../../components/quality/QiResultItem.vue';
import QiResultMain from '../../components/quality/QiResultMain.vue';
import SelectQiOrderModal from '@/components/quality/modal/SelectQiOrderModal.vue'; // 검사지시 불러오기 버튼
import SelectQirListModal from '@/components/quality/modal/SelectQirListModal.vue';

import { ref } from 'vue';
import { useQuality1Store } from '@/stores/quality1';

const quality1 = useQuality1Store();

// 검사지시지 불러오기 버튼
let orderDisplay = ref(false);
const selectQiOrder = async () => {
  console.log('adadfsda');
  await quality1.fetchQirQioOrderList();
  orderDisplay.value = true;
};

// 선택값 불러오기
let orderInput = ref({ qio_code: '', qio_date: '', emp_name: '' }); // 검사지 불러오기 선택값
let seletedMinbnd = ref({ mpo_d_code: '', mat_code: '', mat_name: '', req_qtt: '', note: '', mat_type: '' }); // Item 컴포넌트에 들어갈 값
let allQiList = ref([]); // main 컴포넌트에 들어갈 값(검사항목들)
let realSelectedProdInfo = ref([]);

const selectedOrder = async (data) => {
  allQiList.value = [];
  orderInput.value = data;
  console.log(data);
  await quality1.fetchQcrInfo();
  if (data != undefined && data.mpo_d_code != null) {
    console.log('selectedOrder: ', data);
    orderDisplay.value = false;
    await quality1.fetchOrderItemInfo(data.qio_code);

    if (quality1.qiOrderThing.length > 0) {
      seletedMinbnd.value = quality1.qiOrderThing[0];

      quality1.qcrInfo.forEach((item) => {
        if (item.com_value == seletedMinbnd.value.com_value) {
          allQiList.value.push(item);
        }
      });
    }
  } else if (data != undefined && data.prdr_code != null) {
    realSelectedProdInfo.value = data;
    orderDisplay.value = false;
    await quality1.fetchQirProdInfo(data.qio_code);
    seletedMinbnd.value = {
      mpo_d_code: quality1.qirProdInfo[0].prdp_code,
      mat_code: quality1.qirProdInfo[0].prdp_code,
      mat_name: quality1.qirProdInfo[0].prod_name,
      req_qtt: quality1.qirProdInfo[0].production_qtt,
      note: quality1.qirProdInfo[0].type,
      mat_type: quality1.qirProdInfo[0].prod_type
    };
    console.log(seletedMinbnd.value);
    quality1.qcrInfo.forEach((value) => {
      if (value.com_value == seletedMinbnd.value.mat_type) {
        allQiList.value.push(value);
      }
      console.log('allQiList: ', allQiList.value);
    });
  } else {
    alert('검사지를 선택해주세요.');
  }
};

// 모달창 닫기
const closeMOdal = () => {
  orderDisplay.value = false;
  qirDisplay.value = false;
};

// 결과서 저장
const submitQiResult = async () => {
  if (seletedMinbnd.value.mat_type == 'i3' || seletedMinbnd.value.mat_type == 'i4') {
    allQiList.value.forEach(async (submitQirInfo) => {
      let data = { qio_code: orderInput.value.qio_code, qcr_code: submitQirInfo.qcr_code, mpo_d_code: orderInput.value.mpo_d_code, mat_type: submitQirInfo.com_value };
      await quality1.submitQiResult(data);
    });
  } else {
    for (let submitQirInfo of allQiList.value) {
      let data = { qio_code: orderInput.value.qio_code, qcr_code: submitQirInfo.qcr_code, mat_type: submitQirInfo.com_value };
      await quality1.submitQiResult(data);
    }
  }
  await quality1.fetchQirQioOrderList();
  orderInput.value = { qio_code: '', qio_date: '', emp_name: '' };
  seletedMinbnd.value = { mpo_d_code: '', mat_code: '', mat_name: '', req_qtt: '', note: '', mat_type: '' };
  allQiList.value = [];
};

// 검사결과서 불러오기
let qirDisplay = ref(false);
const callQiResult = async () => {
  await quality1.fetchQirList();
  quality1.state = 1;
  qirDisplay.value = true;
};
</script>
<template>
  <QiResultHeader :quality-state="quality1.state" @submit-qi-result="submitQiResult" @call-qi-result="callQiResult"></QiResultHeader>
  <QiResultItem :selected-minbnd="seletedMinbnd" :key="seletedMinbnd" @select-qi-order="selectQiOrder"></QiResultItem>
  <QiResultMain :all-qi-list="allQiList"></QiResultMain>
  <SelectQiOrderModal :display="orderDisplay" :qi-order-list="quality1.qiOrderList" @close="closeMOdal" @selected-order="selectedOrder"></SelectQiOrderModal>
  <SelectQirListModal :display="qirDisplay" :qi-order-list="quality1.qiOrderList" @close="closeMOdal" @selected-order="selectedOrder"></SelectQirListModal>
</template>
