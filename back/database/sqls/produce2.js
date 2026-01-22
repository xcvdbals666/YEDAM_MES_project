// 생산계획 조회
const selectAllPrdp = `
SELECT *
FROM prdp_tbl
WHERE prdp_code LIKE ? AND prdp_name LIKE ? AND prdp_date BETWEEN ? AND ? AND due_date BETWEEN ? AND ?`;

// 생산계획 검색
const selectByCodeOrNamePrdp = `
SELECT p.*, e.emp_name
FROM prdp_tbl p
JOIN emp_tbl e ON p.reg = e.emp_code
WHERE p.prdp_code LIKE ? OR p.prdp_name LIKE ?`;

// 생산계획 상세 제품 조회
const selectPrdpDetail = `
SELECT d.prdp_d_code, d.prod_code, p.prod_name, cc.note AS com_value , cu.note AS unit, cs.note AS spec, d.planned_qtt, d.priority, d.line_code
FROM prdp_d_tbl d
JOIN prod_tbl p ON d.prod_code = p.prod_code
JOIN common_code cc ON cc.com_value = p.com_value
JOIN common_code cu ON cu.com_value = p.unit
JOIN common_code cs ON cs.com_value = p.spec
WHERE d.prdp_code = ?`;

// 주문 검색
const selectByCodeOrNameOrd = `
SELECT o.ord_code, d.prod_code, p.prod_name, d.ord_amount, o.ord_name, o.ord_date, cc.note AS com_value, cu.note AS unit, cs.note AS spec
FROM ord_tbl o 
JOIN ord_d_tbl d ON o.ord_code = d.ord_code
JOIN prod_tbl p ON d.prod_code = p.prod_code
JOIN common_code cc ON cc.com_value = p.com_value
JOIN common_code cu ON cu.com_value = p.unit
JOIN common_code cs ON cs.com_value = p.spec
WHERE o.ord_code LIKE ? OR o.ord_name LIKE ?`;

// 제품 검색
const selectByCodeOrNameProd = `
SELECT prod_code, prod_name, cc.note AS com_value, cu.note AS unit, cs.note AS spec
FROM prod_tbl p
JOIN common_code cc ON cc.com_value = p.com_value
JOIN common_code cu ON cu.com_value = p.unit
JOIN common_code cs ON cs.com_value = p.spec
WHERE prod_code LIKE ? OR prod_name LIKE ? OR cc.note LIKE ?`;

// 라인 검색
const selectByCodeOrNameLine = `
SELECT l.line_code, l.line_name, ct.note AS line_type, l.note, ci.note AS is_used
FROM line_tbl l
JOIN common_code ct ON ct.com_value = l.line_type
JOIN common_code ci ON ci.com_value = l.is_used
WHERE line_code LIKE ? OR line_name LIKE ?`;

// 생산계획 번호 최대값
const selectMaxCodePrdp = `
SELECT SUBSTR(MAX(prdp_code), 13, 4) AS number
FROM prdp_tbl
WHERE SUBSTR(prdp_code, 6, 6) = ?`;

// 생산계획 수정
const updatePrdp = `
UPDATE prdp_tbl
SET prdp_name = ?, start_date = ?, end_date = ?, ord_code = ?, due_date = ? , note = ?
WHERE prdp_code = ?`;

