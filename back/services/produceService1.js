// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

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

//라인 조회 (드롭다운용)
const findAllLinesDJ = async () => {
  const list = await mysql.query("selectAllLinesDJ", [], "produce1");
  return list;
};

//생산계획 (due_date가 오늘날짜 기준 최근 60일까지만) 조회 - 모달 선택용 리스트
const findPrdpActive = async () => {
  const list = await mysql.query("selectPrdpActive", [], "produce1");
  return list;
};

//작업지시서 : 생산계획 상세 + 제품명 + 공정유형 가져오기 (prdp_code로 가져오기)
const findPrdpDetail = async (prdpCode) => {
  const list = await mysql.query("selectPrdpDetail", [prdpCode], "produce1");
  return list;
};

//제품 목록 중복없이 조회
const findAllPrdDistinct = async () => {
  const list = await mysql.query("selectAllPrdDistinct", [], "produce1");
  return list;
};

//공정유형 조회
const findAllPoType = async () => {
  const list = await mysql.query("selectAllPoType", [], "produce1");
  return list;
}

module.exports = {
  searchWorkOrders,
  findAllLinesDJ,
  findPrdpActive,
  findPrdpDetail,
  findAllPrdDistinct,
  findAllPoType,
};
