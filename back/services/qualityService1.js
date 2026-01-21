// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 검사지시서 관리
// 게시글 전체 목록
const findAllQiOrderCheckList = async () => {
  let list = await mysql.query("selectAllQiOrderCheckList", [], "quality1");
  return list;
};

// 검사지 전체 불러오기
const findAllQiOrderList = async () => {
  let list = await mysql.query("selectAllQiOrderList", [], "quality1");
  return list;
};

// 검사지에 해당하는 자재 및 검사항목 불러오기
const findQiOrderItemInfo = async (qio_code) => {
  let list = await mysql.query("selectQiOrderItem", [qio_code], "quality1");
  return list;
};

// 생산실적 불러오기
const findQiProduceList = async () => {
  let list = await mysql.query("selectQiProduceList", [], "quality1");
  return list;
};

// 발주서상세 목록 불러오기
const findQiMpoList = async () => {
  let list = await mysql.query("selectQiMpoList", [], "quality1");
  return list;
};

// 검사지시서 등록
const addQiOrderForm = async (data) => {
  console.log(data);
  const [rows] = await mysql.query(
    "createQioCode",
    [data.insp_date, data.insp_date],
    "quality1",
  );
  let qio_code = rows.newQio;
  console.log(qio_code);
  const { insp_date, insp_vol, mpo_d_code } = data;
  try {
    console.log("전송 데이터:", [qio_code, insp_date, insp_vol, mpo_d_code]);

    let list = await mysql.query(
      "insertQio_tbl",
      [qio_code, insp_date, insp_vol, mpo_d_code],
      "quality1",
    );
    return list;
  } catch (err) {
    console.error(err);
  }
};

// 검사지시서 삭제
const removeqiorder = async (id) => {
  let list = await mysql.query("deleteQiOrder", [id], "quality1");
  return list;
};

module.exports = {
  findAllQiOrderCheckList,
  findAllQiOrderList,
  findQiOrderItemInfo,
  findQiProduceList,
  findQiMpoList,
  addQiOrderForm,
  removeqiorder,
};
