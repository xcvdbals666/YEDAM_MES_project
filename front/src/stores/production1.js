// src/stores/production1.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useProductionsStore = defineStore('productions', () => {
  const wkoList = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const lines = ref([]);

  //라인목록 조회
  const fetchLines = async () => {
    const res = await axios.get('/api/produce/allLineList');
    lines.value = res.data;
  };

  // 작업지시서 검색조건
  const from = ref('');
  const to = ref('');
  const stat = ref('');
  const line = ref('');
  const name = ref('');
  const wko = ref('');
  // const start = ref('');
  // const end = ref('');


  // 작업지시서 목록 조회(검색 포함)
  const fetchWorkOrders = async (overrideParams = null) => {
    loading.value = true;
    error.value = null;

    try {
      const params = overrideParams ?? {
        from: from.value || undefined,
        to: to.value || undefined,
        stat: stat.value || undefined,
        line: line.value || undefined,
        name: name.value || undefined,
        wko: wko.value || undefined
      };

      const res = await axios.get('/api/produce/workorderList', { params });
      wkoList.value = res.data;
    } catch (e) {
      console.error(e);
      error.value = e;
    } finally {
      loading.value = false;
    }
  };

  //작업지시서 검색 버튼
  const search = async () => {
    await fetchWorkOrders();
  };

  //작업지시서 초기화 버튼
  const reset = async () => {
    from.value = '';
    to.value = '';
    stat.value = '';
    line.value = '';
    name.value = '';
    wko.value = '';
    await fetchWorkOrders();
  };

  //###################################
  //모달 생산계획서 리스트 띄우기
  //###################################
  //로딩중인지, 에러났는지 상태관리
  const prdpList = ref([]);
  const prdpLoading = ref(false);
  const prdpError = ref(null);
  const allProducts = ref([]);

  const fetchPrdpActive = async () => {
    prdpLoading.value = true; // = 리스트 로딩중
    prdpError.value = null;

    try {
      const res = await axios.get('/api/produce/prdpListActive');
      prdpList.value = res.data;
    } catch (e) {
      prdpError.value = e; //에러발생시
    } finally {
      prdpLoading.value = false; //리스트 로딩 끝나면 다시 false
    }
  };

  //제품명 드롭다운 목록에 가져오기
  const fetchAllPrdDistinct = async () => {
    const res = await axios.get('/api/produce/allProductsList');
    allProducts.value = res.data;
  };
  //###################################
  //생산계획서 리스트 모달 끝
  //###################################

  //생산계획서에 딸린 계획서 디테일 테이블에서 데이터 가져오기
  const prdpItems = ref([]);

  const fetchPrdpItems = async (prdpCode) => {
    const res = await axios.get(`/api/produce/prdpDetail/${prdpCode}`);
    prdpItems.value = res.data;
    return res.data;
  };

  // 작업지시서 저장수정
  const saveWorkOrder = async (formData) => {
    try {
      const res = await axios.post('/api/produce/workorderSave', formData);
      return res.data;
    } catch (e) {
      console.error('작업지시서 저장 중 에러 발생:', e);
      throw e;
    }
  };

  //불러온 작업지시서 삭제하기
  const deleteWorkOrderByWkoCode = async (wkoCode) => {
    const res = await axios.delete(`/api/produce/workOrderRemove/${wkoCode}`);
    return res.data;
  };

  //(동적)작업진행목록 페이지에서 작업지시서, 생산실적 테이블로 검색조회
  const wipList = ref([]);
  const wipLoading = ref(false);
  const wipError = ref(null);

  const wkoName = ref('');

  const fetchWorkInProcess = async (overrideParams = null) => {
    wipLoading.value = true;
    wipError.value = null;

    try {
      const params = overrideParams ?? {
        wko: wko.value || undefined,
        wkoName: wkoName.value || undefined,
        name: name.value || undefined,
        line: line.value || undefined,
        from: from.value || undefined,
        to: to.value || undefined,
      };

      const res = await axios.get('/api/produce/workInProcessList', { params });
      wipList.value = res.data;
    } catch (e) {
      console.error(e);
      wipError.value = e;
      wipList.value = [];
    } finally {
      wipLoading.value = false;
    }
  };

  // 작업진행조회 검색 버튼
  const searchWip = async () => {
    await fetchWorkInProcess();
  };

  // 작업진행조회 초기화 버튼
  const resetWip = async () => {
    from.value = '';
    to.value = '';
    line.value = '';
    name.value = '';
    wko.value = '';
    wkoName.value = '';
    await fetchWorkInProcess();
  };

  const wipDetail = ref(null);

  // 작업진행 상세 조회
  const fetchWorkInProcessDetail = async (wkoCode) => {
    if (!wkoCode) return;
    const res = await axios.get(`/api/produce/workInProcessDetail/${wkoCode}`);
    wipDetail.value = res.data;
  };

  //라인별 설비목록 불러오기 (하단 부분에)
  const lineEquipments = ref([]);

  const fetchEquipmentsByLine = async (lineCode) => {
    if (!lineCode) return;

    const res = await axios.get(`/api/produce/equipmentByLine/${lineCode}`);
    lineEquipments.value = res.data;
  };

  //공정명 드롭다운에 표시하고 공정명 선택하면 그 공정에 대한 설비 자동선택
  const processOptions = ref([]);
  const selectedProcess = ref(null);

  const fetchProcessByWko = async (wkoCode) => {
    const res = await axios.get(`/api/produce/wkprocessByPrdCode/${wkoCode}`);
    processOptions.value = res.data;
  };

  //작업시작 버튼 눌렀을 때
  const startWork = async ({ wko_code, prdr_code, line_eq_code, input_qtt }) => {
    const res = await axios.post('/api/produce/workStart', {
      wko_code,
      prdr_code,
      line_eq_code,
      input_qtt
    });
    return res.data;
  };

  // 설비 카드 상태 목록
  const prdrStatusList = ref([]);

  const fetchPrdrStatusByWko = async (wkoCode) => {
    const res = await axios.get(`/api/produce/prdrByWko/${wkoCode}`);
    prdrStatusList.value = res.data;
  };

  // 설비 상세
  const prdrDDetail = ref(null);

  //가져와서 채우기
  const fetchPrdrDDetail = async (prdrDCode) => {
    const res = await axios.get(`/api/produce/prdrDDetail/${prdrDCode}`);
    prdrDDetail.value = res.data;
  };

  const endWork = async (payload) => {
    const res = await axios.post('/api/produce/workEnd', payload);
    return res.data;
  };

  return {
    wkoList,
    loading,
    error,
    from,
    to,
    stat,
    line,
    name,
    wko,
    lines,
    fetchLines,
    fetchWorkOrders,
    search,
    reset,
    fetchPrdpActive,
    prdpList,
    prdpLoading,
    prdpError,
    allProducts,
    fetchAllPrdDistinct,
    prdpItems,
    fetchPrdpItems,
    saveWorkOrder,
    deleteWorkOrderByWkoCode,
    wipList,
    wipLoading,
    wipError,
    wkoName,
    fetchWorkInProcess,
    searchWip,
    resetWip,
    wipDetail,
    fetchWorkInProcessDetail,
    lineEquipments,
    fetchEquipmentsByLine,
    fetchProcessByWko,
    processOptions,
    selectedProcess,
    startWork,
    prdrStatusList,
    fetchPrdrStatusByWko,
    prdrDDetail,
    fetchPrdrDDetail,
    endWork
  };
});
