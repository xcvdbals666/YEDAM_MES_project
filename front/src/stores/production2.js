import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductionStore = defineStore('production', {
  // state
  state: () => ({
    productionPlan: []
  }),
  // getters

  // actions
  actions: {
    async fetchProductions() {
      try {
        const response = await axios.get('/produce/productionPlan');
        this.productionPlan = response.data;
        return this.productionPlan;
      } catch (err) {
        console.log(err);
      }
    }
  },
  persist: true
});
