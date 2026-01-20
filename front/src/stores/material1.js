import { defineStore } from 'pinia';
import axios from 'axios';

export const useMaterialStore = defineStore('material', {
  // state
  state: () => ({
    //발주기본정보
    mpoData: {
      purchaseCode: '',
      purchaseReqDate: new Date(),
      mcode: '',
      stat: '요청완료',
      mprCode: '',
      note: ''
    },
    //자재목록
    materials: [],
    //mpr 모달용
    mprList: [],
    //mat 모달용
    matList: []
  }),
  // getters
  getters: {
    //선택된 자재만 반환
    getSelectMaterials: (state) => {
      return state.materials.filter((m) => m.selected);
    }
  },

  // actions
  actions: {
    // MPR 선택 → 요청서에 포함된 자재 조회 (상세)
    async fetchMprMaterials(mprCode) {
      const response = await axios.get(`/material/mpr/${mprCode}`, { headers: { 'Cache-Control': 'no-cache' } });

      this.materials = response.data.map((item) => ({
        ...item,
        selected: false
      }));
      this.mpoData.mprCode = mprCode;
      return this.materials;
    },

    // MPR 목록 조회 (모달용)
    async fetchMprList() {
      const response = await axios.get('/material/mpr', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      this.mprList = response.data;
      return this.mprList;
    },

    // 자재 전체 조회 (모달용)
    async fetchMatList() {
      const response = await axios.get('/material/mat');
      this.matList = response.data;
      return this.matList;
    },

    // MPR 검색
    async searchMprList(keyword) {
      try {
        if (!keyword) {
          return await this.fetchMprList();
        } else {
          const response = await axios.get(`/material/mpr/search/${keyword}`, { headers: { 'Cache-Control': 'no-cache' } });
          this.mprList = response.data;
          return this.mprList;
        }
      } catch (err) {
        console.log(err);
      }
    }
  },
  persist: true
});
