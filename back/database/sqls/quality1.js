// 검사지 관리 페이지
// 전체조회
const selectAllQiOrderCheckList = `SELECT q.qcr_code ,q.inspection_item, q.range_top, q.range_bot, q.check_method, q.com_value, c.note
                                   FROM qcr_tbl q
                                   JOIN common_code c ON q.unit = c.com_value`;

// 검사지 전체 불러오기
const selectAllQiOrderList = `SELECT q.qio_code, qio_date, e.emp_name, q.prdr_code, q.mpo_d_code
                              FROM qio_tbl q
                              JOIN emp_tbl e ON q.emp_code = e.emp_code
                              LEFT JOIN qir_tbl q2 ON q.qio_code = q2.qio_code
                              WHERE q2.qir_code IS NULL
                              GROUP BY q.qio_code`;

// 검사지에 해당하는 자재 및 검사항목 불러오기
const selectQiOrderItem = `SELECT q.qio_code, q.insp_vol, m.deadline, b.mat_name, b.mat_code, b.mat_type, m.req_qtt, c.note, c2.com_value, c2.note, q2.inspection_item    
                           FROM qio_tbl q
                           LEFT JOIN mpo_d_tbl m ON q.mpo_d_code = m.mpo_d_code
                           LEFT JOIN bom_mat b ON m.mat_code = b.mat_code
                           LEFT JOIN common_code c ON b.unit = c.com_value
                           LEFT JOIN common_code c2 ON b.mat_type = c2.com_value
                           LEFT JOIN qcr_tbl q2 ON b.mat_type = q2.com_value
                           WHERE q.qio_code = ?
                           GROUP BY q.qio_code, q2.inspection_item`;

// 검사지에 해당하는 생산 및 검사항목
const selectQiProdInfo = `SELECT p.prdr_code, w.prdp_code, p6.prod_name, p6.prod_type, p5.end_date, p.production_qtt, c.note, q.qio_code
                             FROM prdr_tbl p 
                             LEFT JOIN wko_tbl w ON p.work_order_code = w.wko_code
                             LEFT JOIN prdp_tbl p5 ON w.prdp_code = p5.prdp_code
                             LEFT JOIN qio_tbl q ON q.prdr_code = p.prdr_code
                             LEFT JOIN prod_tbl p6 ON p.prod_code = p6.prod_code 
                             LEFT JOIN common_code c ON p6.prod_type = c.com_value 
                             WHERE q.qio_code = ?`;

// 생산실적 불러오기
const selectQiProduceList = `SELECT p.prdr_code, w.prdp_code, p6.prod_name, p6.prod_type, p5.end_date, p.production_qtt, c.note
                             FROM prdr_tbl p 
                             LEFT JOIN wko_tbl w ON p.work_order_code = w.wko_code
                             LEFT JOIN prdp_tbl p5 ON w.prdp_code = p5.prdp_code
                             LEFT JOIN qio_tbl q ON q.prdr_code = p.prdr_code
                             LEFT JOIN prod_tbl p6 ON p.prod_code = p6.prod_code 
                             LEFT JOIN common_code c ON p6.prod_type = c.com_value 
                             WHERE q.qio_code IS NULL
                             ORDER BY prdp_code DESC`;

// 발주서상세 불러오기
const selectQiMpoList = `SELECT m.mpo_d_code, m.deadline, q.qio_code, ifnull(q.insp_vol,0) insp_vol, b.mat_code, b.mat_name, b.mat_type, m.req_qtt, c2.note, m.req_qtt - ifnull(q.insp_vol,0) as remaining_amount
                         FROM mpo_d_tbl m 
                         LEFT JOIN qio_tbl q ON m.mpo_d_code = q.mpo_d_code 
                         JOIN bom_mat b ON m.mat_code = b.mat_code
                         JOIN common_code c2 ON b.mat_type = c2.com_value
                         WHERE qio_code IS NULL
                         ORDER BY mpo_d_code DESC;                         
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

// 검사 결과서 관리

// 검사 지시서 불러오기
const selectAllQirQioOrder = `SELECT q.qio_code, qio_date, e.emp_name, q.prdr_code, q.mpo_d_code
                          FROM qio_tbl q
                          left JOIN emp_tbl e ON q.emp_code = e.emp_code
                          left join qir_tbl q2 ON q.qio_code = q2.qio_code
                          WHERE qir_code IS NULL
                          ORDER BY qio_date DESC`;

// 검사결과서 코드 생성(qir_code)
const createQirCode = `SELECT concat(
                              'QIR-',
                               LPAD(ifnull((SELECT MAX(SUBSTR(qir_code, -3))
                                            FROM qir_tbl										
                                            FOR UPDATE),0) + 1
                                     , 3 , '0')) AS newQir`;

// 검사결과서 등록(자재)
const insertQir_tbl = `INSERT INTO qir_tbl SET qir_code = ?,
                                               qio_code = ?,
                                               start_date = current_timestamp(),
                                               qir_emp_code = 'EMP-10005',
                                               qcr_code = ?,
                                               mpo_d_code = ?`;

// 검사결과서 등록(생산)
const insertQir_tblPro = `INSERT INTO qir_tbl SET qir_code = ?,
                                               qio_code = ?,
                                               start_date = current_timestamp(),
                                               qir_emp_code = 'EMP-10005',
                                               qcr_code = ?`;

// 검사지 정보 불러오기(생산일 경우)
const selectQirProdInfo = `SELECT w.prdp_code,q.qio_code, p.end_date, p.production_qtt, p.prdr_code, c.note, p4.po_code, p4.po_name, p7.prod_name, p7.prod_type, c2.note AS type  
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
                             WHERE q.qio_code = ?                             
                             GROUP BY p.prdr_code`;

// 검사결과서 정보 불러오기
const selectQirList = `SELECT  e.emp_name, q.end_date, IFNULL(q2.insp_vol,0) insp_vol, q2.mpo_d_code, q2.prdr_code, q.qcr_code, q.qio_code, q2.qio_date, q.qir_code, q.start_date, IFNULL(q.unpass_qtt,0) unpass_qtt, IFNULL(q.pass_qtt, 0) pass_qtt, IFNULL((q2.insp_vol- IFNULL(q.pass_qtt, 0) - IFNULL(unpass_qtt,0)),0 ) AS 'remaining'
                       FROM qir_tbl q
                       LEFT JOIN emp_tbl e ON q.qir_emp_code = e.emp_code
                       LEFT JOIN qio_tbl q2 ON q.qio_code = q2.qio_code
                       WHERE q.result IS NULL
                       ORDER BY q.start_date DESC`;

// 검사 결과서 합격 불합격 수정
const updateQirList = `UPDATE qir_tbl 
                       SET result = ?,
                           end_date = ?,
                           unpass_qtt = ?,
                           pass_qtt = ?,
                           unpass_rate =?
                       WHERE qio_code = ? AND qcr_code = ?`;

// 검사결과서 삭제
const deleteQir = `DELETE FROM qir_tbl
                       WHERE qio_code = ?`;

const selectAllQirOrder = (module.exports = {
  selectAllQiOrderCheckList,
  createQioCode,
  selectAllQiOrderList,
  selectQiOrderItem,
  selectQiProduceList,
  selectQiMpoList,
  insertQio_tbl,
  deleteQiOrder,
  insertQio_tblPro,
  createQirCode,
  insertQir_tbl,
  insertQir_tblPro,
  selectAllQirQioOrder,
  selectQirProdInfo,
  selectQirList,
  updateQirList,
  deleteQir,
  selectQiProdInfo,
});
