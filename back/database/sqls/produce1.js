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
  start_date
FROM prdp_tbl
WHERE (due_date IS NULL OR due_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY))
ORDER BY due_date DESC, prdp_date DESC;
`;

module.exports = {
  selectAllWkotbl,
  selectAllLinesDJ,
  selectPrdpActive,
};
