import { defineStore } from 'pinia';
import axios from 'axios';

const url = '/order';

export const useOrderStore2 = defineStore('order2', {
  // state
  state: () => ({
    outboundList: [],
    orderCode: [],
    outboundCode: [],
    outboundProd: [],
    outboundClient: [],
    employees: [],
    selectedOrder: null,
    orderDetail: null,
    products: [],
    outReqCode: ''
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
    },

    // 주문 선택 모달
    async fetctOrdCode({ keyword }) {
      try {
        const response = await axios.get(`/api/order/order-code`, { params: { keyword: keyword || '' } });
        this.orderCode = response.data;
      } catch (error) {
        console.error('주문 번호 조회 실패:', error);
      }
    },

    // 선택한 주문 번호 스토어에 저장
    setSelectedOrder(orderData) {
      this.selectedOrder = orderData;
    },

    // 선택한 주문 번호의 정보 조회
    async fetchOrderDetailByProdCode(ordCode) {
      try {
        const response = await axios.get(`/api/order/order-detail/${ordCode}`);

        this.orderDetail = response.data.orderInfo;
        this.products = response.data.products;
        this.outReqCode = response.data.out_req_code;
        console.log(this.orderDetail);
        console.log(this.products);

        return response.data;
      } catch (error) {
        console.error('주문 상세 조회 실패:', error);
        throw error;
      }
    },

    // 출고 요청 관련 데이터 초기화
    resetOutboundRequest() {
      this.selectedOrder = null;
      this.orderDetail = null;
      this.products = [];
      this.outReqCode = '';
    }
  },
  persist: true
});
