// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 게시글 전체 목록
const findAll = async () => {
  let list = await mysql.query("selectAll", [], "produce");
  return list;
};

//전체 작업지시서 조회
const findAllWkotbl = async () => {
  const list = await mysql.query("selectAllWkotbl", [], "produce");
  return list;
}

//전체 생산계획서 조회
const findAllPrdp = async () => {
  const list = await mysql.query("selectAllPrdp", [], "produce");
  return list;
}

module.exports = {
  findAll,
  findAllWkotbl,
  findAllPrdp,
};
