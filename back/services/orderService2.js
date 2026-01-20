// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 출고 조회
const findAllOutreqtbl = async () => {
  let list = await mysql.query("selectAllOutreqtbl", [], "order2");
  return list;
};

// 출고 번호 선택 모달
const findByOutcodeOutTbl = async (keyword) => {
  let sql = `
    SELECT r.out_req_code, r.out_req_date, r.ord_code, c.client_name, 
           d.ord_amount, d.out_req_d_amount, o.ord_stat
    FROM out_req_tbl r
    JOIN client_tbl c ON c.client_code = r.client_code
    JOIN out_req_d_tbl d ON d.out_req_code = r.out_req_code
    JOIN ord_tbl o ON o.ord_code = r.ord_code
    WHERE 1=1
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        r.out_req_code LIKE ?
        OR r.ord_code LIKE ?
        OR c.client_name LIKE ?
      )
    `;
    const like = `%${keyword}%`;
    params.push(like, like, like);
  }
  sql += ` ORDER BY r.out_req_code `;
  return mysql.rquery(sql, params);
};

// 출고 제품 선택 모달
const findByCodeProdTbl = async (keyword) => {
  let sql = `
    SELECT prod_code, prod_name, com_value
    FROM prod_tbl
    WHERE 1=1
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        prod_code LIKE ?
        OR prod_name LIKE ?
      )
    `;
    const like = `%${keyword}%`;
    params.push(like, like);
  }
  sql += ` ORDER BY prod_code `;
  return mysql.rquery(sql, params);
};

// 거래처 선택 모달
const findByCodeClientTbl = async (keyword) => {
  let sql = `
    SELECT client_code, client_name
    FROM client_tbl
    WHERE 1=1
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        client_code LIKE ?
        OR client_name LIKE ?
      )
    `;
    const like = `%${keyword}%`;
    params.push(like, like);
  }
  sql += ` ORDER BY client_code `;
  return mysql.rquery(sql, params);
};

// 출고 담당자 선택 모달
const findByEmpcodeEmpTbl = async (keyword) => {
  let sql = `
    SELECT emp_code, emp_name
    FROM emp_tbl
    WHERE 1=1
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        emp_code LIKE ?
        OR emp_name LIKE ?
      )
    `;
    const like = `%${keyword}%`;
    params.push(like, like);
  }
  sql += ` ORDER BY emp_code `;
  return mysql.rquery(sql, params);
};

module.exports = {
  findAllOutreqtbl,
  findByOutcodeOutTbl,
  findByCodeProdTbl,
  findByCodeClientTbl,
  findByEmpcodeEmpTbl,
};
