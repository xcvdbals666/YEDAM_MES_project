const mysql = require("../database/mapper.js");

// 생산계획서 조회
const findAllPrdp = async (data) => {
  const { code, name, prdpStart, prdpEnd, dueStart, dueEnd } = data;
  let sql = `SELECT * FROM prdp_tbl WHERE 1=1`;
  const params = [];
  if (code) {
    sql += ` AND prdp_code LIKE ?`;
    params.push(`%${code}%`);
  }
  if (name) {
    sql += ` AND prdp_name LIKE ?`;
    params.push(`%${name}%`);
  }
  sql += ` AND prdp_date BETWEEN ? AND ?`;
  params.push(prdpStart, prdpEnd);
  sql += ` AND due_date BETWEEN ? AND ?`;
  params.push(dueStart, dueEnd);
  let list = await mysql.rquery(sql, params);
  return list;
};

// 생산계획 검색
const findByCodeOrNamePrdp = async (data) => {
  const query = `%${data.q}%`;
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
  const prodCode = data.prod;
  let list = await mysql.query(
    "selectByCodeOrNameLine",
    [query, query, prodCode],
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

// 생산계획 삭제
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

// 자재 검색
const findByCodeOrNameMat = async (data) => {
  const query = `%${data.q}%`;
  let list = await mysql.query(
    "selectByCodeOrNameMat",
    [query, query],
    "produce2",
  );
  return list;
};

// BOM 불러오기
const findBomMat = async (data) => {
  const { prdpCode } = data;
  let list = await mysql.query(
    "selectBomMat",
    [prdpCode, prdpCode],
    "produce2",
  );
  return list;
};

// MRP 조회
const findAllMrp = async (data) => {
  const { mrpCode, prdpCode, prdpName, matName, mrpStart, mrpEnd } = data;
  let sql = `
  SELECT d.mrp_d_code, m.mrp_code, m.prdp_code, p.prdp_name, mt.mat_name, d.req_qtt, cu.note AS unit, m.plan_date, m.mrp_note
  FROM mrp_tbl m
  LEFT JOIN mrp_d_tbl d ON m.mrp_code = d.mrp_code
  LEFT JOIN prdp_tbl p ON p.prdp_code = m.prdp_code
  JOIN common_code cu ON cu.com_value = d.unit
  JOIN mat_tbl mt ON mt.mat_code = d.mat_code
  WHERE 1=1`;

  const params = [];
  if (mrpCode) {
    sql += ` AND m.mrp_code LIKE ?`;
    params.push(`%${mrpCode}%`);
  }
  if (prdpCode) {
    sql += ` AND m.prdp_code LIKE ?`;
    params.push(`%${prdpCode}%`);
  }
  if (prdpName) {
    sql += ` AND m.prdp_name LIKE ?`;
    params.push(`%${prdpName}%`);
  }
  if (matName) {
    sql += ` AND mt.mat_name LIKE ?`;
    params.push(`%${matName}%`);
  }
  sql += ` AND m.plan_date BETWEEN ? AND ?`;
  params.push(mrpStart, mrpEnd);

  let list = await mysql.rquery(sql, params);
  return list;
};

// MRP 상세 조회
const findByCodeMrpDetail = async (data) => {
  const { mrpCode } = data;
  let resObj = { info: {}, matList: [] };
  resObj.info = await mysql.query("selectByCodeMrp", [mrpCode], "produce2");
  resObj.matList = await mysql.query(
    "selectByCodeMrpDetail",
    [mrpCode],
    "produce2",
  );
  return resObj;
};

// MRP 저장
const modifyMrp = async (data) => {
  const { mat, info } = data;
  let mrpCode = info.mrpCode;
  let resObj = { status: "success", mrpCode: "" };
  // mrp 저장
  try {
    let mrpResult = null;
    if (info.mrpCode.startsWith("MRP")) {
      mrpResult = await mysql.query(
        "updateMrp",
        [
          info.planDate.slice(0, 10),
          info.startDate.slice(0, 10),
          info.note,
          info.prdpCode,
          info.reg,
          info.mrpCode,
        ],
        "produce2",
      );
    } else {
      const day = `${info.planDate.slice(0, 4)}${info.planDate.slice(5, 7)}${info.planDate.slice(8, 10)}`;
      const number =
        Number(
          (await mysql.query("selectMaxCodeMrp", [day], "produce2"))[0].number,
        ) + 1;
      mrpCode = `MRP-${day}-${String(number).padStart(3, "0")}`;
      mrpResult = await mysql.query(
        "insertMrp",
        [
          mrpCode,
          info.planDate.slice(0, 10),
          info.startDate.slice(0, 10),
          info.note,
          info.prdpCode,
          info.reg,
        ],
        "produce2",
      );
    }
    resObj.mrpCode = mrpCode;
    // MRP 자재목록 저장
    for (const data of mat) {
      let result = null;
      if (data.is_delete) {
        // 행 삭제
        result = await mysql.query(
          "deleteMrpDetail",
          [data.mrp_d_code],
          "produce2",
        );
      } else if (data.mrp_d_code.startsWith("MRP")) {
        // 행 수정
        result = await mysql.query(
          "updateMrpDetail",
          [data.req_qtt, data.mrp_d_code],
          "produce2",
        );
      } else {
        const number =
          Number(
            (await mysql.query("selectMaxCodeMrpDetail", null, "produce2"))[0]
              .number,
          ) + 1;
        const mrp_d_code = `MRP-D-${String(number).padStart(4, "0")}`;
        result = await mysql.query(
          "insertMrpDetail",
          [mrp_d_code, data.unit, data.req_qtt, mrpCode, data.mat_code],
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

// 생산실적 조회
const findAllPrdr = async (data) => {
  const { prdrCode, prodName, startDate, endDate, workOrderCode } = data;
  let sql = `
  SELECT pr.*, pd.prod_name
  FROM prdr_tbl pr
  JOIN prod_tbl pd ON pr.prod_code = pd.prod_code
  WHERE 1=1`;
  const params = [];
  if (prdrCode) {
    sql += ` AND pr.prdr_code LIKE ?`;
    params.push(`%${prdrCode}%`);
  }
  if (prodName) {
    sql += ` AND pd.prod_name LIKE ?`;
    params.push(`%${prodName}%`);
  }
  if (workOrderCode) {
    sql += ` AND pr.work_order_code LIKE ?`;
    params.push(`%${workOrderCode}%`);
  }
  sql += ` AND pr.start_date >= ? AND pr.end_date <= ?`;
  params.push(startDate, `${endDate} 23:59:59`);

  let list = await mysql.rquery(sql, params);
  return list;
};

// 작업 진행 조회
const findByCodePrdrDetail = async (data) => {
  const { lineCode, wkoCode } = data;
  let list = await mysql.query(
    "selectByCodePrdrDetail",
    [lineCode, wkoCode],
    "produce2",
  );
  return list;
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
  findByCodeOrNameMat,
  findBomMat,
  findAllMrp,
  findByCodeMrpDetail,
  modifyMrp,
  findAllPrdr,
  findByCodePrdrDetail,
};
