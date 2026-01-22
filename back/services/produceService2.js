const mysql = require("../database/mapper.js");

// 생산계획서 조회
const findAllPrdp = async (data) => {
  const { code, name, prdpStart, prdpEnd, dueStart, dueEnd } = data;
  const prdpCode = `%${code}%`;
  const prdpName = `%${name}%`;
  let list = await mysql.query(
    "selectAllPrdp",
    [prdpCode, prdpName, prdpStart, prdpEnd, dueStart, dueEnd],
    "produce2",
  );
  return list;
};

// 생산계획 검색
const findByCodeOrNamePrdp = async (data) => {
  const query = `%${data.q}`;
  let list = await mysql.query(
    "selectByCodeOrNamePrdp",
    [query, query],
    "produce2",
  );
  return list;
};

// 생산계획 상세 제품 조회
const findPrdpDetail = async (data) => {
  const { prdpCode } = data;
  let list = await mysql.query("selectPrdpDetail", [prdpCode], "produce2");
  return list;
};

// 주문 검색
const findByCodeOrNameOrd = async (data) => {
  const query = `%${data.q}%`;
  let list = await mysql.query(
    "selectByCodeOrNameOrd",
    [query, query],
    "produce2",
  );
  return list;
};

// 제품 검색
const findByCodeOrNameProd = async (data) => {
  const query = `%${data.q}%`;
  const type = query === "봉지라면" ? "J1" : query === "컵라면" ? "J2" : "";
  let list = await mysql.query(
    "selectByCodeOrNameProd",
    [query, query, type],
    "produce2",
  );
  return list;
};

// 라인 검색
const findByCodeOrNameLine = async (data) => {
  const query = `%${data.q}%`;
  let list = await mysql.query(
    "selectByCodeOrNameLine",
    [query, query],
    "produce2",
  );
  return list;
};

// 생산계획 저장
const modifyPrdp = async (data) => {
  const { prod, info } = data;
  let prdpCode = info.prdpCode;
  let resObj = { status: "success", prdpCode: "" };
  // 생산계획 저장
  try {
    let prdpResult = null;
    if (info.prdpCode.startsWith("PRDP")) {
      prdpResult = await mysql.query(
        "updatePrdp",
        [
          info.prdpName,
          info.startDate.slice(0, 10),
          info.endDate.slice(0, 10),
          info.ordCode,
          info.dueDate.slice(0, 10),
          info.note,
          info.prdpCode,
        ],
        "produce2",
      );
    } else {
      const month = `${info.prdpDate.slice(0, 4)}${info.prdpDate.slice(5, 7)}`;
      const number =
        Number(
          (await mysql.query("selectMaxCodePrdp", [month], "produce2"))[0]
            .number,
        ) + 1;
      prdpCode = `PRDP-${month}-${String(number).padStart(4, "0")}`;
      prdpResult = await mysql.query(
        "insertPrdp",
        [
          prdpCode,
          info.prdpName,
          info.prdpDate.slice(0, 10),
          info.startDate.slice(0, 10),
          info.endDate.slice(0, 10),
          info.dueDate.slice(0, 10),
          info.note,
          info.ordCode,
          info.reg,
        ],
        "produce2",
      );
    }
    resObj.prdpCode = prdpCode;
    // 생산계획 상세 제품 목록 저장
    for (const data of prod) {
      let result = null;
      if (data.is_delete) {
        // 행 삭제
        result = await mysql.query(
          "deletePrdpDetail",
          [data.prdp_d_code],
          "produce2",
        );
      } else if (data.prdp_d_code.startsWith("PRDP")) {
        // 행 수정
        result = await mysql.query(
          "updatePrdpDetail",
          [
            data.prod_code,
            data.planned_qtt,
            data.priority,
            data.line_code,
            data.prdp_d_code,
          ],
          "produce2",
        );
      } else {
        // 행 추가
        const number =
          Number(
            (await mysql.query("selectMaxCodePrdpDetail", null, "produce2"))[0]
              .number,
          ) + 1;
        const prdp_d_code = `PRDP-D-${String(number).padStart(4, "0")}`;
        result = await mysql.query(
          "insertPrdpDetail",
          [
            prdp_d_code,
            data.planned_qtt,
            data.priority,
            data.prod_code,
            info.reg,
            prdpCode,
            data.line_code,
          ],
          "produce2",
        );
      }
    }
  } catch (err) {
    resObj.status = "fail";
    console.log(err);
  }
  return resObj;
};

const removePrdp = async (data) => {
  const { prdpCode } = data;
  const resObj = { status: "success" };
  try {
    await mysql.query("deleteDetailPrdp", [prdpCode], "produce2");
    await mysql.query("deletePrdp", [prdpCode], "produce2");
  } catch (err) {
    resObj.status = "fail";
    console.log(err);
  }
  return resObj;
};

module.exports = {
  findAllPrdp,
  findByCodeOrNamePrdp,
  findPrdpDetail,
  findByCodeOrNameOrd,
  findByCodeOrNameProd,
  findByCodeOrNameLine,
  modifyPrdp,
  removePrdp,
};
