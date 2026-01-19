// 전체조회
// const selectAll = `SELECT *
// FROM qcr_tbl`;

// 작성자 선택 - 사원 정보 조회
const selectByEmpcodeEmpTbl = `SELECT e.emp_code, e.emp_name, d.dept_name
                               FROM emp_tbl e
                               JOIN dept_tbl d ON e.dept_code = d.dept_code
                               ORDER BY emp_code`;

// 자재 선택 - 자재 정보 조회
const selectByMatCodeMatTbl = `SELECT m.mat_code, m.mat_name,
	                                    IFNULL(s.current_qty, 0) AS current_qty,
                                      CASE
                                        WHEN IFNULL(d.req_qtt, 0) - (IFNULL(s.current_qty, 0) 
                                           + IFNULL(p.plan_in_qty, 0) - IFNULL(m.save_inven, 0)) > 0
                                        THEN IFNULL(d.req_qtt, 0) - (IFNULL(s.current_qty, 0) 
                                           + IFNULL(p.plan_in_qty, 0) - IFNULL(m.save_inven, 0))
                                        ELSE 0
                                      END AS lack_qty,
                                      c.client_name AS supplier_name
                               FROM mat_tbl m
                               LEFT JOIN client_tbl c ON c.client_code = m.sup
                               LEFT JOIN (SELECT mat_code, IFNULL(SUM(inbnd_qtt), 0) - IFNULL(SUM(outbnd_qtt), 0) AS current_qty
                                          FROM (SELECT mat_code, inbnd_qtt, 0 AS outbnd_qtt
                                                FROM minbnd_tbl
                                                UNION ALL
                                                SELECT mat_code, 0 AS inbnd_qtt, outbnd_qtt
                                                FROM moutbnd_tbl) x
                                          GROUP BY mat_code) s ON s.mat_code = m.mat_code
                                LEFT JOIN (SELECT mat_code, SUM(req_qtt) AS req_qtt
                                           FROM mrp_d_tbl
                                           GROUP BY mat_code) d ON d.mat_code = m.mat_code
                                LEFT JOIN (SELECT d.mat_code, SUM(d.req_qtt) AS plan_in_qty
                                           FROM mpo_d_tbl d
                                           JOIN mpo_tbl h ON d.purchase_code = h.purchase_code
                                           WHERE h.stat = 'c1' AND d.deadline = CURDATE()
                                           GROUP BY d.mat_code) p ON p.mat_code = m.mat_code
                                WHERE m.is_used = 'f2'
                                ORDER BY m.mat_code`;

//발주서 기본 정보 조회
const selectMpoByCode = `
SELECT 
    mpo.purchase_code,           
    mpo.purchase_req_date,       
    mpo.mcode,                   
    mpo.stat,                    
    mpo.note,                    
    mpr.mpr_code                 
FROM mpo_tbl mpo
LEFT JOIN mpr_mapp_tbl mapp ON mpo.purchase_code = mapp.purchase_code
LEFT JOIN mpr_tbl mpr ON mapp.mpr_code = mpr.mpr_code
WHERE mpo.purchase_code = ?`;

//발주서 정보 자동생성
const selectNextMpoCode = `SELECT 
CONCAT('MPO-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', 
  LPAD(IFNULL(MAX(CAST(SUBSTRING(purchase_code, 16) AS UNSIGNED)), 0) + 1, 3, '0')) 
  AS next_code
FROM mpo_tbl
WHERE purchase_code LIKE CONCAT('MPO-', DATE_FORMAT(NOW(), '%Y%m%d'), '%')`;

//발주서 정보 등록
const insertMpo = `INSERT INTO mpo_tbl (  
  purchase_code,
  purchase_req_date,
  stat,
  regdate,
  mcode,
  note
) VALUES (?, NOW(),?,NOW(),?,? )`;

//발주 자재 상세 등록
const insertMpoDetail = `
INSERT INTO mpo_d_tbl (
  purchase_code,
  mat_code,
  unit,
  req_qtt,
  deadline,
  client_code
) VALUES (?, ?, ?, ?, ?, ?)`;

//발주 자재 상세목록
const selectByMrpCodeMrpDetail = `
SELECT 
  md.mat_code,
  m.mat_name,
  m.material_type_code,
  md.unit,
  md.req_qtt,
  COALESCE(inbound.total_in, 0) AS total_in,
  COALESCE(outbound.total_out, 0) AS total_out,
  (COALESCE(inbound.total_in, 0) - COALESCE(outbound.total_out, 0)) AS current_stock,
  (md.req_qtt - (COALESCE(inbound.total_in, 0) - COALESCE(outbound.total_out, 0))) AS shortage_qtt,
    7 AS lead_time,                       
  DATE_ADD(CURDATE(), INTERVAL 7 DAY) AS delivery_date, 
    c.client_name AS supplier_name        
FROM mrp_d_tbl md
JOIN mat_tbl m ON md.mat_code = m.mat_code
LEFT JOIN client_tbl c ON m.sup = c.client_code 
LEFT JOIN (
  SELECT mat_code, SUM(ord_qtt) AS total_in
  FROM minbnd_tbl
  GROUP BY mat_code
) inbound ON md.mat_code = inbound.mat_code
LEFT JOIN (
  SELECT mat_code, SUM(outbnd_qtt) AS total_out
  FROM moutbnd_tbl
  GROUP BY mat_code
) outbound ON md.mat_code = outbound.mat_code
WHERE md.mrp_code = ?`;

module.exports = {
  selectByEmpcodeEmpTbl,
  selectByMatCodeMatTbl,
  selectAll,
  selectMpoByCode,
  selecttNextMpoCode,
  insertMpo,
  insertMpoDetail,
  selectByMrpCodeMrpDetail,
};
