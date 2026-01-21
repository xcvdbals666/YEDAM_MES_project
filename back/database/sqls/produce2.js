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
};
