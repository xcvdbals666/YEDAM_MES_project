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
SELECT d.prod_code, p.prod_name, p.com_value , p.unit, p.spec, d.planned_qtt, d.priority
FROM prdp_d_tbl d
JOIN prod_tbl p ON d.prod_code = p.prod_code
WHERE d.prdp_code =?`;

// 주문 검색
const selectByCodeOrNameOrd = `
SELECT o.ord_code, d.prod_code, p.prod_name, d.ord_amount, o.ord_name, o.ord_date
FROM ord_tbl o 
JOIN ord_d_tbl d ON o.ord_code = d.ord_code
JOIN prod_tbl p ON d.prod_code = p.prod_code
WHERE o.ord_code LIKE ? OR o.ord_name LIKE ?`;

// 제품 검색
const selectByCodeOrNameProd = `
SELECT prod_code, prod_name, com_value, unit, spec
FROM prod_tbl
WHERE prod_code LIKE ? OR prod_name LIKE ? OR com_value = ?`;

// 라인 검색
const selectByCodeOrNameLine = `
SELECT line_code, line_name, line_type, note, is_used
FROM line_tbl
WHERE line_code LIKE ? OR line_name LIKE ?`;

module.exports = {
  selectAllPrdp,
  selectByCodeOrNamePrdp,
  selectByCodeOrNameOrd,
  selectByCodeOrNameProd,
  selectByCodeOrNameLine,
};
