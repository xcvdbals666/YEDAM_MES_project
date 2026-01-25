// 서비스
// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

//품질 검사 지시 목록 검색
const findQiOrderList = async (qio_code) => {
  const params = qio_code ? [qio_code] : [""];
  return await mysql.query("selectQiOrderList", params, "quality2");
};

// 검사지 전체 불러오기
const findAllQiOrderList = async () => {
  let list = await mysql.query("selectAllQiOrderList", [], "quality2");
  return list;
};

//품질 검사 결과 목록 조회
const findAllResultList = async () => {
  let list = await mysql.query("selectAllQiResultList", [], "quality2");
  return list;
};

//품질 검사 결과 목록 상세
const findResultDetail = async () => {
  let list = await mysql.query("selectResultDetail", [], "quality2");
  return list;
};


module.exports = {
  findQiOrderList,
  findAllQiOrderList,
  findAllResultList,
  findResultDetail,
};
