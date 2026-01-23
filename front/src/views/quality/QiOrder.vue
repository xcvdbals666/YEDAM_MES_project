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
  await quality1.fetchQiMpoList();
  minbndList.value = quality1.qiMpoList;

  display.value = true;
};

// 모달창 닫기
const closeMOdal = () => {
  display.value = false;
  orderDisplay.value = false;
  produceDisplay.value = false;
  quality1.state = 0;
};

// 선택된 값 불러오기
const selectComp = (data) => {
  if (data == null || data == undefined) {
    alert('값을 선택해주세요');
    return;
  }
  quality1.state = 1;
  callQiOrder.value = true;
  callQiProd.value = true;

  console.log('data: ', data);

  display.value = false;
  console.log(data);
  seletedMinbnd.value = data;

  console.log('seletedMinbnd: ', seletedMinbnd.value);
  display.value = false;

  allQiList.value.forEach((value) => {
    console.log(data);
    if (value.com_value == seletedMinbnd.value.mat_type) {
      selectedQcrList.value.push(value);
    }
    console.log(selectedQcrList.value);
  });
};

// QiOrderItem의 항목 채우기(검사지 불러오기 모달창 선택값)
let seletedMinbnd = ref({ mpo_d_code: '', mat_code: '', mat_name: '', req_qtt: '', note: '', mat_type: '' });

// QiOrderMain의 값 선택하기(모달창 선택값)
let selectedQcrList = ref([]);

// 검사지시지 전체 불러오기
let orderDisplay = ref(false);
const searchOrderList = async () => {
  if (quality1.state != 1) {
    await quality1.fetchOrderList();
    orderDisplay.value = true;
  } else {
    alert('저장을 먼저 진행해주세요.');
  }
};

// 선택한 검사지시서 정보 조회
let orderInput = ref({ qio_code: '', qio_date: '', emp_name: '' }); // 검사지 불러오기 선택값
const selectedOrder = async (data) => {
  callQiMinbnd.value = true;
  callQiProd.value = true;

  if (data != undefined) {
    quality1.state = 1;
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
  } else {
    alert('검사지를 선택해주세요.');
  }
};

// 초기화버튼 누를 경우
const resetQiOrder = async () => {
  console.log('adsfasd');
  await quality1.fetchQiMpoList();
  await quality1.fetchQiProduceList();
  await quality1.fetchQiMpoList();
  minbndList.value = [{ qio_code: '', mat_code: '', mat_name: '', inspection_item: '', com_value: '', note: '', sum: '' }];
  seletedMinbnd.value = { mpo_d_code: '', mat_code: '', mat_name: '', req_qtt: '', mat_type: '' };
  selectedQcrList.value = [];
  orderInput.value = { qio_code: '', qio_date: '', emp_name: '' };
  callQiMinbnd.value = false;
  callQiProd.value = false;
  callQiOrder.value = false;
  quality1.state = 0;
};

// 생산실적 불러오기
let produceDisplay = ref(false);
let produceList = ref({ prdr_code: '', end_date: '', production_qtt: '', note: '' });
const searchProduceList = async () => {
  await quality1.fetchQiProduceList();
  produceList.value = quality1.qiProduceList;
  produceDisplay.value = true;
};

// 생산실적 선택값 가져오기
let realSelectedProdInfo = ref([]);
const selectProd = (data) => {
  if (data == undefined || data == null) {
    alert('값을 선택해주세요.');
    return;
  }
  quality1.state = 1;

  callQiOrder.value = true;
  callQiMinbnd.value = true;

  console.log(data);
  realSelectedProdInfo.value = data;
  produceDisplay.value = false;
  seletedMinbnd.value = { mpo_d_code: data.prdp_code, mat_code: data.prdp_code, mat_name: data.prod_name, req_qtt: data.production_qtt, note: data.type, mat_type: data.prod_type };
  allQiList.value.forEach((value) => {
    if (value.com_value == seletedMinbnd.value.mat_type) {
      selectedQcrList.value.push(value);
    }
    console.log('selectedQcrList: ', selectedQcrList.value);
  });
};

