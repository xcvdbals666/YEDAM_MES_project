import { defineStore } from 'pinia';
import axios from 'axios';

const url = '/order';

export const useOrderStore2 = defineStore('order2', {
  // state
  state: () => ({
    outboundList: [],
    outboundCode: [],
    outboundProd: [],
    outboundClient: [],
    employees: []
  }),
  actions: {
    // 출고 조회
    async fetchOutbound() {
      try {
        const res = await axios.get(`/api${url}/outbounds`);
        // console.log('api 응답: ', res.data);

        this.outboundList = res.data;
        // console.log('Pinia state: ', this.outboundList);
      } catch (err) {
        console.error(err);
        throw err;
      }
    },

    // 출고 번호 선택 모달
    async fetctOutCode({ keyword }) {
      try {
        const response = await axios.get(`/api/order/outbound-code`, { params: { keyword: keyword || '' } });
        this.outboundCode = response.data;
      } catch (error) {
        console.error('출고 번호 조회 실패:', error);
      }
    },

    // 출고 제품 선택 모달
    async fetchOutProd({ keyword }) {
      try {
        const response = await axios.get(`/api/order/outbound-prod`, { params: { keyword: keyword || '' } });
        this.outboundProd = response.data;
      } catch (error) {
        console.error('출고 제품 조회 실패:', error);
      }
    },

    // 거래처 선택 모달
    async fetchOutClient({ keyword }) {
      try {
        const response = await axios.get(`/api/order/outbound-client`, { params: { keyword: keyword || '' } });
        this.outboundClient = response.data;
      } catch (error) {
        console.error('거래처 조회 실패:', error);
      }
    },

    // 출고 담당자 선택 모달
    async fetchEmployees({ keyword }) {
      try {
        const response = await axios.get(`/api/order/outbound-emp`, { params: { keyword: keyword || '' } });
        this.employees = response.data;
      } catch (error) {
        console.error('출고 담당자 조회 실패:', error);
      }
    }
  },
  persist: true
});
