import { defineStore } from 'pinia';
import axios from 'axios';

const url = '/order';

export const useOrderStore2 = defineStore('order2', {
  // state
  state: () => ({
    outboundList: [], // 출고 조회 결과 목록
    outboundCode: [], // 출고 선택 모달용 - 전체 출고 코드 목록
    outboundProd: [], // 출고 제품 선택 모달용 - 전체 제품 목록
    outboundClient: [], // 거래처 선택 모달용 - 전체 거래처 목록
    employees: [], // 출고 담당자 선택 모달용 - 전체 담당자 목록

    orderCode: [], // 주문 선택 모달용 - 전체 주문 코드 목록
    selectedOrder: null, // 선택한 주문 정보 (주문 선택 모달에서 선택한 값)
    orderDetail: null, // 선택한 주문의 기본 정보 (주문일, 거래처명 등)
    outReqCode: '', // 주문 정보에서 생성된 출고요청 코드
    orderProducts: [], // 주문 선택 시 제품 목록

    requestCode: [], // 출고요청 선택 모달용 - 전체 출고요청 코드 목록
    selectedOutReq: null, // 선택한 출고요청 정보 (출고요청 선택 모달에서 선택한 값)
    outReqDetail: null, // 선택한 출고요청의 기본 정보 (출고요청일, 주문명, 거래처명 등)
    outReqProducts: [] // 출고요청 선택 시 제품 목록
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

    // 출고 선택 모달
    async fetctOutCode({ keyword }) {
      try {
        const response = await axios.get(`/api/order/outbound-code`, { params: { keyword: keyword || '' } });
        this.outboundCode = response.data;
      } catch (error) {
        console.error('출고 코드 조회 실패:', error);
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
    async fetchOrdCode({ keyword }) {
      try {
        const response = await axios.get(`/api/order/order-code`, { params: { keyword: keyword || '' } });
        this.orderCode = response.data;
      } catch (error) {
        console.error('주문 코드 조회 실패:', error);
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
        this.orderProducts = response.data.products;
        this.outReqCode = response.data.out_req_code;

        // console.log(this.orderProducts);

        return response.data;
      } catch (error) {
        console.error('주문 상세 조회 실패:', error);
        throw error;
      }
    },

    // 출고 요청 생성
    async createOutboundRequest(requestData) {
      try {
        const response = await axios.post(`/api/order/outbound-request`, requestData);
        return response.data;
      } catch (error) {
        console.error('출고 요청 생성 실패:', error);
        throw error;
      }
    },

    // 주문 관련 데이터 초기화
    resetOutboundRequest() {
      this.selectedOrder = null;
      this.orderDetail = null;
      this.orderProducts = [];
      this.outReqCode = '';
    },

    // 출고요청 선택 모달
    async fetchOutReqCode({ keyword }) {
      try {
        const response = await axios.get(`/api/order/request-code`, { params: { keyword: keyword || '' } });
        this.requestCode = response.data;
      } catch (error) {
        console.error('출고요청 코드 조회 실패:', error);
      }
    },

    // 선택한 출고요청 코드 스토어에 저장
    setSelectedOutReq(outReqData) {
      this.selectedOutReq = outReqData;
    },

    // 선택한 출고요청 코드의 정보 조회
    async fetchOutReqDetailByCode(outReqCode) {
      try {
        const response = await axios.get(`/api/order/request-detail/${outReqCode}`);

        this.outReqDetail = response.data.outReqInfo;
        this.outReqProducts = response.data.products;

        // console.log('출고요청 상세:', this.outReqDetail);
        // console.log('제품 목록:', this.outReqProducts);

        return response.data;
      } catch (error) {
        console.error('출고요청 상세 조회 실패:', error);
        throw error;
      }
    },

    // 출고 관련 데이터 초기화
    resetOutbound() {
      this.selectedOutReq = null;
      this.outReqDetail = null;
      this.outReqProducts = [];
    },

    // 제품별 로트 재고 조회
    async fetchLotsByProdCode(prod_code) {
      try {
        const response = await axios.get(`/api/order/lots/${prod_code}`);
        return response.data; // 로트 목록 반환
      } catch (error) {
        console.error('로트 조회 실패:', error);
        throw error;
      }
    },

    // 출고 등록
    async createOutbound(outboundData) {
      try {
        const response = await axios.post(`/api/order/outbound`, outboundData);
        return response.data;
      } catch (error) {
        console.error('출고 등록 실패:', error);
        throw error;
      }
    },

    // 출고 요청 취소
    async cancelOutReq(out_req_code) {
      try {
        const response = await axios.put(`/api/order/cancel`, { out_req_code });
        return response.data;
      } catch (error) {
        console.error('출고 요청 취소 실패:', error);
        throw error;
      }
    },

    // 출고 요청 수정
    async updateOutboundRequest(requestData) {
      try {
        const response = await axios.put(`/api/order/outbound-request/${requestData.outReqInfo.out_req_code}`, requestData);
        return response.data;
      } catch (error) {
        console.error('출고 요청 수정 실패:', error);
        throw error;
      }
    }
  },
  persist: true
});
