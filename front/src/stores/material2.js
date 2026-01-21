import { defineStore } from 'pinia';
import axios from 'axios';

export const useMaterialStore = defineStore('material2', {
  // state
  state: () => ({
    employees: [],
    materials: [],
    mrpCode: [],
    requestList: [],
    clientList: [],
    mprList: []
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

    // 재고 정보 불러오기
    async fetchMaterials({ keyword }) {
      const response = await axios.get(`/api/material/mat-info`, { params: { keyword: keyword || '' } });
      this.materials = response.data;
    },

    // 재고구매요청
    async insertMpr(payload) {
      const response = await axios.post('/api/material/mat-request', payload);
      console.log(payload);
      return response.data;
    },

    // 자재구매요청 정보 조회
    async fetchRequest(keyword) {
      const response = await axios.get('/api/material/mat-request', { params: keyword });
      this.requestList = response.data;
    },

    // 자재구매요청서 전체 목록 조회
    async fetchMprList({ keyword }) {
      const response = await axios.get('/api/material/mprList', { params: { keyword: keyword || '' } });
      this.mprList = response.data;
    },

    // 공급업체 목록 조회
    async fetchClientList({ keyword }) {
      const response = await axios.get('/api/material/clientList', { params: { keyword: keyword || '' } });
      this.clientList = response.data;
    }
  },
  persist: true
});
