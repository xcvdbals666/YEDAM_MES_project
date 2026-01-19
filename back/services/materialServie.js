// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 작성자 선택 - 사원 정보 조회
const findByEmpcodeEmpTbl = async () => {
  let list = await mysql.query("selectByEmpcodeEmpTbl", [], "material");
  return list;
};

// 자재 선택 - 자재 정보 조회
const findByMatCodeMatTbl = async () => {
  let list = await mysql.query("selectByMatCodeMatTbl", [], "material");
  return list;
};

module.exports = {
  findByEmpcodeEmpTbl,
  findByMatCodeMatTbl,
};
