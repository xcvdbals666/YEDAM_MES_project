const mysql = require("../database/mapper.js");

// 작성자 선택 - 사원 정보 조회
const findByEmpcodeEmpTbl = async (keyword) => {
  let sql = `
    SELECT e.emp_code, e.emp_name, d.dept_name
    FROM emp_tbl e
    JOIN dept_tbl d ON e.dept_code = d.dept_code
    WHERE 1=1
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        e.emp_code LIKE ?
        OR e.emp_name LIKE ?
      )
    `;
    const like = `%${keyword || ""}%`;
    params.push(like, like);
  }
  sql += ` ORDER BY e.emp_code `;
  return mysql.rquery(sql, params);
};

// 다음 요청번호 생성(프론트용)
const findMaxMprCode = async () => {
  const mprCode = await mysql.query("selectMaxMprCode", [], "material2");
  const last = mprCode[0]?.last_code || "MPR-000";

  // 숫자만 꺼냄
  const lastNum = Number(last.replace("MPR-", ""));
  const nextNum = lastNum + 1;

  return `MPR-${String(nextNum).padStart(3, "0")}`;
};

// mrp code 조회
const findAllMrpCodeMrpTbl = async () => {
  const list = await mysql.query("selectAllMrpCodeMrpTbl", [], "material2");
  return list;
};

// 자재 선택 - 자재 정보 조회
const findByMatCodeMatTbl = async (keyword) => {
  const like = `%${keyword || ""}%`;
  const list = await mysql.query("selectByMatCodeMatTbl", like, "material2");
  return list;
};

// 자재구매요청
const addMprTbl = async ({ request, requestDetail }) => {
  // mpr_code 생성
  const rows = await mysql.query("selectMaxMprCode", [], "material2");
  const last = rows[0]?.last_code || "MPR-000";
  const mprCode = `MPR-${String(Number(last.replace("MPR-", "")) + 1).padStart(3, "0")}`;

  // 요청정보 insert
  await mysql.query(
    "insertMprTbl",
    [
      mprCode,
      request.reqDate,
      request.deadline,
      request.mrpCode,
      request.mCode,
    ],
    "material2",
  );

  // 상세요청정보 insert
  for (const mat of requestDetail) {
    const dRows = await mysql.query("selectMaxMprDCode", [], "material2");
    const lastD = dRows[0]?.last_code || "MPR-D-000";
    const mprDCode = `MPR-D-${String(Number(lastD.replace("MPR-D-", "")) + 1).padStart(3, "0")}`;

    await mysql.query(
      "insertMprDTbl",
      [
        mprDCode,
        mat.reqQtt,
        mat.unitCode,
        mat.note,
        mprCode,
        mat.matSup,
        mat.matCode,
      ],
      "material2",
    );
  }

  return { mprCode };
};

// 자재구매요청 정보 조회
const findByMprCodeMprTbl = async (keyword) => {
  // console.log("[findByMprCodeMprTbl] keyword:", keyword);
  let sql = `
    select
      concat(m.mpr_code, '-', d.mat_code) as row_key,
      m.mpr_code,
      mt.mat_name,
      d.mat_code,
      m.reqdate,
      d.req_qtt,
      d.unit,
      c.client_name
    from mpr_d_tbl d
    join mpr_tbl m on d.mpr_code = m.mpr_code
    join mat_tbl mt on d.mat_code = mt.mat_code
    join client_tbl c on d.mat_sup = c.client_code
    where 1=1
  `;

  const params = [];

  if (keyword.mprCode) {
    sql += " and m.mpr_code = ?";
    params.push(keyword.mprCode);
  }

  if (keyword.matName) {
    sql += " and mt.mat_name like ?";
    params.push(`%${keyword.matName}%`);
  }

  if (keyword.matCode) {
    sql += " and d.mat_code = ?";
    params.push(keyword.matCode);
  }

  if (keyword.reqDate) {
    sql += " and m.reqdate = ?";
    params.push(keyword.reqDate);
  }

  if (keyword.clientCode) {
    sql += " and d.mat_sup = ?";
    params.push(keyword.clientCode);
  }

  sql += " order by m.mpr_code desc, d.mpr_d_code asc";

  console.log("[SQL]", sql);
  console.log("[PARAMS]", params);

  try {
    const result = await mysql.rquery(sql, params);
    console.log("[RESULT COUNT]", result.length);
    return result;
  } catch (err) {
    console.error("[DB ERROR]", err);
    throw err;
  }
};

// 자재구매요청서 전체 목록 조회
const findAllMprTbl = async (keyword) => {
  const like = `%${keyword || ""}%`;
  const list = await mysql.query("selectAllMprTbl", like, "material2");
  return list;
};

// 공급업체 목록 조회
const findAllClientTbl = async (keyword) => {
  const like = `%${keyword || ""}%`;
  const list = await mysql.query("selectAllClientTbl", like, "material2");
  return list;
};

module.exports = {
  findByEmpcodeEmpTbl,
  findByMatCodeMatTbl,
  findMaxMprCode,
  addMprTbl,
  findAllMrpCodeMrpTbl,
  findByMprCodeMprTbl,
  findAllMprTbl,
  findAllClientTbl,
};
