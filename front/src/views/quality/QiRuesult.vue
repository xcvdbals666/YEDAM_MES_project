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

// 모달창 선택값 리셋
let resetModal = ref(false);

// 검사지시지 불러오기 버튼
let orderDisplay = ref(false);

const selectQiOrder = async () => {
  await quality1.fetchQirQioOrderList();
  quality1.qiOrderList.forEach(async (data) => {
    if (data.mpo_d_code != null) {
      await quality1.fetchOrderItemInfo(data.qio_code);
      data.mat_name = quality1.qiOrderThing[0].mat_name;
    } else if (data.prdr_code != null) {
      await quality1.fetchQirProdInfo(data.qio_code);
      data.mat_name = quality1.qirProdInfo[0].prod_name;
    }
  });

  orderDisplay.value = true;
};

// 선택값 불러오기
let orderInput = ref({ qio_code: '', qio_date: '', emp_name: '' }); // 검사지 불러오기 선택값
let seletedMinbnd = ref({ mpo_d_code: '', mat_code: '', mat_name: '', insp_vol: '', note: '', mat_type: '' }); // Item 컴포넌트에 들어갈 값
let allQiList = ref([]); // main 컴포넌트에 들어갈 값(검사항목들)
let realSelectedProdInfo = ref([]);
let callQiOrder = ref(false); // 결과불러오기 막기

const selectedOrder = async (data) => {
  resetModal.value = false;
  allQiList.value = [];
  quality1.state = 0;
  orderInput.value = data;
  console.log(data);
  callQiOrder.value = true;
  await quality1.fetchQcrInfo();
  if (data != undefined && data.mpo_d_code != null) {
    console.log('selectedOrder: ', data);
    orderDisplay.value = false;
    await quality1.fetchOrderItemInfo(data.qio_code);

    if (quality1.qiOrderThing.length > 0) {
      seletedMinbnd.value = quality1.qiOrderThing[0];

      // quality1.qcrInfo.forEach((item) => {
      //   if (item.com_value == seletedMinbnd.value.com_value) {
      //     allQiList.value.push(item);
      //   }
      // });

      await quality1.fetchQiList(quality1.qiOrderThing[0].mat_code);

      quality1.qcrInfo.forEach((item) => {
        quality1.qiList.forEach((code) => {
          if (item.qcr_code == code.qcr_code) {
            allQiList.value.push(item);
          }
        });
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
      insp_vol: quality1.qirProdInfo[0].production_qtt,
      note: quality1.qirProdInfo[0].type,
      mat_type: quality1.qirProdInfo[0].prod_type,
      qio_code: quality1.qirProdInfo[0].qio_code
    };

    await quality1.fetchQiList(quality1.qirProdInfo[0].prod_code);

    quality1.qcrInfo.forEach((value) => {
      quality1.qiList.forEach((code) => {
        if (value.qcr_code == code.qcr_code) {
          allQiList.value.push(value);
        }
      });
    });
  } else {
    alert('검사지를 선택해주세요.');
  }
};

// 모달창 닫기
const closeMOdal = () => {
  orderDisplay.value = false;
  qirDisplay.value = false;
  callQiOrder.value = false;
};

// 결과서 등록
const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
    console.log('전송중');
  });
};
const submitQiResult = async () => {
  if (allQiList.value.length == 0) {
    alert('검사지시서를 선택해주세요.');
    return;
  }
  if (seletedMinbnd.value.mat_type == 'i3' || seletedMinbnd.value.mat_type == 'i4') {
    for (let submitQirInfo of allQiList.value) {
      let data = { qio_code: orderInput.value.qio_code, qcr_code: submitQirInfo.qcr_code, mpo_d_code: orderInput.value.mpo_d_code, mat_type: submitQirInfo.com_value };
      await quality1.submitQiResult(data);

      await sleep(100);
    }
  } else {
    for (let submitQirInfo of allQiList.value) {
      let data = { qio_code: orderInput.value.qio_code, qcr_code: submitQirInfo.qcr_code, mat_type: submitQirInfo.com_value };
      await quality1.submitQiResult(data);
      await sleep(100);
    }
  }
  alert('등록완료');
  await resetQiResult();
};

