import { defineStore } from 'pinia';
import axios from 'axios';

export const useQuality1Store = defineStore('quality', {
  state: () => ({
    qcrInfo: [], // qcr_tbl 검사 종류
    qiOrderList: [] // 검사지시서 전체 조회
  }),
  actions: {
    //  qcr_tbl 검사 종류(전체)
    async fetchQcrInfo() {
      const response = await axios.get('/api/qiorder');
      this.qcrInfo = response.data;
      console.log('qcrInfo: ', this.qcrInfo);
      return this.qcrInfo;
    },

    // 검사지시서 전체 불러오기
    async fetchOrderList() {
      const response = await axios.get('/api/qiorderlist');
      this.qiOrderList = response.data;
      console.log('qiOrderList: ', this.qiOrderList);
      return this.qiOrderList;
    }
  }
});
