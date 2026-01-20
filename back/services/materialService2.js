// 순수 기능에 대한 정의 => 함수(function)
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
    const like = `%${keyword}%`;
    params.push(like, like);
  }
  sql += ` ORDER BY e.emp_code `;
  return mysql.rquery(sql, params);
};

// 다음 요청번호 생성
const findMaxMprCode = async () => {
  const mprCode = await mysql.query("selectMaxMprCode", [], "material2");
  const last = mprCode[0]?.last_code || "MPR-000";

  // 숫자만 꺼냄
  const lastNum = Number(last.replace("MPR-", ""));
  const nextNum = lastNum + 1;

  return `MPR-${String(nextNum).padStart(3, "0")}`;
};

// 자재 선택 - 자재 정보 조회
const findByMatCodeMatTbl = async () => {
  const list = await mysql.query("selectByMatCodeMatTbl", [], "material2");
  return list;
};

module.exports = {
  findByEmpcodeEmpTbl,
  findByMatCodeMatTbl,
  findMaxMprCode,
};
