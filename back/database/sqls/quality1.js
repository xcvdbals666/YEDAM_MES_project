// 검사지 관리 페이지
// 전체조회
const selectAllQiOrderCheckList = `SELECT q.qcr_code ,q.inspection_item, q.range_top, q.range_bot, q.check_method, q.com_value, c.note
                                   FROM qcr_tbl q
                                   JOIN common_code c ON q.unit = c.com_value`;

// 검사지 전체 불러오기
const selectAllQiOrderList = `SELECT *
                              FROM qio_tbl q
                              JOIN emp_tbl e ON q.emp_code = e.emp_code`;

// 검사지에 해당하는 자재 및 검사항목 불러오기
const selectQiOrderItem = `SELECT q.qio_code, m.deadline, b.mat_name, b.mat_code, b.mat_type, m.req_qtt, c.note, c2.com_value, c2.note, q2.inspection_item    
                           FROM qio_tbl q
                           JOIN mpo_d_tbl m ON q.mpo_d_code = m.mpo_d_code
                           JOIN bom_mat b ON m.mat_code = b.mat_code
                           JOIN common_code c ON b.unit = c.com_value
                           JOIN common_code c2 ON b.mat_type = c2.com_value
                           LEFT JOIN qcr_tbl q2 ON b.mat_type = q2.com_value
                           WHERE q.qio_code = ?
                           GROUP BY q.qio_code, q2.inspection_item`;

// 생산실적 불러오기
const selectQiProduceList = `SELECT w.prdp_code, p.end_date, p.production_qtt, p.prdr_code, c.note, p4.po_code, p4.po_name, p7.prod_name, p7.prod_type, c2.note AS type  
                             FROM prdr_tbl p 
                             LEFT JOIN qio_tbl q ON p.prdr_code = q.prdr_code
                             LEFT JOIN common_code c ON p.stat = c.com_value  
                             LEFT JOIN  wko_tbl w ON p.work_order_code = w.wko_code
                             LEFT JOIN prdr_d_tbl p2 ON p.prdr_code = p2.prdr_code
                             LEFT JOIN line_d_tbl l ON p2.line_eq_code = l.line_eq_code
                             LEFT JOIN prod_proc_d_tbl p3 ON l.pp_code = p3.pp_code
                             LEFT JOIN po_tbl p4 ON p3.po_code = p4.po_code
                             LEFT JOIN prdp_tbl p5 ON w.prdp_code = p5.prdp_code
                             LEFT JOIN prdp_d_tbl p6 ON p5.prdp_code = p6.prdp_code
                             LEFT JOIN prod_tbl p7 ON p6.prod_code = p7.prod_code
                             LEFT JOIN common_code c2 ON p7.prod_type = c2.com_value
                             WHERE q.qio_code is null
                             GROUP BY p.prdr_code`;

// 발주서상세 불러오기
const selectQiMpoList = `SELECT m.mpo_d_code, m.deadline, sum(q.insp_vol) sum, b.mat_code, b.mat_name, b.mat_type, m.req_qtt, c2.note, m.req_qtt - sum(q.insp_vol) as remaining_amount
                         FROM mpo_d_tbl m 
                         LEFT JOIN qio_tbl q ON m.mpo_d_code = q.mpo_d_code 
                         JOIN bom_mat b ON m.mat_code = b.mat_code
                         JOIN common_code c2 ON b.mat_type = c2.com_value
                         WHERE qio_code IS NULL or m.req_qtt - q.insp_vol > 0
                         group by m.mpo_d_code
                         HAVING  m.req_qtt > sum
                          `;

// qio_code 생성
const createQioCode = `SELECT concat(
                              'QIO-', DATE_FORMAT(?, '%Y%m%d'), '-',
                               LPAD(ifnull((SELECT MAX(SUBSTR(qio_code, -3))
                                            FROM qio_tbl
                                            where SUBSTR(qio_code, 5, 8) = DATE_FORMAT(?,'%Y%m%d')
                                            FOR UPDATE),0) + 1
                               , 3
                       , '0')) AS newQio `;

// 검사지시서 등록(자재)
const insertQio_tbl = `INSERT INTO qio_tbl SET qio_code = ?,
                                               qio_date = current_timestamp(),
                                               insp_date = DATE_FORMAT(replace(?, 'Z',''), '%Y%m%d'),
                                               emp_code = 'EMP-10005',
                                               insp_vol = ?,
                                               mpo_d_code = ?`;

// 검사지시서 등록(생산)
const insertQio_tblPro = `INSERT INTO qio_tbl SET qio_code = ?,
                                               qio_date = current_timestamp(),
                                               insp_date = DATE_FORMAT(replace(?, 'Z',''), '%Y%m%d'),
                                               emp_code = 'EMP-10005',
                                               insp_vol = ?,
                                               prdr_code = ?`;

// 검사지시서 삭제
const deleteQiOrder = `DELETE FROM qio_tbl
                       WHERE qio_code = ?`;

module.exports = {
  selectAllQiOrderCheckList,
  createQioCode,
  selectAllQiOrderList,
  selectQiOrderItem,
  selectQiProduceList,
  selectQiMpoList,
  insertQio_tbl,
  deleteQiOrder,
  insertQio_tblPro,
};
