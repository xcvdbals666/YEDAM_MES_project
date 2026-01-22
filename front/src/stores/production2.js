import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductionStore = defineStore('production', {
  // state
  state: () => ({
    prdpCode: null,
    mrpCode: null,
    productionPlan: [],
    MRP: [],
    prdpList: [],
    orderList: [],
    prodList: [],
    lineList: [],
    planProdList: [],
    materialList: []
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
    },

    // 생산계획 저장
    async savePrdp(prodList, planInfo) {
      try {
        const response = await axios.put('/api/produce/prdp', { prod: prodList, info: planInfo });
        return response.data;
      } catch (err) {
        console.log(err);
      }
    },

    // 생산계획 삭제
    async deletePrdp(prdpCode) {
      try {
        const response = await axios.delete(`/api/produce/prdp/${prdpCode}`);
        return response.data;
      } catch (err) {
        console.log(err);
      }
    },

    // 자재 검색
    async fetchMaterials(data) {
      try {
        const response = await axios.get(`/api/produce/materialList`, {
          params: data
        });
        this.materialList = response.data;
        return this.materialList;
      } catch (err) {
        console.log(err);
      }
    },

    // BOM 불러오기
    async fetchBoms(prdpCode) {
      try {
        const response = await axios.get(`/api/produce/bom/${prdpCode}`);
        return response.data;
      } catch (err) {
        console.log(err);
      }
    },

    // MRP 조회
    async fetchMRPs(data) {
      try {
        const response = await axios.get(`/api/produce/mrp`, {
          params: data
        });
        this.MRP = response.data;
        return this.MRP;
      } catch (err) {
        console.log(err);
      }
    },

    // MRP 상세조회
    async fetchMRPDetail() {
      try {
        const response = await axios.get(`/api/produce/mrp/${this.mrpCode}`);
        return response.data;
      } catch (err) {
        console.log(err);
      }
    },

    // MRP 저장
    async saveMrp(matList, mrpInfo) {
      try {
        const response = await axios.put(`/api/produce/mrp`, { mat: matList, info: mrpInfo });
        return response.data;
      } catch (err) {
        console.log(err);
      }
    }
  },
  persist: true
});
