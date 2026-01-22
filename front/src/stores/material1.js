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
      mcodeName: '',
      stat: '요청완료',
      mprCode: '',
      note: ''
    },
    //자재목록
    materials: [],
    //mpr 모달용
    mprList: [],
    //mat 모달용
    matList: [],
    //mpo 모달용
    mpoList: []
  }),

  // getters
  getters: {
    getSelectMaterials: (state) => {
      return state.materials.filter((m) => m.selected);
    }
  },

  // actions
  actions: {
    // MPR 관련
    // MPR 선택 → 요청서에 포함된 자재 조회
    async fetchMprMaterials(mprCode) {
      const response = await axios.get(`/api/material/mpr/${mprCode}`, { headers: { 'Cache-Control': 'no-cache' } });
      this.materials = response.data.map((item) => ({
        ...item,
        delivery_date: item.delivery_date ? new Date(item.delivery_date) : new Date(),
        selected: false
      }));
      this.mpoData.mprCode = mprCode;
      return this.materials;
    },
    // 초기화 함수 추가
    resetStore() {
      this.mpoData = {
        purchaseCode: '',
        purchaseReqDate: new Date(),
        mcode: '',
        mcodeName: '',
        stat: '요청완료',
        mprCode: '',
        note: ''
      };
      this.materials = [];
      this.mprList = [];
      this.matList = [];
      //this.mpoList = [];
    },

    // MPR 목록 조회 (모달용)
    async fetchMprList() {
      const response = await axios.get('/api/material/mpr', { headers: { 'Cache-Control': 'no-cache' } });
      this.mprList = response.data;
      return this.mprList;
    },

    // MPR 검색
    async searchMprList(keyword) {
      try {
        if (!keyword) {
          return await this.fetchMprList();
        } else {
          const response = await axios.get(`/api/material/mpr/search/${keyword}`, { headers: { 'Cache-Control': 'no-cache' } });
          this.mprList = response.data;
          return this.mprList;
        }
      } catch (err) {
        console.log(err);
      }
    },

    // MPO 관련
    // 발주서 목록 조회 (모달용)
    async fetchMpoList() {
      const response = await axios.get('/api/material/mpo', { headers: { 'Cache-Control': 'no-cache' } });
      this.mpoList = response.data;
      return this.mpoList;
    },

    // 발주서 검색(모달용)
    async searchMpoList(keyword) {
      try {
        if (!keyword) {
          return await this.fetchMpoList();
        } else {
          const response = await axios.get(`/api/material/mpo/search/${keyword}`, { headers: { 'Cache-Control': 'no-cache' } });
          this.mpoList = response.data;
          return this.mpoList;
        }
      } catch (err) {
        console.log(err);
      }
    },

    //발주서 상세 검색
    async searchMpoDetail(params) {
      const response = await axios.get('/api/material/mpo/search/detail', {
        params
      });
      this.mpoList = response.data;
      return this.mpoList;
    },

    // 발주서 상세 조회 (기본정보 + 자재목록)
    async fetchMpoDetail(purchaseCode) {
      const [mpoRes, detailRes] = await Promise.all([axios.get(`/api/material/mpo/${purchaseCode}`), axios.get(`/api/material/mpo/${purchaseCode}/detail`)]);

      console.log('기본정보:', mpoRes.data);
      console.log('자재상세:', detailRes.data); // 이거 뭐라고 나와?

      // 기본정보 세팅
      const mpo = mpoRes.data[0];
      this.mpoData = {
        purchaseCode: mpo.purchase_code,
        purchaseReqDate: mpo.purchase_req_date || '',
        mcode: mpo.mcode,
        mcodeName: mpo.emp_name || '',
        stat: mpo.stat,
        mprCode: mpo.mpr_code || '',
        note: mpo.note || ''
      };
      // 자재목록 세팅 (날짜 변환)
      this.materials = detailRes.data.map((item) => ({
        ...item,
        delivery_date: item.deadline ? new Date(item.deadline) : null
      }));

      return { mpo: mpoRes.data, details: detailRes.data };
    },

    // 발주서 저장
    async saveMpo(payload) {
      const response = await axios.post('/api/material/mpo', payload);
      return response.data;
    },
    // 발주서 수정
    async updateMpo(payload) {
      const response = await axios.put(`/api/material/mpo/${payload.purchase_code}`, payload);
      return response.data;
    },
    // 발주서 삭제
    async deleteMpo(purchaseCode) {
      const response = await axios.delete(`/api/material/mpo/${purchaseCode}`);
      return response.data;
    },

    // 자재 관련
    // 자재 전체 조회 (모달용)
    async fetchMatList() {
      const response = await axios.get('/api/material/mat');
      this.matList = response.data;
      return this.matList;
    }
  },
  persist: true
});
