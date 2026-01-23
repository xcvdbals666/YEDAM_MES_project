// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
// 주문 및 주문상세 등록
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
// 주문 및 주문상세 수정(상세는 추가도 가능함.)
const modifyOrder = async (order, orderDetail) => {
  let ordCode = order.ord_code;
  delete order.ord_code;
  delete order.client_name;
  delete order.ord_date;
  delete order.ord_priority;
  delete order.stat_note;
  delete order.mname;
  const detailValues = orderDetail.map((item) => [
    item.ord_d_code,
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
  console.log(orderDetail);
  console.log(detailValues);
  let detail = await mysql.query("deleteDetail", [ordCode], "order1");
  let orderResult = await mysql.query(
    "updateOrder",
    [order, ordCode],
    "order1",
  );
  let detailResult = await mysql.query(
    "updateDetail",
    [detailValues],
    "order1",
  );
  return { order: orderResult, detail: detailResult };
};
// 주문 삭제
const removeOrder = async (ordCode) => {
  let result;
  let detail = await mysql.query("deleteDetail", [ordCode], "order1");
  let order = await mysql.query("deleteOrder", [ordCode], "order1");
  if (order.affectedRows > 0 || detail.affectedRows > 0) {
    result = `삭제완료`;
  } else {
    result = `삭제실패`;
  }

  return result;
};
// 상태 가져오기
const findStats = async () => {
  let result = await mysql.query("");
};
// ai활용
module.exports = {
  findAllOrder,
  findAllClient,
  findAllEmployees,
  findAllProducts,
  findOrderDetailByCode,
  addOrder,
  modifyOrder,
  removeOrder,
};
