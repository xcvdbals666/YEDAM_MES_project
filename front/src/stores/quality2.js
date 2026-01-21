//스토어
import { defineStore } from 'pinia';
import axios from 'axios';

export const useQualityStore = defineStore('quality2', {
  // state
  state: () => ({
    qiOrderList: []
  }),

  // getter

  //action
  actions: {
    async fetchQiOrderList({ keyword }) {
      const res = await axios.get(`/api/quality/qi-order`, { params: keyword });
      this.qiOrderList = res.data;
    }
  },
  persist: true
});
