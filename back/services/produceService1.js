// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

//전체 생산계획서 조회
const findAllPrdp = async (data) => {
  const { name, prdpStart, prdpEnd, dueStart, dueEnd } = data;
  const prdpName = `%name%`;
  let list = await mysql.query("selectAllPrdp", [], "produce1");
  return list;
};

//전체 작업지시서 조회
const findAllWkotbl = async () => {
  const list = await mysql.query("selectAllWkotbl", [], "produce1");
  return list;
};

//동적쿼리 검색기능 + 전체 작업지시서 조회
const searchWorkOrders = async ({ from, to, stat, line, name, wko }) => {
  let sql = `
    SELECT wko_code, wko_name, line_code, start_date, end_date, stat, wko_qtt
    FROM wko_tbl
    WHERE 1=1
  `;
  const params = [];

  if (from) {
    sql += ` AND start_date >= ?`;
    params.push(from + " 00:00:00");
  }
  if (to) {
    sql += ` AND start_date <= ?`;
    params.push(to + " 23:59:59");
  }
  if (stat) {
    sql += ` AND stat = ?`;
    params.push(stat);
  }
  if (line) {
    sql += ` AND line_code = ?`;
    params.push(line);
  }
  if (name) {
    sql += ` AND wko_name LIKE ?`;
    params.push(`%${name}%`);
  }
  if (wko) {
    sql += ` AND wko_code LIKE ?`;
    params.push(`%${wko}%`);
  }

  sql += ` ORDER BY reg_date DESC`;

  return await mysql.rquery(sql, params);
};

module.exports = {
  findAllWkotbl,
  findAllPrdp,
  searchWorkOrders,
};
