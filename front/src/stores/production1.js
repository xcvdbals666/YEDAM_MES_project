// src/stores/production1.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useProductionsStore = defineStore('productions', () => {
  const wkoList = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const lines = ref([]); //라인 드롭다운으로 받음

  //라인목록 조회
  const fetchLines = async () => {
    const res = await axios.get('/api/produce/allLineList');
    lines.value = res.data;
  };

  // 검색조건
  const from = ref('');
  const to = ref('');
  const stat = ref('');
  const line = ref('');
  const name = ref('');
  const wko = ref('');

  // 목록 조회(검색 포함)
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

  //검색 버튼
  const search = async () => {
    await fetchWorkOrders();
  };

  //초기화 버튼
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
  const prdpItemsLoading = ref(false);
  const prdpItemsError = ref(null);

  const fetchPrdpItems = async (prdpCode) => {
    prdpItemsLoading.value = true;
    prdpItemsError.value = null;

    try {
      const res = await axios.get(`/api/produce/prdpDetail/${prdpCode}`);
      prdpItems.value = res.data;
      return res.data;
    } catch (e) {
      console.error(e);
      prdpItemsError.value = e;
      prdpItems.value = [];
      throw e;
    } finally {
      prdpItemsLoading.value = false;
    }
  };

  // 작업지시서 저장 액션
  const insertWorkOrder = async (formData) => {
    try {
      const res = await axios.post('/api/produce/workorderInsert', formData);
      return res.data;
    } catch (e) {
      console.error('작업지시서 저장 중 에러 발생:', e);
      throw e;
    }
  };

  //불러온 작업지시서 삭제하기
  const deleteWorkOrderByWkoCode = async (wkoCode) => {
    const res = await axios.delete(`api/produce/workOrderRemove/${wkoCode}`);
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
    prdpItemsLoading,
    prdpItemsError,
    fetchPrdpItems,
    insertWorkOrder,
    deleteWorkOrderByWkoCode
  };
});
