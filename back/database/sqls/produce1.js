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
  pp.prdp_date    AS prdp_date
FROM prdp_d_tbl d
JOIN prod_tbl p
  ON p.prod_code = d.prod_code
JOIN prdp_tbl pp
  ON pp.prdp_code = d.prdp_code
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

//불러온 작업지시서 삭제하기
const deleteWorkOrder = `
DELETE FROM wko_tbl
WHERE wko_code = ?
`;

//불러온 작업지시서 수정하기
//wko_code로 된 작업지시서가 존재하는지 체크
const existsWorkOrder = `
SELECT 1
FROM wko_tbl
WHERE wko_code=?
LIMIT 1
`;

//해당 작업지시서 수정
const updateWorkOrder = `
UPDATE wko_tbl
SET
  start_date = ?,
  stat = ?,
  prdp_code = ?,
  prod_code = ?,
  wko_qtt = ?,
  end_date = ?,
  line_code = ?,
  wko_name = ?
WHERE wko_code = ?
`;

//작업진행 단건 상세조회
const selectWipDetail = `
SELECT
  w.wko_code,
  w.wko_name,
  w.wko_qtt,
  w.line_code,
  w.stat,
  w.reg_date,
  w.prod_code,
  p.prod_name,
  r.prdr_code
FROM wko_tbl w
JOIN prod_tbl p
  ON p.prod_code = w.prod_code
LEFT JOIN prdr_tbl r
  ON r.work_order_code = w.wko_code 
WHERE w.wko_code = ?
LIMIT 1
`;

//라인 기준 사용해야 할 설비 목록 뽑아오기
//ex. LINE-001에 매핑된 eq_code전부의 eq_name 띄우기
const selectEqnameByLine = `
SELECT
  ld.line_eq_code, 
  ld.line_code,
  ld.eq_code,
  e.eq_name,
  e.eq_type
FROM line_d_tbl ld
JOIN eq_tbl e
  ON e.eq_code = ld.eq_code
WHERE ld.line_code = ?     
ORDER BY ld.eq_code
`;

//선택한 wko_tbl의 prod_code로 타고가서 po_tbl에서 공정명 드롭다운 뽑기
const selectProcessDropdownByWko = `
    SELECT DISTINCT
      d.po_code,
      po.po_name,
      d.no,
      d.eq_type
    FROM wko_tbl w
    JOIN prod_proc_tbl pp
      ON pp.prod_code = w.prod_code
    JOIN prod_proc_d_tbl d
      ON d.prod_proc_code = pp.prod_proc_code
    JOIN po_tbl po
      ON po.po_code = d.po_code
    WHERE w.wko_code = ?
    ORDER BY d.no
  `;

//작업시작 버튼 누르면 필요한 쿼리
//prdr 테이블 번호생성
const selectNextPrdrSeq = `
SELECT IFNULL(
  MAX(CAST(SUBSTRING(prdr_code, 6) AS UNSIGNED)), 0
) AS maxSeq
FROM prdr_tbl
`;

//prdr_d 테이블 번호생성
const selectNextPrdrDSeq = `
SELECT IFNULL(
  MAX(CAST(SUBSTRING(prdr_d_code, 8) AS UNSIGNED)), 0
) AS maxSeq
FROM prdr_d_tbl;
`;

//prdr_tbl
const insertPrdrStart = `
INSERT INTO prdr_tbl
  (prdr_code, prod_code, start_date, work_order_code, stat, ord_qtt, emp_code)
VALUES
  (?, ?, NOW(), ?, 'b1', ?, 'EMP-10001')
`;

//prdr_d_tbl
const insertPrdrDStart = `
INSERT INTO prdr_d_tbl
  (prdr_d_code, prdr_code, input_qtt, start_date, line_eq_code)
VALUES
  (?, ?, ?, NOW(), ?)
`;

//#####제정신아님. . .
// 특정 작업지시서의 설비별 생산실적 조회
const selectPrdrStatusByWko = `
SELECT
  ld.line_eq_code,
  e.eq_name,
  pd.prdr_d_code,
  pd.start_date,
  pd.end_date
FROM wko_tbl w
JOIN prdr_tbl r
  ON r.work_order_code = w.wko_code
JOIN prdr_d_tbl pd
  ON pd.prdr_code = r.prdr_code
RIGHT JOIN line_d_tbl ld
  ON ld.line_eq_code = pd.line_eq_code
JOIN eq_tbl e
  ON e.eq_code = ld.eq_code
WHERE w.wko_code = ?
ORDER BY ld.line_eq_code
`;

// 특정 prdr_d 상세 조회
const selectPrdrDDetail = `
SELECT
  pd.prdr_d_code,
  pd.prdr_code,
  pd.input_qtt,
  pd.start_date,
  pd.end_date,
  pd.line_eq_code
FROM prdr_d_tbl pd
WHERE pd.prdr_d_code = ?
`;

module.exports = {
  selectAllLinesDJ,
  selectPrdpActive,
  selectPrdpDetail,
  selectAllPrdDistinct,
  insertWorkOrder,
  deleteWorkOrder,
  existsWorkOrder,
  updateWorkOrder,
  selectWipDetail,
  selectEqnameByLine,
  selectProcessDropdownByWko,
  selectNextPrdrSeq,
  selectNextPrdrDSeq,
  insertPrdrStart,
  insertPrdrDStart,
  selectPrdrStatusByWko,
  selectPrdrDDetail,
};
