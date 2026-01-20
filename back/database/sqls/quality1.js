// 검사지 관리 페이지
// 전체조회
const selectAllQiOrderCheckList = `SELECT q.qcr_code ,q.inspection_item, q.range_top, q.range_bot, q.check_method, q.com_value, c.note
                                   FROM qcr_tbl q
                                   JOIN common_code c ON q.unit = c.com_value`;

//검사지시서가 없는 재고목록 전체 불러오기
const selectAllMinbndList = `SELECT * 
                             FROM minbnd_tbl 
                            WHERE qio_code = null`;

// `SELECT q.qio_code, m.inbnd_date, b.mat_name, b.mat_code, sum(m.inbnd_qtt) sum, c.note, c2.com_value, c2.note
//  FROM qio_tbl q
//  JOIN minbnd_tbl m ON q.qio_code = m.qio_code
//  JOIN bom_mat b ON m.mat_code = b.mat_code
//  JOIN common_code c ON m.unit = c.com_value
//  JOIN common_code c2 ON m.mat_type = c2.com_value
//  GROUP BY q.qio_code, m.mat_code`;

// qio_code 생성
const createQioCode = `SELECT concat(
                              'QIO-', DATE_FORMAT(?, '%y%m%d'), '-',
                               LPAD(ifnull((SELECT MAX(SUBSTR(qio_code, -3))
                                            FROM qio_tbl
                                            where SUBSTR(qio_code, 5, 8) = DATE_FORMAT(?,'%y%m%d')
                                            FOR UPDATE),0) + 1
                               , 3
                       , '0'))`;

// 검사지 전체 불러오기
const selectAllQiOrderList = `SELECT *
                              FROM qio_tbl q
                              JOIN emp_tbl e ON q.emp_code = e.emp_code`;

module.exports = {
  selectAllQiOrderCheckList,
  selectAllMinbndList,
  createQioCode,
  selectAllQiOrderList,
};
