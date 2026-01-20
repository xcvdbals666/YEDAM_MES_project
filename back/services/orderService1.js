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
module.exports = {
  findAllOrder,
  findAllClient,
  findAllEmployees,
  findAllProducts,
  findOrderDetailByCode,
};
