import { defineStore } from 'pinia';
import axios from 'axios';

export const useMaterialStore = defineStore('material', {
  // state
  state: () => ({
    employees: []
  }),
  // getters
  // actions
  actions: {
    // 작성자 정보 불러오기
    async fetchEmployees({ keyword }) {
      const response = await axios.get(`/material/emp`, { params: { keyword: keyword || '' } });
      this.employees = response.data;
    }
  },
  persist: true
});
