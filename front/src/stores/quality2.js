//스토어
import { defineStore } from 'pinia';
import axios from 'axios';

export const useQualityStore2 = defineStore('quality2', {
  // state
  state: () => ({
    qiResultList: [],
    qiOrderList: []
  }),

  // getter

  //action
  actions: {
    // 품질검사 목록조회
    async fetchQiOrderList({ keyword } = {}) {
      const res = await axios.get(`/api/quality/qi-order`, {
        params: { keyword }
      });
      this.qiOrderList = res.data;
    },

    // 검사지시서 전체 불러오기
    async fetchOrderList() {
      try {
        const response = await axios.get(`/api/quality/qiorderlist`);

        this.qiOrderList = response.data.map((data) => ({
          ...data,
          // 날짜 문자열 그대로 사용 → 하루 줄어들 일 없음
          qio_date: data.qio_date?.slice(0, 10),
          insp_date: data.insp_date?.slice(0, 10)
        }));

        console.log('qiOrderList:', this.qiOrderList);
        return this.qiOrderList;
      } catch (err) {
        console.error(err);
        return [];
      }
    },

    // 품질 검사 결과 목록 조회
    async fetchQiResultList({ keyword } = {}) {
      const res = await axios.get(`/api/quality/qioresultlist`, {
        params: { keyword }
      });
      this.qiResultList = res.data;
    }
  },
  persist: true
});
