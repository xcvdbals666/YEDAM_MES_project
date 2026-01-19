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
    async fetchEmployees() {
      const response = await axios.get(`/material/emp`);
      console.log(response.data);
      this.employees = response.data;
    }
  },
  persist: true
});
