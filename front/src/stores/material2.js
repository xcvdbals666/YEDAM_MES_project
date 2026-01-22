import { defineStore } from 'pinia';
import axios from 'axios';

export const useMaterialStore = defineStore('material2', {
  // state
  state: () => ({
    employees: [], // 작성자 정보
    materials: [], // 자재 정보
    mrpCode: [], // mrpCode 정보
    requestList: [], // 자재구매요청 조회 정보
    clientList: [], // 공급업체 정보
    mprList: [], // 자재구매요청서 정보
    mprHeaders: null, // 자재구매요청 상세 조회 - 요청기본정보
    mprItems: [] // 자재구매요청 상세 조회 - 요청 자재 상세 정보
  }),
  // getters
  // actions
  actions: {
    // 작성자 정보 불러오기
    async fetchEmployees({ keyword }) {
      const response = await axios.get(`/api/material/emp`, { params: { keyword: keyword || '' } });
      this.employees = response.data;
    },

    // mrp code 불러오기
    async fetchMrpCode() {
      const response = await axios.get(`/api/material/getMrpCode`);
      // console.log(response.data);
      this.mrpCode = response.data;
      return this.mrpCode;
    },

    // 자재 정보 불러오기
    async fetchMaterials({ keyword }) {
      const response = await axios.get(`/api/material/mat-info`, { params: { keyword: keyword || '' } });
      this.materials = response.data;
    },

    // 자재구매요청
    async insertMpr(payload) {
      const response = await axios.post('/api/material/mat-request', payload);
      console.log(payload);
      return response.data;
    },

    // 자재구매요청 조회
    async fetchRequest(keyword) {
      const response = await axios.get('/api/material/mpr-request', { params: keyword });
      this.requestList = response.data;
    },

    // 자재구매요청 상세 정보 조회 - 요청기본정보
    async fetchDetailHeader(mprCode) {
      const response = await axios.get(`/api/material/mpr-request/${mprCode}/header`);
      this.mprHeaders = response.data;
    },

    // 자재구매요청 상세 조회 - 요청 자재 상세
    async fetchDetailItem(mprCode) {
      const response = await axios.get(`/api/material/mpr-request/${mprCode}/items`);
      this.mprItems = response.data;
    },

    // 자재구매요청서 전체 목록 조회
    async fetchMprList({ keyword }) {
      const response = await axios.get('/api/material/mpr-list', { params: { keyword: keyword || '' } });
      this.mprList = response.data;
    },

    // 공급업체 목록 조회
    async fetchClientList({ keyword }) {
      const response = await axios.get('/api/material/client-list', { params: { keyword: keyword || '' } });
      this.clientList = response.data;
    }
  },
  persist: true
});
