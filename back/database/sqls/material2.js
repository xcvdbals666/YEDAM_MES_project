// 유민

// 자재구매요청 관련
// 다음 자재구매요청 코드 조회
const selectMaxMprCode = `SELECT IFNULL(MAX(mpr_code), 'MPR-000') AS last_code FROM mpr_tbl`;

// 다음 자재구매요청상세 코드 조회
const selectMaxMprDCode = `SELECT IFNULL(MAX(mpr_d_code), 'MPR-D-000') AS last_code FROM mpr_d_tbl`;

// mrp code 조회
const selectAllMrpCodeMrpTbl = `SELECT mrp_code, plan_date FROM mrp_tbl order by plan_date desc`;

// 자재 선택 - 자재 정보 조회
const selectByMatCodeMatTbl = `SELECT m.mat_code, m.mat_name, m.unit,
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

module.exports = {
  selectByMatCodeMatTbl,
  selectMaxMprCode,
  selectMaxMprDCode,
  selectAllMrpCodeMrpTbl,
  insertMprTbl,
  insertMprDTbl,
};
