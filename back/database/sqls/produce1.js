//라인 조회
const selectAllLinesDJ = `
SELECT
  line_code,
  line_name,
  prod_code
FROM line_tbl
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

//작업진행 단건 상세조회 (wko_tbl)
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

//선택한 wko_tbl의 prod_code로 타고가서 po_tbl에서 공정명 뽑기
const selectPoNameByWko = `
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

//###############작업시작 버튼 누르면 필요한 쿼리#########################
//prdr생성, prdr_d 생성, bom_save생성
//[1]prdr 테이블 번호생성
const selectNextPrdrSeq = `
SELECT IFNULL(
  MAX(CAST(SUBSTRING(prdr_code, 6) AS UNSIGNED)), 0
) AS maxSeq
FROM prdr_tbl
`;

//[2]prdr_d 테이블 번호생성
const selectNextPrdrDSeq = `
SELECT IFNULL(
  MAX(CAST(SUBSTRING(prdr_d_code, 8) AS UNSIGNED)), 0
) AS maxSeq
FROM prdr_d_tbl;
`;

//[4]prdr_tbl 삽입
const insertPrdrStart = `
INSERT INTO prdr_tbl
  (prdr_code, prod_code, start_date, work_order_code, stat, ord_qtt, emp_code)
VALUES
  (?, ?, NOW(), ?, 'b1', ?, 'EMP-10001')
`;

//[5]prdr_d_tbl 삽입
const insertPrdrDStart = `
INSERT INTO prdr_d_tbl
  (prdr_d_code, prdr_code, input_qtt, start_date, line_eq_code)
VALUES
  (?, ?, ?, NOW(), ?)
`;

//[6]bom_save 테이블 삽입
const insertBomSave = `
INSERT INTO bom_save
  (bom_save_code, mat_type, req_qtt, unit, spec, loss_rate, copy_date, wko_code, mat_code)

WITH RECURSIVE r AS (
  SELECT
    bm.mat_code,
    bm.mat_type,
    bm.unit,
    bm.loss_rate,
    (w.wko_qtt * bm.req_qtt * (1 + IFNULL(bm.loss_rate,0)/100)) AS qty
  FROM wko_tbl w
  JOIN bom_tbl bt ON bt.prod_code = w.prod_code
  JOIN bom_mat bm ON bm.bom_code = bt.bom_code
  WHERE w.wko_code = ?

  UNION ALL

  SELECT
    bm2.mat_code,
    bm2.mat_type,
    bm2.unit,
    bm2.loss_rate,
    (r.qty * bm2.req_qtt * (1 + IFNULL(bm2.loss_rate,0)/100)) AS qty
  FROM r
  JOIN bom_tbl bt2 ON bt2.prod_code = r.mat_code
  JOIN bom_mat bm2 ON bm2.bom_code = bt2.bom_code
),

leaf AS (
  SELECT
    r.mat_code,
    MAX(r.mat_type) AS mat_type,
    MAX(r.unit)     AS unit,
    MAX(IFNULL(r.loss_rate,0)) AS loss_rate,
    CEIL(SUM(r.qty)) AS total_req_qtt
  FROM r
  LEFT JOIN bom_tbl bx ON bx.prod_code = r.mat_code
  WHERE bx.prod_code IS NULL   -- leaf만
  GROUP BY r.mat_code
),

init AS (
  SELECT @bs := IFNULL(MAX(CAST(SUBSTRING(bom_save_code, 8) AS UNSIGNED)), 0)
  FROM bom_save
)

SELECT
  CONCAT('BOM-S-', LPAD(@bs := @bs + 1, 3, '0')) AS bom_save_code,
  l.mat_type,
  l.total_req_qtt AS req_qtt,
  l.unit,
  bt.spec,
  l.loss_rate,
  NOW(),
  w.wko_code,
  l.mat_code
FROM wko_tbl w
JOIN bom_tbl bt ON bt.prod_code = w.prod_code
JOIN leaf l
CROSS JOIN init
WHERE w.wko_code = ?
`;
//###############작업시작버튼 끝########################################

// 특정 작업지시서의 설비목록과 그 작업진행(생산실적) 조회 (wko_tbl의 code기준으로)
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

// 설비 단건 작업상황 조회
const selectPrdrDDetail = `
SELECT
  pd.prdr_d_code,
  pd.prdr_code,
  pd.input_qtt,
  pd.start_date,
  pd.end_date,
  pd.line_eq_code,
  pd.make_qtt,
  pd.def_qtt,
  pd.proc_rate,
  pd.total_time
FROM prdr_d_tbl pd
WHERE pd.prdr_d_code = ?
`;

//작업종료 버튼 클릭 시
const updatePrdrDEnd = `
UPDATE prdr_d_tbl
SET
  end_date   = NOW(),
  make_qtt   = ?,
  def_qtt    = ?,
  proc_rate  = ?,
  total_time = SEC_TO_TIME(TIMESTAMPDIFF(SECOND, start_date, NOW()))
WHERE prdr_d_code = ?
  AND end_date IS NULL
`;

//bom_save 있는지 체크 (최초공정no1 에서만 삽입하도록 하기 위해서.)
const existsBomSaveByWko = `
SELECT 1
FROM bom_save
WHERE wko_code = ?
LIMIT 1
`;

const selectFirstInputQttByWko = `
SELECT pd.input_qtt
FROM prdr_tbl r
JOIN prdr_d_tbl pd ON pd.prdr_code = r.prdr_code
WHERE r.work_order_code = ?
  AND pd.input_qtt IS NOT NULL
ORDER BY pd.start_date ASC
LIMIT 1
`;

const updatePrdrEnd = `
UPDATE prdr_tbl
SET
  end_date = NOW(),
  production_qtt = ?,
  perform_rate = ROUND(production_qtt / order_qtt),
  total_time = SEC_TO_TIME(TIMESTAMPDIFF(SECOND, start_date, NOW()))
WHERE prdr_code = ?
  AND end_date IS NULL
`;

const isLastProcessByWko = `
SELECT 
  IF(cur.no >= MAX(all_proc.no), 1, 0) AS is_last,
  cur.no AS cur_no
FROM wko_tbl w
JOIN prod_proc_tbl pp 
  ON pp.prod_code = w.prod_code
JOIN prod_proc_d_tbl cur 
  ON cur.prod_proc_code = pp.prod_proc_code 
 AND cur.po_code = ?
JOIN prod_proc_d_tbl all_proc 
  ON all_proc.prod_proc_code = pp.prod_proc_code
WHERE w.wko_code = ?
GROUP BY cur.no
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
  selectPoNameByWko,
  selectNextPrdrSeq,
  selectNextPrdrDSeq,
  insertPrdrStart,
  insertPrdrDStart,
  insertBomSave,
  selectPrdrStatusByWko,
  selectPrdrDDetail,
  updatePrdrDEnd,
  existsBomSaveByWko,
  selectFirstInputQttByWko,
  updatePrdrEnd,
  isLastProcessByWko,
};
