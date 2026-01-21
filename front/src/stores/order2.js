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
    // 출고 조회 + 검색
    async fetchOutbound(searchParams = {}) {
      try {
        // 날짜 포맷 함수
        const formatDateForAPI = (date) => {
          if (!date) return null;
          const d = new Date(date);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        // 검색 파라미터 구성
        const params = {};

        if (searchParams?.outCode) params.out_req_code = searchParams.outCode;
        if (searchParams?.prodCode) params.prod_code = searchParams.prodCode;
        if (searchParams?.outQtyStart) params.req_qtt_min = searchParams.outQtyStart;
        if (searchParams?.outQtyEnd) params.req_qtt_max = searchParams.outQtyEnd;
        if (searchParams?.empCode) params.emp_code = searchParams.empCode;
        if (searchParams?.vendorCode) params.client_code = searchParams.vendorCode;
        if (searchParams?.dateStart) params.date_start = formatDateForAPI(searchParams.dateStart);
        if (searchParams?.dateEnd) params.date_end = formatDateForAPI(searchParams.dateEnd);

        const res = await axios.get(`/api${url}/outbounds`, { params });
        // console.log('api 응답: ', res.data);

        this.outboundList = res.data;
        // console.log('Pinia state: ', this.outboundList);
      } catch (err) {
        console.error('출고 조회 실패: ', err);
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
