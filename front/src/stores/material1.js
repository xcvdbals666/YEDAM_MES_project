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
    mprList: []
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
    // 작성자 정보 불러오기
    async fetchMrpMaterials(mrpCode) {
      const response = await axios.get(`/material/mrp/${mrpCode}`);
      this.materials = response.data.map((item) => ({
        ...item,
        selected: false
      }));
      this.mpoData.mprCode = mrpCode;
      return this.materials;
    },
    //mrp목록 조회
    async fetchMprList() {
      const response = await axios.get('/material/mpr');
      this.mprList = response.data;
      return this.mprList;
    },
    // mpr 검색
    async searchMprList(keyword) {
      try {
        if (!keyword) {
          // 검색어 없으면 전체 조회
          const response = await axios.get('/material/mpr');
          this.mprList = response.data;
        } else {
          // 검색어 있으면 검색
          const response = await axios.get(`/material/mpr/search/${keyword}`);
          this.mprList = response.data;
        }
        return this.mprList;
      } catch (err) {
        console.log(err);
      }
    },
    persist: true
  }
});
