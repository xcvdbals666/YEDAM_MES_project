// 유민
// 마지막 요청번호 조회
const selectMaxMprCode = `SELECT MAX(mpr_code) as last_code FROM mpr_tbl;`;

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

module.exports = {
  selectByMatCodeMatTbl,
  selectMaxMprCode,
};
