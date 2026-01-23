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
      if (data.remaining > 0) {
        seletedMinbnd.value.req_qtt = data.remaining;
      }

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
      mat_type: quality1.qirProdInfo[0].prod_type,
      qio_code: quality1.qirProdInfo[0].qio_code
    };
    if (data.remaining > 0) {
      seletedMinbnd.value.req_qtt = data.remaining;
    }
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

// 결과서 등록
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
  orderInput.value = { qir_code: '', qio_date: '', emp_name: '' };
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

// 검사결과서 선택값 가져오기
let checkCallQir = ref(true);
let qirBasicInfo = ref({ qio_code: '', qio_date: '', emp_name: '' }); // 검사 결과서 불러오기 기본정보
const selectQirList = (data) => {
  qirDisplay.value = false;
  console.log('검사결과서 선택값: ', data);
  qirBasicInfo.value = data;
  selectedOrder(data);
  checkCallQir.value = false;
};

// 검사결과서 저장(합격/불합격수량 입력)
let info = ref({ result: '', unpass_qtt: '', pass_qtt: '', unpass_rate: '', qio_code: '', qcr_code: '' });
const updateQiResult = async () => {
  console.log('결과값 수정', allQiList.value, seletedMinbnd.value, orderInput.value);
  let date = new Date();
  let dDay = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  // 처음검사
  if (quality1.qirProdInfo.length > 0) {
    if (seletedMinbnd.value.req_qtt > quality1.qirProdInfo[0].production_qtt) {
      alert('수량이 초과했습니다. 다시 지정해주세요.');
      return;
    }
  } else if (quality1.qiOrderThing.length > 0) {
    if (seletedMinbnd.value.req_qtt > quality1.qiOrderThing[0].req_qtt) {
      alert('수량이 초과했습니다. 다시 지정해주세요.');
      return;
    }
  }
  for (let data of allQiList.value) {
    if (data.result == null || data.result == '') {
      alert('합격, 불합격이 선택되지 않았습니다.');
      return;
    }
  }
  // 첫번째 검사
  if (orderInput.value.remaining == orderInput.value.insp_vol) {
    console.log('??');
    // i1 or i2일경우(생산)
    if (quality1.qirProdInfo.length > 0) {
      console.log('quality1.qirProdInfo.length > 0:', quality1.qirProdInfo.length > 0);
      // 전체 갯수보다 적을 때
      if (quality1.qirProdInfo[0].production_qtt > seletedMinbnd.value.req_qtt) {
        for (let data of allQiList.value) {
          console.log(data);
          if (data.result == '합격') {
            info.value = { result: null, end_date: null, unpass_qtt: null, pass_qtt: seletedMinbnd.value.req_qtt, unpass_rate: null, qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
            console.log("data.result == '합격'", info.value);
          } else if (data.result == '불합격') {
            info.value = { result: null, end_date: null, unpass_qtt: seletedMinbnd.value.req_qtt, pass_qtt: null, unpass_rate: null, qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
            console.log("data.result == '불합격'", info.value);
          }
          await quality1.fetchModifyQirList(info.value);
        }
        // 전체검사 할 때
      } else if (quality1.qirProdInfo[0].production_qtt == seletedMinbnd.value.req_qtt) {
        for (let data of allQiList.value) {
          if (data.result == '합격') {
            info.value = { result: 'g2', end_date: dDay, unpass_qtt: 0, pass_qtt: seletedMinbnd.value.req_qtt, unpass_rate: null, qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
          } else if (data.result == '불합격') {
            info.value = { result: 'g1', end_date: dDay, unpass_qtt: seletedMinbnd.value.req_qtt, pass_qtt: null, unpass_rate: null, qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
          }
          await quality1.fetchModifyQirList(info.value);
        }
      }
      // i3 or i4일 경우(자재)
    } else if (quality1.qiOrderThing.length > 0) {
      // 전체 갯수보다 적을 때
      if (quality1.qiOrderThing[0].req_qtt > seletedMinbnd.value.req_qtt) {
        for (let data of allQiList.value) {
          if (data.result == '합격') {
            info.value = { result: null, end_date: null, unpass_qtt: null, pass_qtt: seletedMinbnd.value.req_qtt, unpass_rate: null, qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
            console.log('quality1.qiOrderThing.length > 0');
          } else if ((data.result == '불합격', seletedMinbnd.value.req_qtt)) {
            info.value = { result: null, end_date: null, unpass_qtt: seletedMinbnd.value.req_qtt, pass_qtt: null, unpass_rate: null, qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
          }
          await quality1.fetchModifyQirList(info.value);
        }
        // 전체검사 할 때
      } else if (quality1.qiOrderThing[0].req_qtt == seletedMinbnd.value.req_qtt) {
        for (let data of allQiList.value) {
          if (data.result == '합격') {
            info.value = { result: 'g2', end_date: dDay, unpass_qtt: null, pass_qtt: seletedMinbnd.value.req_qtt, unpass_rate: null, qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
          } else if (data.result == '불합격') {
            info.value = { result: 'g1', end_date: dDay, unpass_qtt: seletedMinbnd.value.req_qtt, pass_qtt: null, unpass_rate: null, qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
          }
          await quality1.fetchModifyQirList(info.value);
        }
      }
    }
    // 두번째 검사
  } else if (orderInput.value.insp_vol > orderInput.value.remaining) {
    console.log('?');
    // i1 or i2일경우(생산)
    if (quality1.qirProdInfo.length > 0) {
      console.log('?');
      console.log(seletedMinbnd.value.req_qtt + orderInput.value.pass_qtt + orderInput.value.unpass_qtt);
      // 전체 갯수보다 적을 때
      if (quality1.qirProdInfo[0].production_qtt > Number(seletedMinbnd.value.req_qtt) + Number(orderInput.value.pass_qtt) + Number(orderInput.value.unpass_qtt)) {
        console.log('?');

        for (let data of allQiList.value) {
          console.log(quality1.qirProdInfo[0].production_qtt > seletedMinbnd.value.req_qtt + orderInput.value.pass_qtt + orderInput.value.unpass_qtt);
          if (data.result == '합격') {
            info.value = { result: null, end_date: null, unpass_qtt: orderInput.value.unpass_qtt, pass_qtt: orderInput.value.pass_qtt + seletedMinbnd.value.req_qtt, unpass_rate: null, qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
          } else if (data.result == '불합격') {
            info.value = { result: null, end_date: null, unpass_qtt: orderInput.value.unpass_qtt + seletedMinbnd.value.req_qtt, pass_qtt: orderInput.value.pass_qtt, unpass_rate: null, qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
          }
          await quality1.fetchModifyQirList(info.value);
        }
        // 전체검사 할 때
      } else if (quality1.qirProdInfo[0].production_qtt == seletedMinbnd.value.req_qtt + orderInput.value.pass_qtt + orderInput.value.unpass_qtt) {
        console.log('??');
        console.log(quality1.qirProdInfo[0].production_qtt == seletedMinbnd.value.req_qtt + orderInput.value.pass_qtt + orderInput.value.unpass_qtt);

        for (let data of allQiList.value) {
          if (data.result == '합격') {
            info.value = {
              result: 'g2',
              end_date: dDay,
              unpass_qtt: orderInput.value.unpass_qtt,
              pass_qtt: orderInput.value.pass_qtt + seletedMinbnd.value.req_qtt,
              unpass_rate: null,
              qio_code: seletedMinbnd.value.qio_code,
              qcr_code: data.qcr_code
            };
          } else if (data.result == '불합격') {
            info.value = {
              result: 'g1',
              end_date: dDay,
              unpass_qtt: orderInput.value.unpass_qtt + seletedMinbnd.value.req_qtt,
              pass_qtt: orderInput.value.pass_qtt,
              unpass_rate: null,
              qio_code: seletedMinbnd.value.qio_code,
              qcr_code: data.qcr_code
            };
          }
          await quality1.fetchModifyQirList(info.value);
        }
      }
      // i3 or i4일 경우(자재)
    } else if (quality1.qiOrderThing.length > 0) {
      // 전체 갯수보다 적을 때
      if (quality1.qiOrderThing[0].req_qtt > seletedMinbnd.value.req_qtt) {
        for (let data of allQiList.value) {
          if (data.result == '합격') {
            info.value = { result: null, end_date: null, unpass_qtt: orderInput.value.unpass_qtt, pass_qtt: orderInput.value.pass_qtt + seletedMinbnd.value.req_qtt, unpass_rate: '', qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
          } else if (data.result == '불합격') {
            info.value = { result: null, end_date: null, unpass_qtt: orderInput.value.unpass_qtt + seletedMinbnd.value.req_qtt, pass_qtt: orderInput.value.pass_qtt, unpass_rate: '', qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
          }
          await quality1.fetchModifyQirList(info.value);
        }
        // 전체검사 할 때
      } else if (quality1.qiOrderThing[0].req_qtt == seletedMinbnd.value.req_qtt) {
        for (let data of allQiList.value) {
          if (data.result == '합격') {
            info.value = {
              result: 'g2',
              end_date: dDay,
              unpass_qtt: orderInput.value.unpass_qtt,
              pass_qtt: orderInput.value.pass_qtt + seletedMinbnd.value.req_qtt,
              unpass_rate: null,
              qio_code: seletedMinbnd.value.qio_code,
              qcr_code: data.qcr_code
            };
          } else if (data.result == '불합격') {
            info.value = {
              result: 'g1',
              end_date: dDay,
              unpass_qtt: orderInput.value.unpass_qtt + seletedMinbnd.value.req_qtt,
              pass_qtt: orderInput.value.pass_qtt,
              unpass_rate: null,
              qio_code: seletedMinbnd.value.qio_code,
              qcr_code: data.qcr_code
            };
          }
          await quality1.fetchModifyQirList(info.value);
        }
      }
    }
  }
};
</script>
<template>
  <QiResultHeader :quality-state="quality1.state" :qir-basic-info="qirBasicInfo" @submit-qi-result="submitQiResult" @update-qi-result="updateQiResult" @call-qi-result="callQiResult"></QiResultHeader>
  <QiResultItem :selected-minbnd="seletedMinbnd" :key="seletedMinbnd" :check-call-qir="checkCallQir" @select-qi-order="selectQiOrder"></QiResultItem>
  <QiResultMain :all-qi-list="allQiList"></QiResultMain>
  <SelectQiOrderModal :display="orderDisplay" :qi-order-list="quality1.qiOrderList" @close="closeMOdal" @selected-order="selectedOrder"></SelectQiOrderModal>
  <SelectQirListModal :display="qirDisplay" :qi-order-list="quality1.qirList" @close="closeMOdal" @select-qir-list="selectQirList"></SelectQirListModal>
</template>
