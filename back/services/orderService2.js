// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 출고 조회
const findAllOutreqtbl = async () => {
  let list = await mysql.query("selectAllOutreqtbl", [], "order2");
  return list;
};

// 주문 선택 모달
const findByOrderOrdTbl = async (keyword) => {
  let sql = `
    SELECT o.ord_code, od.prod_code, p.prod_name, od.ord_amount, o.ord_name, o.ord_date
    FROM ord_tbl o
    JOIN ord_d_tbl od ON o.ord_code = od.ord_code
    JOIN prod_tbl p ON od.prod_code = p.prod_code
    WHERE 1=1
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        o.ord_code LIKE ?
        OR o.ord_name LIKE ?
      )
    `;
    const like = `%${keyword}%`;
    params.push(like, like);
  }
  sql += ` ORDER BY o.ord_code `;
  return mysql.rquery(sql, params);
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

// 출고 조회 검색
const findSearchOutreqtbl = async (params) => {
  const queryParams = [
    params.out_req_code || null,
    params.out_req_code || null,
    params.prod_code || null,
    params.prod_code || null,
    params.emp_code || null,
    params.emp_code || null,
    params.client_code || null,
    params.client_code || null,
    params.req_qtt_min || null,
    params.req_qtt_min || null,
    params.req_qtt_max || null,
    params.req_qtt_max || null,
    params.date_start || null,
    params.date_start || null,
    params.date_end || null,
    params.date_end || null,
  ];

  let list = await mysql.query("searchOutreqtbl", queryParams, "order2");
  return list;
};

// 주문 정보 단건 조회
const findByOrdcode = async (ord_code) => {
  let info = await mysql.query("selectByOrdcode", [ord_code], "order2");
  return info;
};

// 주문 제품 목록 조회
const findProductsByOrdcode = async (ord_code) => {
  let list = await mysql.query("selectProdList", [ord_code], "order2");
  return list;
};

// 주문 정보 + 제품 목록 조회 + 출고코드 생성
const findOrderDetailForOutbound = async (ord_code) => {
  // Promise.all(): 여러 개의 비동기 작업을 동시에 실행하고 모두 끝날 때까지 기다림
  const [orderInfo, products, outCode] = await Promise.all([
    mysql.query("selectByOrdcode", [ord_code], "order2"),
    mysql.query("selectProdList", [ord_code], "order2"),
    mysql.query("generateOutCode", [], "order2"),
  ]);

  return {
    orderInfo: orderInfo[0] || null, // 주문 정보는 1개
    products: products, // 제품은 배열
    out_req_code: outCode[0].new_out_req_code,
  };
};

module.exports = {
  findAllOutreqtbl,
  findByOrderOrdTbl,
  findByOutcodeOutTbl,
  findByCodeProdTbl,
  findByCodeClientTbl,
  findByEmpcodeEmpTbl,
  findSearchOutreqtbl,
  findByOrdcode,
  findProductsByOrdcode,
  findOrderDetailForOutbound,
};