// 검사결과서 불러오기
let qirDisplay = ref(false);
const callQiResult = async () => {
  await quality1.fetchQirList();
  quality1.qirList.forEach(async (data) => {
    if (data.mpo_d_code != null) {
      await quality1.fetchOrderItemInfo(data.qio_code);
      data.mat_name = quality1.qiOrderThing[0].mat_name;
    } else if (data.prdr_code != null) {
      await quality1.fetchQirProdInfo(data.qio_code);
      data.mat_name = quality1.qirProdInfo[0].prod_name;
    }
  });

  qirDisplay.value = true;
};

// 검사결과서 선택값 가져오기
let checkCallQir = ref(true);
let callQirList = ref(false);
let qirBasicInfo = ref({ qir_code: '', qio_date: '', emp_name: '' }); // 검사 결과서 불러오기 기본정보
const selectQirList = (data) => {
  qirDisplay.value = false;
  callQirList.value = true;
  console.log('검사결과서 선택값: ', data);

  qirBasicInfo.value = data;
  console.log('검사결과서 입력값: ', qirBasicInfo.value);

  selectedOrder(data);
  checkCallQir.value = false;
  callQiOrder.value = false;
  quality1.state = 1;
  countRate();
  resetModal.value = false;
};

// 검사결과서 저장(합격/불합격수량 입력)
let info = ref({ result: '', unpass_qtt: '', pass_qtt: '', unpass_rate: '', qio_code: '', qcr_code: '' });
const updateQiResult = async () => {
  console.log('결과값 수정', allQiList.value, seletedMinbnd.value, orderInput.value);
  let date = new Date();
  let dDay = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  if (seletedMinbnd.value.insp_vol < orderInput.insp_vol) {
    alert('수량이 초과했습니다. 다시 지정해주세요.');
    return;
  }

  for (let data of allQiList.value) {
    if (data.result == null || data.result == '') {
      alert('합격, 불합격이 선택되지 않았습니다.');
      return;
    }
  }

  console.log('??');
  // i1 or i2일경우(생산)
  if (selectedMinbnd.value.mat_type == 'i1' || selectedMinbnd.value.mat_type == 'i2') {
    console.log('첫번째 검사 생산 전체 갯수');
    for (let data of allQiList.value) {
      if (data.result == '합격') {
        console.log("data.result == '합격'", info.value);

        info.value = { result: 'g2', end_date: dDay, unpass_qtt: 0, pass_qtt: orderInput.value.insp_vol, unpass_rate: countRate(), qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
      } else if (data.result == '불합격') {
        console.log('불합격');

        info.value = { result: 'g1', end_date: dDay, unpass_qtt: orderInput.value.insp_vol, pass_qtt: 0, unpass_rate: countRate(), qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
      }
      console.log('생산품 전송데이터: ', info.value);
      await quality1.fetchModifyQirList(info.value);
    }

    // i3 or i4일 경우(자재)
  } else if (selectedMinbnd.value.mat_type == 'i3' || selectedMinbnd.value.mat_type == 'i4') {
    console.log('첫번째 검사 자재 전체 갯수');
    for (let data of allQiList.value) {
      if (data.result == '합격') {
        console.log('합격');
        info.value = { result: 'g2', end_date: dDay, unpass_qtt: 0, pass_qtt: seletedMinbnd.value.req_qtt, unpass_rate: countRate(), qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
      } else if (data.result == '불합격') {
        console.log('불합격');

        info.value = { result: 'g1', end_date: dDay, unpass_qtt: seletedMinbnd.value.req_qtt, pass_qtt: 0, unpass_rate: countRate(), qio_code: seletedMinbnd.value.qio_code, qcr_code: data.qcr_code };
      }

      console.log('자재 전송데이터: ', info.value);
      await quality1.fetchModifyQirList(info.value);
    }
  }

  alert('합격, 불합격 등록 완료');
  await resetQiResult();
};

// 불합격률 계산
const countRate = () => {
  if (orderInput.value.unpass_qtt == null) {
    orderInput.value.unpass_qtt = 0;
  } else if (orderInput.value.pass_qtt == null) {
    orderInput.value.pass_qtt = 0;
  }
  let count = 0;
  for (let data of allQiList.value) {
    if (data.result == '불합격') {
      count++;
    }
  }
  if (count > 0) {
    console.log('불합격률: ', 1);
    return 1;
  } else {
    console.log('불합격률: ', 0);
    return 0;
  }
};

// 검사 결과서 삭제
const removeQiResult = async () => {
  if (quality1.qiOrderThing.length > 0) {
    if (!confirm('삭제하시겠습니까?')) return;
    await quality1.fetchRemoveQir(quality1.qiOrderThing[0].qio_code);
    orderInput.value = { qio_code: '', qio_date: '', emp_name: '' }; // 검사지 불러오기 선택값
    seletedMinbnd.value = { mpo_d_code: '', mat_code: '', mat_name: '', req_qtt: '', note: '', mat_type: '' }; // Item 컴포넌트에 들어갈 값
    qirBasicInfo = { qir_code: '', qio_date: '', emp_name: '' }; // 검사 결과서 불러오기 기본정보

    resetQiResult();
  } else if (quality1.qirProdInfo.length > 0) {
    if (!confirm('삭제하시겠습니까?')) return;
    await quality1.fetchRemoveQir(quality1.qirProdInfo[0].qio_code);
  }
  await resetQiResult();
};

// 검사 결과서 초기화버튼
const resetQiResult = () => {
  orderInput.value = { qio_code: '', qio_date: '', emp_name: '' }; // 검사지 불러오기 선택값
  seletedMinbnd.value = { mpo_d_code: '', mat_code: '', mat_name: '', req_qtt: '', note: '', mat_type: '' }; // Item 컴포넌트에 들어갈 값
  qirBasicInfo.value = { result: '', unpass_qtt: '', pass_qtt: '', unpass_rate: '', qio_code: '', qcr_code: '' }; // 검사 결과서 불러오기 기본정보

  allQiList.value = []; // main 컴포넌트에 들어갈 값(검사항목들)
  realSelectedProdInfo.value = [];
  quality1.state = 0;
  callQiOrder.value = false;
  callQirList.value = false;
  resetModal.value = true;
};
</script>
<template>
  <QiResultHeader
    :quality-state="quality1.state"
    :qir-basic-info="qirBasicInfo"
    :call-qi-order="callQiOrder"
    @reset-qi-result="resetQiResult"
    @remove-qi-result="removeQiResult"
    @submit-qi-result="submitQiResult"
    @update-qi-result="updateQiResult"
    @call-qi-result="callQiResult"
  ></QiResultHeader>
  <QiResultItem :selected-minbnd="seletedMinbnd" :key="seletedMinbnd" :check-call-qir="checkCallQir" :call-qir-list="callQirList" @select-qi-order="selectQiOrder"></QiResultItem>
  <QiResultMain :all-qi-list="allQiList" :quality-state="quality1.state"></QiResultMain>
  <SelectQiOrderModal :display="orderDisplay" :reset-modal="resetModal" :qi-order-list="quality1.qiOrderList" @close="closeMOdal" @selected-order="selectedOrder"></SelectQiOrderModal>
  <SelectQirListModal :display="qirDisplay" :reset-modal="resetModal" :qi-order-list="quality1.qirList" @close="closeMOdal" @select-qir-list="selectQirList"></SelectQirListModal>
</template>
