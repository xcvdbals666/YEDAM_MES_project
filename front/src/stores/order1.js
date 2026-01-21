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
      let productList = list.data;
      // 수정된 로직: 리스트 길이의 나머지가 0이 될 때까지 반복
      while (productList.length % 5 !== 0) {
        productList.push({
          isEmpty: true,
          emptycode: `empty-${productList.length}` // v-for key 에러 방지용
        });
      }
      this.products = productList;
    },
    // 주문 목록 불러오기
    async getOrders() {
      let list = await axios.get(`${url}/orders`);
      let orderList = list.data;
      while (orderList.length % 5 !== 0) {
        orderList.push({
          isEmpty: true,
          or_code: `empty-${orderList.length}` // v-for key 에러 방지용
        });
      }
      console.log(orderList);
      this.orders = orderList;
    },
    // 주문 상세 불러오기
    async getOrderDetail(ordCode) {
      let list = await axios.get(`${url}/details/${ordCode}`);
      this.details = list.data;
    },
    // 주문 등록
    async registerOrder(order) {
      console.log(order);
      let result = await axios.post(`${url}/order`, order);
      console.log(result.data);
    }
  },
  persist: true
});
