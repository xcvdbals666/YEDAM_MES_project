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
  console.log("newQio_code: :", qio_code);

  try {
    if (data.mat_type == "i3") {
      const { insp_date, insp_vol, mpo_d_code, mat_type } = data;
      console.log("전송 데이터:", [qio_code, insp_date, insp_vol, mpo_d_code]);
      let list = await mysql.query(
        "insertQio_tbl",
        [qio_code, insp_date, insp_vol, mpo_d_code],
        "quality1",
      );
      return list;
    } else {
      const { insp_date, insp_vol, prdr_code, mat_type } = data;
      console.log("전송 데이터:", [qio_code, insp_date, insp_vol, prdr_code]);
      let list = await mysql.query(
        "insertQio_tblPro",
        [qio_code, insp_date, insp_vol, prdr_code],
        "quality1",
      );
      return list;
    }
  } catch (err) {
    console.error(err);
  }
};

// 검사지시서 삭제
const removeqiorder = async (id) => {
  let list = await mysql.query("deleteQiOrder", [id], "quality1");
  return list;
};

// 검사 결과서 관리
// 검사 지시서 전체 조회
const findAllQirQiOrder = async () => {
  let list = await mysql.query("selectAllQirQioOrder", [], "quality1");
  return list;
};

// 결과서 등록
const addQiResultForm = async (data) => {
  const [rows] = await mysql.query("createQirCode", [], "quality1");
  let qir_code = rows.newQir;
  console.log("newQio_code: :", qir_code);

  try {
    if (data.mat_type == "i3" || data.mat_type == "i4") {
      const { qio_code, qcr_code, mpo_d_code } = data;
      console.log("전송 데이터:", [qir_code, qio_code, qcr_code, mpo_d_code]);
      let list = await mysql.query(
        "insertQir_tbl",
        [qir_code, qio_code, qcr_code, mpo_d_code],
        "quality1",
      );
      return list;
    } else {
      const { qio_code, qcr_code } = data;
      console.log("전송 데이터:", [qir_code, qio_code, qcr_code]);
      let list = await mysql.query(
        "insertQir_tblPro",
        [qir_code, qio_code, qcr_code],
        "quality1",
      );
      return list;
    }
  } catch (err) {
    console.error(err);
  }
};
// 검사지 정보 불러오기(생산일 경우)
const findQirProdInfo = async (id) => {
  let list = await mysql.query("selectQirProdInfo", [id], "quality1");
  return list;
};

// 검사결과서 정보 불러오기
const findQirList = async (id) => {
  let list = await mysql.query("selectQirList", [], "quality1");
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
  addQiResultForm,
  findAllQirQiOrder,
  findQirProdInfo,
  findQirList,
};
