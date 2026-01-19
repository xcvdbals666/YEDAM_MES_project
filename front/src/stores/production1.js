// src/stores/production1.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useProductionsStore = defineStore('productions', () => {
  const wkoList = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // 검색조건(화면 input이 v-model로 연결할 값들)
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

      console.log('응답 첫 행:', wkoList.value?.[0]);
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
    fetchWorkOrders,
    search,
    reset
  };
});
