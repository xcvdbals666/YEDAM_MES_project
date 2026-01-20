// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 검사지시서 관리
// 게시글 전체 목록
const findAllQiOrderCheckList = async () => {
  let list = await mysql.query("selectAllQiOrderCheckList", [], "quality1");
  return list;
};

// 재고목록 전체 불러오기
const findAllMinbndList = async () => {
  let list = await mysql.query("selectAllMinbndList", [], "quality1");
  return list;
};

// 검사지 전체 불러오기
const findAllQiOrderList = async () => {
  let list = await mysql.query("selectAllQiOrderList", [], "quality1");
  return list;
};

module.exports = {
  findAllQiOrderCheckList,
  findAllMinbndList,
  findAllQiOrderList,
};
