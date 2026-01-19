// 검사지 관리 페이지
// 전체조회
const selectAllQiOrderCheckList = `SELECT q.qcr_code ,q.inspection_item, q.range_top, q.range_bot, q.check_method, c.note
                                   FROM qcr_tbl q
                                   JOIN common_code c ON q.unit = c.com_value`;

// 재고목록 전체 불러오기
const selectAllMinbndList = `SELECT q.qio_code, b.mat_name, b.mat_code, sum(m.inbnd_qtt) sum, c.note, c2.com_value, c2.note, q2.inspection_item
                             FROM qio_tbl q
                             JOIN minbnd_tbl m ON q.qio_code = m.qio_code
                             JOIN bom_mat b ON m.mat_code = b.mat_code
                             JOIN common_code c ON m.unit = c.com_value
                             JOIN common_code c2 ON m.mat_type = c2.com_value
                             LEFT JOIN qcr_tbl q2 ON m.mat_type = q2.com_value
                             GROUP BY q.qio_code, m.mat_code, q2.inspection_item`;

module.exports = {
  selectAllQiOrderCheckList,
  selectAllMinbndList,
};
