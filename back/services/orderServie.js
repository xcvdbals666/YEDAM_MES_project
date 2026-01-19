// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 주문 전체 조회
const findAllOrder = async () => {
  let list = await mysql.orderQuery("selectAllOrder");
  return list;
};
// 공급업체 목록 조회
const findAllClient = async () => {
  let list = await mysql.orderQuery("selectAllClient");
  return list;
};

module.exports = {
  findAllOrder,
  findAllClient,
};
