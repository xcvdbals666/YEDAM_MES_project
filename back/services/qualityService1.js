// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 게시글 전체 목록
const findAllQiOrderCheckList = async () => {
  let list = await mysql.query("selectAllQiOrderCheckList", [], "quality");
  return list;
};

module.exports = {
  findAllQiOrderCheckList,
};
