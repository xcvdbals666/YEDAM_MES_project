// 서비스
// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

//품질 검사 지시 목록 검색
const findQiOrderList = async (qio_code) => {
  const params = qio_code ? [qio_code] : [""];
  return await mysql.query("selectQiOrderList", params, "quality2");
};

module.exports = {
  findQiOrderList,
};
