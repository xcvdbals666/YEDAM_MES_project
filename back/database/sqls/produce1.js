//전체 작업지시서 조회
const selectAllWkotbl = `
SELECT 
  wko_code,
  start_date,
  stat,
  note,
  prdp_code,
  prod_code,
  wko_qtt,
  reg_date,
  reg_code     AS writer,
  end_date,
  line_code,
  wko_name
FROM wko_tbl
`;

//라인 조회 (드롭다운용)
const selectAllLinesDJ = `
SELECT DISTINCT line_code
FROM wko_tbl
ORDER BY line_code 
`;

//생산계획 (due_date가 오늘날짜 기준 최근 60일까지만) 조회 - 모달 선택용 리스트
const selectPrdpActive = `
SELECT
  prdp_code,
  prdp_name,
  prdp_date,
  due_date,
  start_date,
  end_date
FROM prdp_tbl
WHERE (due_date IS NULL OR due_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY))
ORDER BY due_date DESC, prdp_date DESC;
`;

//작업지시서 : 생산계획 상세 + 제품명(prod_tbl에서), 공정유형(prod_proc_tbl에서) 가져오기 (prdp_code로 가져오기)
const selectPrdpDetail = `
SELECT
  d.prdp_code,
  d.prdp_d_code,
  d.prod_code,
  p.prod_name,
  d.planned_qtt,
  d.line_code,
  pp.po_type
FROM prdp_d_tbl d
JOIN prod_tbl p
  ON p.prod_code = d.prod_code
LEFT JOIN prod_proc_tbl pp
  ON pp.prod_code = d.prod_code
WHERE d.prdp_code = ?
`;

//제품 목록 중복없이 조회
const selectAllPrdDistinct = `
SELECT DISTINCT prod_name, prod_code
FROM prod_tbl
ORDER BY prod_code
`;

//작업지시서 등록하기
const insertWorkOrder = `
INSERT INTO wko_tbl
  (wko_code, start_date, stat, note, prdp_code, prod_code, emp_code, wko_qtt, reg_date, end_date, line_code, wko_name)
VALUES
  (?, ?, ?, NULL, ?, ?, NULL, ?, NOW(), ?, ?, ?)
`;

module.exports = {
  selectAllWkotbl,
  selectAllLinesDJ,
  selectPrdpActive,
  selectPrdpDetail,
  selectAllPrdDistinct,
  insertWorkOrder,
};