// 생산계획 삽입
const insertPrdp = `
INSERT INTO prdp_tbl(prdp_code, prdp_name, prdp_date, start_date, end_date, due_date, note, ord_code, reg)
VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;

// 생산계획 삭제
const deletePrdp = `
DELETE FROM prdp_tbl
WHERE prdp_code = ?`;

// 생산계획 삭제 전 상세 삭제
const deleteDetailPrdp = `
DELETE FROM prdp_d_tbl
WHERE prdp_code = ?`;

// 생산계획상세 번호 최대값
const selectMaxCodePrdpDetail = `
SELECT SUBSTR(MAX(prdp_d_code), 8, 4) AS number
FROM prdp_d_tbl`;

// 생산계획상세 수정
const updatePrdpDetail = `
UPDATE prdp_d_tbl
SET prod_code = ?, planned_qtt = ?, priority = ?, line_code = ?
WHERE prdp_d_code = ?`;

// 생산계획상세 삽입
const insertPrdpDetail = `
INSERT INTO prdp_d_tbl(prdp_d_code, planned_qtt, priority, prod_code, emp_code, prdp_code, line_code)
VALUES(?, ?, ?, ?, ?, ?, ?)`;

// 생산계획상세 삭제
const deletePrdpDetail = `
DELETE FROM prdp_d_tbl
WHERE prdp_d_code = ?`;

// 자재 검색
const selectByCodeOrNameMat = `
SELECT mi.mat_code, mi.mat_name, mt.note AS mat_type, mi.save_inven, mu.note AS unit, mi.note
FROM mat_tbl mi
JOIN common_code mt ON mt.com_value = mi.material_type_code
JOIN common_code mu ON mu.com_value = mi.unit
WHERE mi.mat_code LIKE ? OR mi.mat_name LIKE ?`;

// BOM 자재 불러오기
const selectBomMat = `
WITH RECURSIVE bom_tree AS (
  SELECT bm.mat_code, bm.mat_name, bm.req_qtt, bm.unit
  FROM bom_tbl bt
  JOIN bom_mat bm ON bt.bom_code = bm.bom_code
  WHERE bt.prod_code IN (SELECT prod_code FROM prdp_d_tbl WHERE prdp_code = ?)
  UNION ALL
  SELECT bm2.mat_code, bm2.mat_name, bm2.req_qtt, bm2.unit
  FROM bom_tree btree
  JOIN bom_tbl bt2 ON bt2.prod_code = btree.mat_code
  JOIN bom_mat bm2 ON bm2.bom_code = bt2.bom_code
  WHERE btree.mat_code LIKE 'PROD-%'
)
SELECT b.mat_code, b.mat_name, b.req_qtt, m.save_inven, c.note AS unit
FROM bom_tree b
JOIN common_code c ON c.com_value = b.unit
JOIN mat_tbl m ON m.mat_code = b.mat_code
WHERE b.mat_code LIKE 'MAT-%'`;

// MRP 상세조회
const selectByCodeMrp = `
SELECT m.*, e.emp_name
FROM mrp_tbl m
JOIN emp_tbl e ON m.emp_code = e.emp_code
WHERE mrp_code = ?`;

// MRP 상세조회 - 자재목록
const selectByCodeMrpDetail = `
SELECT m.*, mt.mat_name, cu.note AS unit_note, mt.save_inven
FROM mrp_d_tbl m
JOIN common_code cu ON cu.com_value = m.unit
JOIN mat_tbl mt ON mt.mat_code = m.mat_code
WHERE mrp_code = ?`;

// MRP 수정
const updateMrp = `
UPDATE mrp_tbl
SET plan_date = ?, start_date = ?, mrp_note = ?, prdp_code = ?, emp_code = ?
WHERE mrp_code = ?`;

// MRP 번호 최대값
const selectMaxCodeMrp = `
SELECT SUBSTR(MAX(mrp_code), 14, 3) AS number
FROM mrp_tbl`;

// MRP 저장
const insertMrp = `
INSERT INTO mrp_tbl(mrp_code, plan_date, start_date, mrp_note, prdp_code, emp_code)
VALUES(?, ?, ?, ?, ?, ?)`;

// MRP 자제 번호 최대값
const selectMaxCodeMrpDetail = `
SELECT SUBSTR(MAX(mrp_d_code), 7, 4) AS number
FROM mrp_d_tbl`;

// MRP 자재 삭제
const deleteMrpDetail = `
DELETE FROM mrp_d_tbl
WHERE mrp_d_code = ?`;

// MRP 자재 수정
const updateMrpDetail = `
UPDATE mrp_d_tbl
SET req_qtt = ?
WHERE mrp_d_code = ?`;

// MRP 자재 추가
const insertMrpDetail = `
INSERT INTO mrp_d_tbl(mrp_d_code, unit, req_qtt, mrp_code, mat_code)
VALUES(?, ?, ?, ?, ?)`;

module.exports = {
  selectAllPrdp,
  selectByCodeOrNamePrdp,
  selectPrdpDetail,
  selectByCodeOrNameOrd,
  selectByCodeOrNameProd,
  selectByCodeOrNameLine,
  selectMaxCodePrdp,
  updatePrdp,
  insertPrdp,
  deletePrdp,
  deleteDetailPrdp,
  selectMaxCodePrdpDetail,
  updatePrdpDetail,
  insertPrdpDetail,
  deletePrdpDetail,
  selectByCodeOrNameMat,
  selectBomMat,
  selectByCodeMrp,
  selectByCodeMrpDetail,
  updateMrp,
  selectMaxCodeMrp,
  insertMrp,
  selectMaxCodeMrpDetail,
  deleteMrpDetail,
  updateMrpDetail,
  insertMrpDetail,
};
