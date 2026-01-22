// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 주문 전체 조회
const findAllOrder = async () => {
  let list = await mysql.query("selectAllOrder", [], "order1");
  return list;
};
const findOrderDetailByCode = async (code) => {
  let list = await mysql.query("selectOrderDetailByCode", [code], "order1");
  return list;
};
// 공급업체 목록 조회
const findAllClient = async () => {
  let list = await mysql.query("selectAllClient", [], "order1");
  return list;
};

// 영업부서 직원 전체조회
const findAllEmployees = async () => {
  let list = await mysql.query("selectAllEmployees", [], "order1");
  return list;
};
// 완제품 전체 조회
const findAllProducts = async () => {
  let list = await mysql.query("selectAllProducts", [], "order1");
  return list;
};
const addOrder = async (order, orderDetail) => {
  console.log(order);
  console.log(orderDetail);
  let result = await mysql.query("selectOrderCode", [], "order1");
  let ordCode = result[0].ord_code;
  // ord_code 받아오기
  order.ord_code = ordCode;
  order.ord_stat = "a1";
  // 주문 등록
  let rows = await mysql.query("insertOrder", [order], "order1");
  // 주문상세 데이터 정리
  const detailValues = orderDetail.map((item) => [
    item.unit,
    item.spec,
    item.ord_amount,
    item.prod_price,
    item.delivery_date,
    item.ord_priority,
    item.total_price,
    ordCode,
    item.prod_code,
  ]);
  console.log(detailValues);
  // 주문상세 등록
  let detailResult = await mysql.query(
    "insertOrderDetail",
    [detailValues],
    "order1",
  );
  return ordCode;
};
const modifyOrder = async (order, orderDetail) => {
  let ordCode = order.ord_code;
  delete order.ord_code;
  delete order.client_name;
  delete order.ord_date;
  const detailValues = orderDetail.map((item) => [
    item.unit,
    item.spec,
    item.ord_amount,
    item.prod_price,
    item.delivery_date,
    item.ord_priority,
    item.total_price,
    ordCode,
    item.prod_code,
  ]);
  let orderResult = await mysql.query(
    "updateOrder",
    [order, ordCode],
    "order1",
  );
  let detailResult = await mysql.query("updateDetail", [detailValues]);
};
module.exports = {
  findAllOrder,
  findAllClient,
  findAllEmployees,
  findAllProducts,
  findOrderDetailByCode,
  addOrder,
  modifyOrder,
};
