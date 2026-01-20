import { defineStore } from 'pinia';
import axios from 'axios';

export const useMaterialStore = defineStore('material2', {
  // state
  state: () => ({
    employees: [],
    materials: [],
    mrpCode: []
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
      console.log(response.data);
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
    }
  },
  persist: true
});
