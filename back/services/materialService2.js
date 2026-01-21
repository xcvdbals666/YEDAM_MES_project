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

// 자재구매요청 조회
const findByMprCodeMprTbl = async (keyword) => {
  let sql = `SELECT m.mpr_code, m.reqdate, m.deadline, m.mrp_code, m.mcode,
                    CASE WHEN COUNT(d.mat_code) = 1 THEN MIN(mt.mat_name)
                         ELSE CONCAT(MIN(mt.mat_name),' 외 ', COUNT(d.mat_code) - 1, '건')
                    END AS mat_summary
             FROM mpr_tbl m
             LEFT JOIN mpr_d_tbl d ON d.mpr_code = m.mpr_code
             LEFT JOIN mat_tbl mt ON mt.mat_code = d.mat_code
             WHERE 1=1`;

  const params = [];

  // 요청번호
  if (keyword.mprCode) {
    sql += " AND m.mpr_code LIKE ?";
    params.push(`%${keyword.mprCode}%`);
  }

  // 요청일자 기간
  if (keyword.reqDateFrom && keyword.reqDateTo) {
    sql += " AND m.reqdate BETWEEN ? AND ?";
    params.push(keyword.reqDateFrom, keyword.reqDateTo);
  } else if (keyword.reqDateFrom) {
    sql += " AND m.reqdate >= ?";
    params.push(keyword.reqDateFrom);
  } else if (keyword.reqDateTo) {
    sql += " AND m.reqdate <= ?";
    params.push(keyword.reqDateTo);
  }

  // 납기일자 기간
  if (keyword.deadlineFrom && keyword.deadlineTo) {
    sql += " AND m.deadline BETWEEN ? AND ?";
    params.push(keyword.deadlineFrom, keyword.deadlineTo);
  } else if (keyword.deadlineFrom) {
    sql += " AND m.deadline >= ?";
    params.push(keyword.deadlineFrom);
  } else if (keyword.deadlineTo) {
    sql += " AND m.deadline <= ?";
    params.push(keyword.deadlineTo);
  }

  // MRP
  if (keyword.mrpCode) {
    sql += " AND m.mrp_code LIKE ?";
    params.push(`%${keyword.mrpCode}%`);
  }

  // 요청자
  if (keyword.mcode) {
    sql += " AND m.mcode LIKE ?";
    params.push(`%${keyword.mcode}%`);
  }

  sql +=
    " GROUP BY m.mpr_code, m.reqdate, m.deadline, m.mrp_code, m.mcode ORDER BY m.mpr_code DESC";

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

// 자재구매요청 상세 정보 조회 - 요청자재상세
const findByMprCodeMprDTbl = async (mprCode) => {
  const list = await mysql.query(
    "selectByMprCodeMprDTbl",
    mprCode,
    "material2",
  );
  return list;
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
  findByMprCodeMprDTbl,
};
