// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 게시글 전체 목록
const findAll = async () => {
  let list = await mysql.produceQuery("selectAll");
  return list;
};

module.exports = {
  findAll,
};
