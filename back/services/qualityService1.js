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

// 검사지에 해당하는 생산 및 검사항목 불러오기
const findQiProdInfo = async (qio_code) => {
  let list = await mysql.query("selectQiProdInfo", [qio_code], "quality1");
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
    if (data.mpo_d_code != null || data.mpo_d_code != undefined) {
      const { insp_date, insp_vol, mpo_d_code } = data;
      console.log("전송 데이터:", [qio_code, insp_date, insp_vol, mpo_d_code]);
      let list = await mysql.query(
        "insertQio_tbl",
        [qio_code, insp_date, insp_vol, mpo_d_code],
        "quality1",
      );
      return list;
    } else if (data.prdr_code != null || data.prdr_code != undefined) {
      const { insp_date, insp_vol, prdr_code } = data;
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
  let list = await mysql.query("selectQirList", [id], "quality1");
  return list;
};

// 검사 결과서 합격 불합격 수정
const modifyQirList = async (data) => {
  const {
    result,
    end_date,
    unpass_qtt,
    pass_qtt,
    unpass_rate,
    qio_code,
    qcr_code,
  } = data;
  let list = await mysql.query(
    "updateQirList",
    [result, end_date, unpass_qtt, pass_qtt, unpass_rate, qio_code, qcr_code],
    "quality1",
  );
  return list;
};

// 검사결과서 삭제
const removeqir = async (id) => {
  let list = await mysql.query("deleteQir", [id], "quality1");
  return list;
};

// 품질기준정보 관리
// 품질기준정보 정보 불러오기
const findAllQcrList = async () => {
  let list = await mysql.query("selecAlltQcrList", [], "quality1");
  return list;
};

// 품질기준정보 등록
const addQcrForm = async (data) => {
  try {
    if (data.com_value == "i3" || data.com_value == "i4") {
      const [rows] = await mysql.query("createBomQcrCode", [], "quality1");
      let qcr_code = rows.newQcr;
      console.log("newQcr_code: :", qcr_code);
      const {
        inspection_item,
        range_top,
        range_bot,
        com_value,
        unit,
        regdate,
        check_method,
      } = data;
      console.log("전송 데이터:", [
        inspection_item,
        range_top,
        range_bot,
        com_value,
        unit,
        regdate,
        check_method,
      ]);

      let list = await mysql.query(
        "insertQcr_tbl",
        [
          qcr_code,
          inspection_item,
          range_top,
          range_bot,
          com_value,
          unit,
          regdate,
          check_method,
        ],
        "quality1",
      );
      return list;
    } else {
      const [rows] = await mysql.query("createProdQcrCode", [], "quality1");
      let qcr_code = rows.newQcr;
      console.log("newQcr_code: :", qcr_code);

      const {
        inspection_item,
        range_top,
        range_bot,
        com_value,
        unit,
        regdate,
        check_method,
      } = data;

      console.log("전송 데이터:", [
        qcr_code,
        inspection_item,
        range_top,
        range_bot,
        com_value,
        unit,
        regdate,
        check_method,
      ]);
      let list = await mysql.query(
        "insertQcr_tbl",
        [
          qcr_code,
          inspection_item,
          range_top,
          range_bot,
          com_value,
          unit,
          regdate,
          check_method,
        ],
        "quality1",
      );
      return list;
    }
  } catch (err) {
    console.error(err);
  }
};

// 기준정보 등록 단위 공통코드 변환
const findComValue = async (id) => {
  let list = await mysql.query("selectCommonCode", [id], "quality1");
  return list;
};

// 품질기준정보 수정
const modifyQcrInfo = async (data) => {
  const {
    qcr_code,
    inspection_item,
    range_top,
    range_bot,
    unit,
    com_value,
    regdate,
    check_method,
  } = data;
  let list = await mysql.query(
    "updateQcr_tbl",
    [
      inspection_item,
      range_top,
      range_bot,
      com_value,
      unit,
      regdate,
      check_method,
      qcr_code,
    ],
    "quality1",
  );
  return list;
};

// 기준정보 삭제
const removeQcrInfo = async (id) => {
  let list = await mysql.query("deleteQcr", [id], "quality1");
  return list;
};

// 제품별 품질검사항목 선택
//생산품 정보 불러오기
const findAllProd = async () => {
  let list = await mysql.query("selectAllProd", [], "quality1");
  return list;
};

//자재 정보 불러오기
const findAllBom = async () => {
  let list = await mysql.query("selectAllBom", [], "quality1");
  return list;
};

// 제품별 검사항목 불러오기
const findAllQiList = async (id) => {
  let list = await mysql.query("selectAllQiList", [id], "quality1");
  return list;
};

// 제품별 검사항목 등록
const addQiInfo = async (data) => {
  console.log("data: ", data);
  try {
    const [rows] = await mysql.query("createNewQi", [], "quality1");
    let qi_code = rows.newQi;
    console.log("newQi: :", qi_code);
    const { prod_code, qcr_code } = data;
    console.log("전송 데이터:", [qi_code, prod_code, qcr_code]);

    let list = await mysql.query(
      "insertQi_tbl",
      [qi_code, prod_code, qcr_code],
      "quality1",
    );
    return list;
  } catch (err) {
    console.error(err);
  }
};

// 제품별 검사항목 삭제
const removeQi = async (id) => {
  let list = await mysql.query("deleteQi", [id], "quality1");
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
  modifyQirList,
  removeqir,
  findQiProdInfo,
  // 품질기준정보관리
  findAllQcrList,
  addQcrForm,
  findComValue,
  modifyQcrInfo,
  removeQcrInfo,
  // 제품별 품질검사항목 선택
  findAllProd,
  findAllBom,
  findAllQiList,
  findAllQiList,
  addQiInfo,
  removeQi,
};
