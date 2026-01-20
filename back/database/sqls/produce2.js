// 생산계획 조회
const selectAllPrdp = `
SELECT *
FROM prdp_tbl
WHERE prdp_code LIKE ? AND prdp_name LIKE ? AND prdp_date BETWEEN ? AND ? AND due_date BETWEEN ? AND ?`;

// 주문 검색
const selectByCodeOrNameOrd = `
SELECT o.ord_code, d.prod_code, p.prod_name, d.ord_amount, o.ord_name, o.ord_date
FROM ord_tbl o 
JOIN ord_d_tbl d ON o.ord_code = d.ord_code
JOIN prod_tbl p ON d.prod_code = p.prod_code
WHERE o.ord_code LIKE ? OR o.ord_name LIKE ?`;

const selectByCodeOrNameProd = `
SELECT prod_code, prod_name, com_value, unit, spec
FROM prod_tbl
WHERE prod_code LIKE ? OR prod_name LIKE ? OR com_value = ?
`;

const selectByCodeOrNameLine = `
SELECT line_code, line_name, line_type, note, is_used
FROM line_tbl
WHERE line_code LIKE ? OR line_name LIKE ?`;

module.exports = {
  selectAllPrdp,
  selectByCodeOrNameOrd,
  selectByCodeOrNameProd,
  selectByCodeOrNameLine,
};
