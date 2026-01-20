import { defineStore } from 'pinia';
import axios from 'axios';

const url = '/api/order';

export const useOrderStore = defineStore('order', {
  // state
  state: () => ({
    clients: [],
    employees: [],
    products: [],
    orders: [],
    details: []
  }),
  actions: {
    // 거래처 목록 불러오기
    async getClient() {
      let list = await axios.get(`${url}/clientList`);
      this.clients = list.data;
    },
    // 영업부서 직원 불러오기
    async getEmployees() {
      let list = await axios.get(`${url}/employeeList`);
      this.employees = list.data;
    },
    // 완제품 목록 불러오기
    async getProducts() {
      let list = await axios.get(`${url}/productList`);
      this.products = list.data;
    },
    // 주문 목록 불러오기
    async getOrders() {
      let list = await axios.get(`${url}/orders`);
      this.orders = list.data;
    },
    // 주문 상세 불러오기
    async getOrderDetail(ordCode) {
      let list = await axios.get(`${url}/details/${ordCode}`);
      this.details = list.data;
    },
    converUnit(unit) {
      if (unit == 'h1') {
        return 'kg';
      } else if (unit == 'h2') {
        return 't';
      } else if (unit == 'h3') {
        return 'L';
      } else if (unit == 'h4') {
        return 'ea';
      } else if (unit == 'h5') {
        return 'box';
      } else if (unit == 'h6') {
        return 'g';
      } else if (unit == 'h7') {
        return 'mm';
      } else if (unit == 'h8') {
        return '%';
      } else if (unit == 'h9') {
        return 'cm';
      } else if (unit == 'ha') {
        return 'N';
      }
    },
    convertSpec(spec) {
      if (spec == 'o2') {
        return '40';
      } else if (spec == 'o4') {
        return '20';
      } else if (spec == 'o6') {
        return '16';
      } else if (spec == 'oa') {
        return '20';
      }
    },
    convertComVal(val) {
      if (val == 'j1') {
        return '봉지라면';
      } else if (val == 'j2') {
        return '컵라면';
      } else return null;
    }
  },
  persist: true
});
