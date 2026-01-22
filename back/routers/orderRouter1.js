const express = require("express");
const router = express.Router();

const orderService = require("../services/orderService1.js");

// 주문 전체 조회
router.get(`/orders`, async (req, res) => {
  let list = await orderService.findAllOrder();
  res.send(list);
});
// 주문 상세 조회
router.get(`/details/:code`, async (req, res) => {
  let code = req.params.code;
  let list = await orderService.findOrderDetailByCode(code);
  res.send(list);
});
// 거래처 목록조회
router.get(`/clientList`, async (req, res) => {
  let list = await orderService.findAllClient();
  res.send(list);
});

// 직원 전체 조회
router.get(`/employeeList`, async (req, res) => {
  let list = await orderService.findAllEmployees();
  res.send(list);
});

// 완제품 전체 조회
router.get(`/productList`, async (req, res) => {
  let list = await orderService.findAllProducts();
  res.send(list);
});

// 주문 등록
router.post(`/order`, async (req, res) => {
  let { order, orderDetail } = req.body;
  let result = await orderService.addOrder(order, orderDetail);
  res.send(result);
});
// 주문 수정
router.put(`/order`, async (req, res) => {
  let { order, orderDetail } = req.body;
  let result = await orderService.modifyOrder(order, orderDetail);
  res.send(result);
});
// 주문 삭제
router.delete(`/order/:code`, async (req, res) => {
  let ordCode = req.params.code;
  let result = await orderService.removeOrder(ordCode);
  res.send(result);
});
module.exports = router;
