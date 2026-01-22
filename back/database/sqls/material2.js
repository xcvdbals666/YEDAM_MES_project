// 유민

// 자재구매요청 관련
// 다음 자재구매요청 코드 조회
const selectMaxMprCode = `SELECT IFNULL(MAX(mpr_code), 'MPR-000') AS last_code FROM mpr_tbl`;

// 다음 자재구매요청상세 코드 조회
const selectMaxMprDCode = `SELECT IFNULL(MAX(mpr_d_code), 'MPR-D-000') AS last_code FROM mpr_d_tbl`;

// mrp code 조회
const selectAllMrpCodeMrpTbl = `SELECT mrp_code, plan_date FROM mrp_tbl order by plan_date desc`;

// 자재 선택 - 자재 정보 조회
const selectByMatCodeMatTbl = `SELECT m.mat_code, m.mat_name, m.unit, c2.note as unit_label,
	                                    IFNULL(s.current_qty, 0) AS current_qty,
                                      CASE
                                        WHEN IFNULL(d.req_qtt, 0) - (IFNULL(s.current_qty, 0) 
                                           + IFNULL(p.plan_in_qty, 0) - IFNULL(m.save_inven, 0)) > 0
                                        THEN IFNULL(d.req_qtt, 0) - (IFNULL(s.current_qty, 0) 
                                           + IFNULL(p.plan_in_qty, 0) - IFNULL(m.save_inven, 0))
                                        ELSE 0
                                      END AS lack_qty,
                                      c.client_code,
                                      c.client_name
                               FROM mat_tbl m
                               LEFT JOIN client_tbl c ON c.client_code = m.sup
                               LEFT JOIN common_code c2 ON c2.com_value = m.unit
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
                                WHERE m.is_used = 'f2' and m.mat_name like ?
                                ORDER BY m.mat_code`;

// 자재구매요청 저장
const insertMprTbl = `INSERT INTO mpr_tbl (mpr_code, reqdate, deadline, mrp_code, mcode) 
                                  VALUES (?, ?, ?, ?, ?)`;

// 자재구매요청 상세정보 저장
const insertMprDTbl = `INSERT INTO mpr_d_tbl (mpr_d_code, req_qtt, unit, note, mpr_code, mat_sup, mat_code) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

// 자재구매요청서 전체 목록 조회
const selectAllMprTbl = `SELECT m.mpr_code, m.reqdate, m.mcode, m.deadline, m.mrp_code,
                                GROUP_CONCAT(DISTINCT mat.mat_name SEPARATOR ', ') AS material_names
                         FROM mpr_tbl m
                         LEFT JOIN mpr_d_tbl md ON m.mpr_code = md.mpr_code
                         LEFT JOIN mat_tbl mat ON md.mat_code = mat.mat_code
                         WHERE m.mpr_code like ?
                         GROUP BY m.mpr_code,m.reqdate, m.mcode, m.deadline,m.mrp_code
                         ORDER BY m.mpr_code DESC`;

// 자재구매요청 상세 정보 조회 - 요청기본정보
const selectByMprCodeMprTbl = `SELECT m.mpr_code, m.reqdate, e.emp_name, d.dept_name
                               FROM mpr_tbl m
                               JOIN emp_tbl e ON e.emp_code = m.mcode
                               LEFT JOIN dept_tbl d ON d.dept_code = e.dept_code
                               WHERE m.mpr_code = ?`;

// 자재구매요청 상세 정보 조회 - 요청자재상세
const selectByMprCodeMprDTbl = `SELECT m.mpr_code, mt.mat_name, d.mat_code, m.reqdate,
                                       d.req_qtt, d.unit, d.note, c.client_name,
                                       c2.note as unit_label
                                FROM mpr_d_tbl d
                                JOIN mpr_tbl m ON d.mpr_code = m.mpr_code
                                JOIN mat_tbl mt ON d.mat_code = mt.mat_code
                                JOIN client_tbl c ON d.mat_sup = c.client_code
                                JOIN common_code c2 ON c2.com_value = d.unit
                                WHERE m.mpr_code = ?`;

// 공급업체 목록 조회
const selectAllClientTbl = `SELECT client_code, client_name, client_type, c2.note
                            FROM client_tbl c
                            JOIN common_code c2 ON c2.com_value = c.client_type
                            WHERE client_name like ?`;

module.exports = {
  selectByMatCodeMatTbl,
  selectByMprCodeMprTbl,
  selectByMprCodeMprDTbl,
  selectMaxMprCode,
  selectMaxMprDCode,
  selectAllMrpCodeMrpTbl,
  insertMprTbl,
  insertMprDTbl,
  selectAllMprTbl,
  selectAllClientTbl,
};
