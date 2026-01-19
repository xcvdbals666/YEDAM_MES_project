// 생산계획조회
const selectAllPrdp = `
SELECT *
FROM prdp_tbl
WHERE prdp_name LIKE ? AND prdp_date BETWEEN ? AND ? AND due_date BETWEEN ? AND ?`;

//전체 작업지시서 조회
const selectAllWkotbl = `
SELECT wko_code,
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

// //전체 생산계획서 조회
// const selectAllPrdp = `
// SELECT prdp_code,
//        prdp_name,
//        prdp_date,
//        start_date,
//        end_date,
//        due_date,
//        ord_code,
//        reg
// FROM prdp_tbl
// `;

module.exports = {
  selectAllPrdp,
  selectAllWkotbl,
};
