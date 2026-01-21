//스토어
import { defineStore } from 'pinia';
import axios from 'axios';

export const useQualityStore2 = defineStore('quality2', {
  // state
  state: () => ({
    qiOrderList: []
  }),

  // getter

  //action
  actions: {
    // 품질검사 목록조회
    async fetchQiOrderList({ keyword }) {
      const res = await axios.get(`/api/quality/qi-order`, { params: keyword });
      this.qiOrderList = res.data;
    },

    // 검사지시서 전체 불러오기
    async fetchOrderList() {
      const response = await axios.get('/api/quality/qiorderlist');
      response.data.forEach((data) => {
        let date = new Date(data.qio_date);
        data.qio_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      });
      this.qiOrderList = response.data;
      console.log('qiOrderList: ', this.qiOrderList);
      return this.qiOrderList;
    }
  },
  persist: true
});
