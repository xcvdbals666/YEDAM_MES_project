import { defineStore } from 'pinia';
import axios from 'axios';

export const useQuality1Store = defineStore('quality', {
  state: () => ({
    qcrInfo: [], // qcr_tbl 검사 종류
    qiOrderList: [], // 검사지시서 전체 조회
    qiOrderThing: [], // 불러온 검사지 대상 정보
    qiProduceList: [], // 생산실적 중 검사지시서에 없는 것들
    qiMpoList: [], // 발주서 상세에 있는 목록들

    // 결과서 관리
    qirProdInfo: [], // 검사지시서 불러오기(생산일경우)
    qirList: [], // 검사결과서서 불러오기
    state: 0 // 상태 판별
  }),
  actions: {
    //  qcr_tbl 검사 종류(전체)
    async fetchQcrInfo() {
      const response = await axios.get('/api/quality/qiorder');
      this.qcrInfo = response.data;
      console.log('qcrInfo: ', this.qcrInfo);
      return this.qcrInfo;
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
    },

    // 불러온 검사지 대상 정보
    async fetchOrderItemInfo(id) {
      const response = await axios.get('/api/quality/qiorderiteminfo/' + id);
      this.qiOrderThing = response.data;
      console.log('qiOrderThing: ', this.qiOrderThing);

      return this.qiOrderThing;
    },

    // 생산실적 불러오기
    async fetchQiProduceList() {
      const response = await axios.get('/api/quality/qiproducelist');
      response.data.forEach((data) => {
        let date = new Date(data.end_date);
        data.end_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      });
      this.qiProduceList = response.data;
      console.log('qiProduceList: ', this.qiProduceList);

      return this.qiProduceList;
    },

    // 발주서 상세에 있는 목록 불러오기
    async fetchQiMpoList() {
      const response = await axios.get('/api/quality/qimpolist');
      this.qiMpoList = response.data;
      console.log('qiMpoList: ', this.qiMpoList);
      return this.qiMpoList;
    },

    // 검사지시서 등록
    async submitMinbndQi(data) {
      console.log('전송데이터: ', data);
      const response = await axios.post('api/quality/submitqiorderform', data);
      console.log('검사지시서 등록완료', response);
    },

    // 검사결과서 관리
    // 검사지 전체 조회
    async fetchQirQioOrderList() {
      const response = await axios.get('/api/quality/qirqiorderlist');
      response.data.forEach((data) => {
        console.log(data);
        let date = new Date(data.qio_date);
        data.qio_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      });
      this.qiOrderList = response.data;
      console.log('qiOrderList: ', this.qiOrderList);
      return this.qiOrderList;
    },

    // 검사결과서 등록
    async submitQiResult(data) {
      const sleep = (ms) => {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      };
      console.log('전송데이터: ', data);
      const response = await axios.post('api/quality/submitqiresult', data);
      await sleep(200);

      console.log('검사지시서 등록완료', response);
    },

    // 검사지 정보 불러오기(생산일 경우)
    async fetchQirProdInfo(data) {
      const response = await axios.get('/api/quality/qirprodinfo/' + data);
      this.qirProdInfo = response.data;
      console.log('생산정보: ', this.qirProdInfo);
      return this.qirProdInfo;
    },

    // 검사결과서 목록 불러오기
    async fetchQirList() {
      const response = await axios.get('/api/quality/qirlist/');
      response.data.forEach((data) => {
        let date = new Date(data.start_date);
        data.start_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      });
      this.qirList = response.data;
      console.log('결과서 목록: ', this.qirList);

      return this.qirList;
    },

    // 검사결과서 수정
    async fetchModifyQirList(data) {
      const response = await axios.put('/api/quality/modifyqirlist', data);
      console.log('결과서 수정: ', response);
    }
  }
});
