import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductionStore = defineStore('production', {
  // state
  state: () => ({
    productionPlan: [],
    prdpList: [],
    orderList: [],
    prodList: [],
    lineList: [],
    planProdList: []
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

    // 생산계획 검색
    async fetchPrdps(data) {
      try {
        const response = await axios.get('/api/produce/prdpList', {
          params: data
        });
        this.prdpList = response.data;
        return this.prdpList;
      } catch (err) {
        console.log(err);
      }
    },

    // 생산계획 상세 제품 조회
    async fetchPlanProds(data) {
      try {
        const response = await axios.get(`/api/produce/planProd/${data}`);
        this.planProdList = response.data;
        return this.planProdList;
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

    // 제품 검색
    async fetchProds(data) {
      try {
        const response = await axios.get('/api/produce/prodList', {
          params: data
        });
        this.prodList = response.data;
        return this.prodList;
      } catch (err) {
        console.log(err);
      }
    },

    // 라인 검색
    async fetchLines(data) {
      try {
        const response = await axios.get('/api/produce/lineList', {
          params: data
        });
        this.lineList = response.data;
        return this.lineList;
      } catch (err) {
        console.log(err);
      }
    }
  },
  persist: true
});
