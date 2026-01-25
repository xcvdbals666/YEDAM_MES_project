import { defineStore } from 'pinia';
import axios from 'axios';

export const useQuality1Store = defineStore('quality', {
  state: () => ({
    qcrInfo: [], // qcr_tbl 검사 종류
    qiOrderList: [], // 검사지시서 전체 조회
    qiOrderThing: [], // 불러온 검사지 대상 정보
    qiProduceList: [], // 생산실적 중 검사지시서에 없는 것들
    qiMpoList: [], // 발주서 상세에 있는 목록들
    qiProdInfo: [], // 검사지시서 생산품 선택시

    // 결과서 관리
    qirProdInfo: [], // 검사지시서 불러오기(생산일경우)
    qirList: [], // 검사결과서서 불러오기
    realQirList: [], // 검사결과서 원본 목록
    state: 0, // 상태 판별

    // 검사항목 관리
    qcrList: [] // 품질기준정보 전체 불러오기
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

    // 불러온 검사지 대상 정보(자재)
    async fetchOrderItemInfo(id) {
      const response = await axios.get('/api/quality/qiorderiteminfo/' + id);
      this.qiOrderThing = response.data;
      console.log('qiOrderThing: ', this.qiOrderThing);

      return this.qiOrderThing;
    },
    // 불러온 검사지 대상 정보(생산)
    async fetchOrderProdInfo(id) {
      const response = await axios.get('/api/quality/qiorderProdinfo/' + id);
      this.qiProdInfo = response.data[0];
      console.log('qiProdInfo: ', this.qiProdInfo);

      return this.qiProdInfo;
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

      if (response.data.affectedRows == 1) {
        alert('검사지시서 등록완료');
      }
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
      console.log('전송데이터: ', data);
      const response = await axios.post('api/quality/submitqiresult', data);
      console.log('전송결과: ', response);
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
      this.realQirList = response.data;
      this.qirList = response.data;
      for (let i = 0; i < this.qirList.length; i++) {
        console.log(this.qirList[i].qio_code);
        if (i > 0) {
          if (this.qirList[i].qio_code == this.qirList[i - 1].qio_code) {
            response.data.splice(i, 1);
            i--;
          }
        }
      }
      console.log('결과서 목록: ', this.qirList);

      return this.qirList;
    },

    // 검사결과서 수정
    async fetchModifyQirList(data) {
      const response = await axios.put('/api/quality/modifyqirlist', data);
      console.log('결과서 수정: ', response);
    },

    // 검사 결과서 삭제
    async fetchRemoveQir(data) {
      console.log(data);
      const response = await axios.delete('/api/quality/removeqir/' + data);
      if ((response.data.affectedRows = 1)) {
        alert('삭제완료');
      }
    },

    // 품질기준정보관리
    // 품질기준 정보 불러오기
    async fetchQcrList() {
      const response = await axios.get('/api/quality/qcrlist');
      this.qcrList = response.data;
      console.log('품질기준정보: ', this.qcrList);
      return this.qcrList;
    }
  }
});
