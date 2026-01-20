import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductionStore = defineStore('production', {
  // state
  state: () => ({
    productionPlan: [],
    orderList: []
  }),
  // getters

  // actions
  actions: {
    // 생산계획 조회
    async fetchProdPlan(data) {
      try {
        const response = await axios.get('/api/produce/planList', {
          params: data
        });
        this.productionPlan = response.data;
        return this.productionPlan;
      } catch (err) {
        console.log(err);
      }
    },

    // 주문 검색
    async fetchOrders(data) {
      try {
        const response = await axios.get('/api/produce/orderList', {
          params: data
        });
        this.orderList = response.data;
        return this.orderList;
      } catch (err) {
        console.log(err);
      }
    },

    async fetchProds(data) {
      try {
        const response = await axios.get('/api/produce/prodList', {
          params: data
        });
        this.orderList = response.data;
        return this.orderList;
      } catch (err) {
        console.log(err);
      }
    },

    async fetchLines(data) {
      try {
        const response = await axios.get('/api/produce/lineList', {
          params: data
        });
        this.orderList = response.data;
        return this.orderList;
      } catch (err) {
        console.log(err);
      }
    }
  },
  persist: true
});