// 검사지시서 등록
const submitQiOrder = async () => {
  if (quality1.state != 0) {
    if (seletedMinbnd.value.mpo_d_code != '' || seletedMinbnd.value.mpo_d_code != null) {
      if (seletedMinbnd.value.mat_type == 'i3' || seletedMinbnd.value.mat_type == 'i4') {
        await quality1.submitMinbndQi({
          insp_date: quality1.qiMpoList[0].deadline,
          insp_vol: seletedMinbnd.value.req_qtt,
          mpo_d_code: seletedMinbnd.value.mpo_d_code
        });
      } else if (seletedMinbnd.value.mat_type == 'i1' || seletedMinbnd.value.mat_type == 'i1') {
        let data = {
          insp_date: realSelectedProdInfo.value.end_date,
          insp_vol: realSelectedProdInfo.value.production_qtt,
          prdr_code: realSelectedProdInfo.value.prdr_code
        };
        await quality1.submitMinbndQi(data);
      }
      callQiMinbnd.value = false;
      callQiProd.value = false;
      callQiOrder.value = false;
      minbndList.value = [{ qio_code: '', mat_code: '', mat_name: '', inspection_item: '', com_value: '', note: '', sum: '' }];
      seletedMinbnd.value = { mpo_d_code: '', mat_code: '', mat_name: '', req_qtt: '', mat_type: '' };
      selectedQcrList.value = [];
      orderInput.value = { qio_code: '', qio_date: '', emp_name: '' };
      quality1.state = 0;
      await quality1.fetchQiMpoList();
      await quality1.fetchQiProduceList();
      await quality1.fetchQiMpoList();
    }
  } else {
    alert('저장할 내용이 없습니다.');
  }
};

// 검사지시서 삭제
const delQiOrder = async (data) => {
  console.log(data);
  await axios //
    .delete('/api/quality/removeqiorder/' + data)
    .then((res) => {
      console.log(res);
      alert('삭제완료!');
      quality1.state = 0;
      minbndList.value = [{ qio_code: '', mat_code: '', mat_name: '', inspection_item: '', com_value: '', note: '', sum: '' }];
      seletedMinbnd.value = { mpo_d_code: '', mat_code: '', mat_name: '', req_qtt: '', mat_type: '' };
      selectedQcrList.value = [];
      orderInput.value = { qio_code: '', qio_date: '', emp_name: '' };
      callQiMinbnd.value = false;
      callQiProd.value = false;
      callQiOrder.value = false;
    });
  await quality1.fetchQiMpoList();
  await quality1.fetchQiProduceList();
  await quality1.fetchQiMpoList();
};

// 버튼간 비활성화
let callQiOrder = ref(false);
let callQiMinbnd = ref(false);
let callQiProd = ref(false);
</script>

<template>
  <QiOrderHeader
    :quality-state="quality1.state"
    :order-input="orderInput"
    :key="orderInput"
    :call-qi-order="callQiOrder"
    @search-order-list="searchOrderList"
    @del-qi-order="delQiOrder"
    @reset-qi-order="resetQiOrder"
    @submit-qi-order="submitQiOrder"
  ></QiOrderHeader>
  <QiOrderItem :selected-minbnd="seletedMinbnd" :key="seletedMinbnd" :call-qi-minbnd="callQiMinbnd" :call-qi-prod="callQiProd" @search-list="searchMinbndList" @search-produce-list="searchProduceList"></QiOrderItem>
  <QiOrderMain :all-qi-list="allQiList" :selected-qcr-list="selectedQcrList" :key="selectedQcrList"></QiOrderMain>
  <SelectQiOrderModal :display="orderDisplay" :qi-order-list="quality1.qiOrderList" @close="closeMOdal" @selected-order="selectedOrder"></SelectQiOrderModal>
  <SelectMinbndModal :display="display" :minbnd="minbndList" @close="closeMOdal" @select-comp="selectComp"></SelectMinbndModal>
  <SelectQiProduceModal :display="produceDisplay" :produce-list="produceList" :key="produceList" @select-prod="selectProd" @close="closeMOdal"></SelectQiProduceModal>
</template>
