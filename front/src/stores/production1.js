// src/stores/production1.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useProductionsStore = defineStore('productions', () => {
  const wkoList = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const lines = ref([]); //라인 드롭다운으로 받아오게

  //라인목록 조회
  const fetchLines = async () => {
    const res = await axios.get('/produce/allLineList');
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

      const res = await axios.get('/produce/workorderList', { params });
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

  //##########################
  //모달 리스트띄우기
  //##########################

  //로딩중인지, 에러났는지 상태관리
  const prdpList = ref([]);
  const prdpLoading = ref(false);
  const prdpError = ref(null);

  const fetchPrdpActive = async () => {
    prdpLoading.value = true; // = 리스트 로딩중
    prdpError.value = null;

    try {
      const res = await axios.get('/produce/prdpListActive');
      prdpList.value = res.data;
    } catch (e) {
      prdpError.value = e; //에러발생시
    } finally {
      prdpLoading.value = false; //리스트 로딩 끝나면 다시 false
    }
  };

  //#########################
  //모달 끝
  //#########################

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
    prdpError
  };
});
