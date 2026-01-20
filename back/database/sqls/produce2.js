// 생산계획조회
const selectAllPrdp = `
SELECT *
FROM prdp_tbl
WHERE prdp_name LIKE ? AND prdp_date BETWEEN ? AND ? AND due_date BETWEEN ? AND ?`;

module.exports = {
  selectAllPrdp,
  selectAllWkotbl,
};
