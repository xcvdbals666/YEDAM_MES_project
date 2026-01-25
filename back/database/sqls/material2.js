// 유민

// 자재구매요청 관련
// 다음 자재구매요청 코드 조회
const selectMaxMprCode = `SELECT IFNULL(MAX(mpr_code), 'MPR-000') AS last_code FROM mpr_tbl`;

// 다음 자재구매요청상세 코드 조회
const selectMaxMprDCode = `SELECT IFNULL(MAX(mpr_d_code), 'MPR-D-000') AS last_code FROM mpr_d_tbl`;

// mrp code 조회
const selectAllMrpCodeMrpTbl = `SELECT mrp_code, plan_date FROM mrp_tbl order by mrp_code desc`;

// 자재 선택 - 자재 정보 조회
const selectByMatCodeMatTbl = `SELECT m.mat_code, m.mat_name, m.unit, c2.note AS unit_label,
                                      IFNULL(s.current_qty, 0) AS current_qty,
                                      CASE WHEN IFNULL(d.req_qtt, 0) - (IFNULL(s.current_qty, 0) + IFNULL(p.plan_in_qty, 0) - IFNULL(m.save_inven, 0)) > 0
                                           THEN IFNULL(d.req_qtt, 0) - (IFNULL(s.current_qty, 0) + IFNULL(p.plan_in_qty, 0) - IFNULL(m.save_inven, 0))
                                           ELSE 0
                                      END AS lack_qty,
                                      c.client_code, c.client_name
                               FROM mat_tbl m
                               LEFT JOIN client_tbl c ON c.client_code = m.sup
                               LEFT JOIN common_code c2 ON c2.com_value = m.unit
                               LEFT JOIN (SELECT mat_code, SUM(inbnd_qtt) - SUM(outbnd_qtt) AS current_qty
                               FROM (SELECT mat_code, inbnd_qtt, 0 AS outbnd_qtt FROM minbnd_tbl
                               UNION ALL
                               SELECT mat_code, 0, outbnd_qtt FROM moutbnd_tbl) x
                               GROUP BY mat_code) s ON s.mat_code = m.mat_code
                               LEFT JOIN (SELECT d.mat_code, SUM(d.req_qtt) AS plan_in_qty
                                          FROM mpo_d_tbl d
                                          JOIN mpo_tbl h ON d.purchase_code = h.purchase_code
                                          WHERE h.stat = 'c1'
                                          GROUP BY d.mat_code) p ON p.mat_code = m.mat_code
                               LEFT JOIN (SELECT mat_code, SUM(req_qtt) AS req_qtt
                                          FROM mrp_d_tbl
                                          WHERE (? IS NULL OR mrp_code = ?)
                                          GROUP BY mat_code) d ON d.mat_code = m.mat_code
                               WHERE m.is_used = 'f2' AND m.mat_name LIKE ?
                               ORDER BY m.mat_code`;

// 자재구매요청 저장
const insertMprTbl = `INSERT INTO mpr_tbl (mpr_code, reqdate, deadline, mrp_code, mcode) 
                                  VALUES (?, ?, ?, ?, ?)`;

// 자재구매요청 상세정보 저장
const insertMprDTbl = `INSERT INTO mpr_d_tbl (mpr_d_code, req_qtt, unit, note, mpr_code, mat_sup, mat_code, source_type) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

// 자재구매요청서 전체 목록 조회
// const selectAllMprTbl = `SELECT m.mpr_code, m.reqdate, m.mcode, m.deadline, m.mrp_code,
//                                 GROUP_CONCAT(DISTINCT mat.mat_name SEPARATOR ', ') AS material_names
//                          FROM mpr_tbl m
//                          LEFT JOIN mpr_d_tbl md ON m.mpr_code = md.mpr_code
//                          LEFT JOIN mat_tbl mat ON md.mat_code = mat.mat_code
//                          WHERE m.mpr_code like ?
//                          GROUP BY m.mpr_code,m.reqdate, m.mcode, m.deadline,m.mrp_code
//                          ORDER BY m.mpr_code DESC`;

// 자재구매요청 상세 정보 조회 - 요청기본정보
const selectByMprCodeMprTbl = `SELECT m.mpr_code, m.reqdate, e.emp_name, d.dept_name
                               FROM mpr_tbl m
                               JOIN emp_tbl e ON e.emp_code = m.mcode
                               LEFT JOIN dept_tbl d ON d.dept_code = e.dept_code
                               WHERE m.mpr_code = ?`;

// 자재구매요청 상세 정보 조회 - 요청자재상세
const selectByMprCodeMprDTbl = `SELECT d.mpr_d_code, d.source_type, mt.mat_name, d.mat_code, d.req_qtt, d.unit, 
                                       d.note, c.client_name, c.client_code, cc.note AS unit_label,
                                       IFNULL(s.current_qty, 0) AS current_qty,
                                       CASE WHEN d.req_qtt - IFNULL(s.current_qty, 0) > 0
                                            THEN d.req_qtt - IFNULL(s.current_qty, 0)
                                            ELSE 0
                                       END AS req_lack_qty
                                FROM mpr_d_tbl d
                                LEFT JOIN mpr_tbl m ON m.mpr_code = d.mpr_code
                                JOIN mat_tbl mt ON mt.mat_code = d.mat_code
                                LEFT JOIN client_tbl c ON c.client_code = d.mat_sup
                                LEFT JOIN common_code cc ON cc.com_value = d.unit
                                LEFT JOIN (SELECT mat_code,
                                                  SUM(IFNULL(inbnd_qtt, 0)) - SUM(IFNULL(outbnd_qtt, 0)) AS current_qty
                                           FROM (SELECT mat_code, inbnd_qtt, 0 AS outbnd_qtt
                                                 FROM minbnd_tbl
                                                 UNION ALL
                                                 SELECT mat_code, 0 AS inbnd_qtt, outbnd_qtt
                                                 FROM moutbnd_tbl) x
                                           GROUP BY mat_code) s ON s.mat_code = d.mat_code
                                WHERE d.mpr_code = ?
                                ORDER BY d.mat_code`;

// MPR 불러오기용 모달 + 검색
const selectMprHeaderModal = `SELECT mpr_code, reqdate, deadline, mcode, mrp_code
                         FROM mpr_tbl
                         WHERE mpr_code like ?
                         ORDER BY mpr_code desc`;

// MPR 불러오기용 조회 - 헤더부분
const selectMprHeader = `SELECT m.mpr_code, m.reqdate, m.deadline, m.mcode, m.mrp_code, e.emp_name, d.dept_name
                         FROM mpr_tbl m
                         JOIN emp_tbl e ON e.emp_code = m.mcode
                         LEFT JOIN dept_tbl d ON d.dept_code = e.dept_code
                         WHERE m.mpr_code = ?`;

// 공급업체 목록 조회
const selectAllClientTbl = `SELECT client_code, client_name, client_type, c2.note
                            FROM client_tbl c
                            JOIN common_code c2 ON c2.com_value = c.client_type
                            WHERE client_name like ?`;

//MRP 기준 정보 불러오기
const selectByMrpCodeMrpDTbl = `SELECT d.mrp_code, d.mrp_d_code, d.mat_code, m.mat_name,
                                       d.req_qtt, d2.mrp_note, d.unit, c2.note AS unit_label,
                                       IFNULL(s.current_qty, 0) AS current_qty,
                                       CASE WHEN d.req_qtt - (IFNULL(s.current_qty, 0) - IFNULL(m.save_inven, 0)) > 0
                                            THEN d.req_qtt - (IFNULL(s.current_qty, 0) - IFNULL(m.save_inven, 0))
                                            ELSE 0
                                       END AS lack_qty, c.client_code, c.client_name
                                FROM mrp_d_tbl d
                                JOIN mrp_tbl d2 ON d.mrp_code = d2.mrp_code
                                JOIN mat_tbl m ON m.mat_code = d.mat_code
                                LEFT JOIN client_tbl c ON c.client_code = m.sup
                                LEFT JOIN common_code c2 ON c2.com_value = d.unit
                                                            AND c2.group_value = '0H'
                                LEFT JOIN (SELECT mat_code, SUM(in_qty) - SUM(out_qty) AS current_qty
                                           FROM (SELECT mat_code, IFNULL(SUM(inbnd_qtt), 0) AS in_qty, 0 AS out_qty
                                                 FROM minbnd_tbl
                                                 GROUP BY mat_code
                                           UNION ALL
                                                 SELECT mat_code, 0 AS in_qty, IFNULL(SUM(outbnd_qtt), 0) AS out_qty
                                                 FROM moutbnd_tbl
                                                 GROUP BY mat_code)x
                                           GROUP BY mat_code) s ON s.mat_code = d.mat_code
                                WHERE d.mrp_code = ?
                                ORDER BY d.mrp_d_code`;

// 구매요청 수정/삭제 여부 확인
const selectIsEditable = `SELECT 1 FROM mpr_mapp_tbl WHERE mpr_code = ? LIMIT 1`;

// 구매요청 헤더 수정
const updateMprTbl = `UPDATE mpr_tbl
                      SET reqdate  = ?, deadline = ?, mrp_code = ?
                      WHERE mpr_code = ?`;

// 구매요청 상세 삭제
const deleteMprDTbl = `DELETE FROM mpr_d_tbl WHERE mpr_d_code = ?`;

// 구매요청 상세 수정
const updateMprDTbl = `UPDATE mpr_d_tbl
                       SET req_qtt = ?, unit = ?, note = ?, mat_sup = ?, mat_code = ?
                       WHERE mpr_d_code = ?`;

// 수정 시 기존 MPR이 참조하던 MRP 코드 확인용 (MRP 변경/추가 방지)
const selectByMprCodeIsMrpCode = `SELECT mpr_code, mrp_code
                                  FROM mpr_tbl
                                  WHERE mpr_code = ?`;

//// MRP 선택해서 들어온 자재인지 구분
const selectByMprDCodeSourceType = `select source_type FROM mpr_d_tbl where mpr_d_code = ?`;

// 구매요청 삭제
const deleteMpr = `DELETE FROM mpr_tbl WHERE mpr_code = ?`;

// 구매요청 삭제 전 상세 삭제
const deleteDetailMpr = `DELETE FROM mpr_d_tbl WHERE mpr_code = ?`;

// 자재 입출고내역조회
const selectMaterialInOutList = `SELECT *
                                 FROM (SELECT 'IN' AS io_type, mi.minbnd_code AS io_code,
                                               mi.inbnd_date AS process_date, mi.mat_code,
                                               m.mat_name, m.spec, 
                                               COALESCE(md.req_qtt, mi.inbnd_qtt) AS req_qtt,
                                               mi.inbnd_qtt AS proc_qtt, m.unit, c2.note as unit_label,
                                               CASE 
                                                    WHEN md.req_qtt IS NULL THEN 'c2'
                                                    WHEN md.req_qtt = mi.inbnd_qtt OR md.req_qtt < mi.inbnd_qtt THEN 'c2'
                                                    WHEN md.req_qtt > mi.inbnd_qtt THEN 'c3'
                                               END AS status_code, cc.note AS status_name,
                                               mi.mcode AS emp_code, e.emp_name
                                       FROM minbnd_tbl mi
                                       LEFT JOIN qio_tbl q ON q.qio_code = mi.qio_code 
                                       LEFT JOIN mpo_d_tbl md ON md.mpo_d_code = q.mpo_d_code     
                                            JOIN mat_tbl m ON m.mat_code = mi.mat_code
                                            JOIN emp_tbl e ON e.emp_code = mi.mcode
                                            JOIN common_code c2 ON c2.com_value = m.unit
                                       LEFT JOIN common_code cc ON cc.group_value = '0C'
                                                                   and cc.com_value = CASE
                                                                                          WHEN md.req_qtt is null THEN 'c2'
                                                                                          WHEN md.req_qtt <= mi.inbnd_qtt THEN 'c2'
                                                                                          ELSE 'c3'
                                                                                      END
                                                                  

                                 UNION ALL
                                 SELECT 'OUT' AS io_type, mo.moutbnd_code AS io_code,
                                         mo.moutbnd_date AS process_date, mo.mat_code,
                                         m.mat_name, m.spec, mo.outbnd_qtt AS req_qtt,
                                         mo.outbnd_qtt AS proc_qtt, m.unit, NULL as unit_label,
                                         'c4' AS status_code, cc.note AS status_name, mo.emp_code AS emp_code, e.emp_name
                                 FROM moutbnd_tbl mo
                                 JOIN mat_tbl m ON m.mat_code = mo.mat_code
                                 LEFT JOIN emp_tbl e ON e.emp_code = mo.emp_code
                                 LEFT JOIN common_code cc ON cc.group_value = '0C' AND cc.com_value = 'c2') t
                                 WHERE 1 = 1 AND (? = 'ALL' OR t.io_type = ?)
                                             AND (? IS NULL OR t.process_date >= ?)
                                             AND (? IS NULL OR t.process_date <= ?)
                                             AND (? = '' OR t.mat_code LIKE CONCAT('%', ?, '%')
                                                         OR t.mat_name LIKE CONCAT('%', ?, '%'))
                                             AND (? = 'ALL' OR t.status_code = ?)
                                 ORDER BY t.io_type, t.process_date DESC `;

// 완제품 입출고내역조회
const selectProductInOutList = `SELECT *
                                FROM (SELECT 'IN' AS io_type, pi.pinbnd_code AS io_code,
                                             pi.pinbnd_date AS process_date, pi.prod_code,
                                             p.prod_name, pi.qtt AS req_qtt, pi.qtt AS proc_qtt,
                                             'c2' AS status_code, cc.note AS status_name,
                                             pi.mcode AS emp_code, e.emp_name
                                      FROM pinbnd_tbl pi
                                      JOIN prod_tbl p ON p.prod_code = pi.prod_code
                                      JOIN emp_tbl e ON e.emp_code = pi.mcode
                                      LEFT JOIN common_code cc ON cc.group_value = '0C'
                                                                  AND cc.com_value = 'c2'

                                UNION ALL

                                SELECT 'OUT' AS io_type, CONCAT(po.poutbnd_code, '-', po.prod_code, '-', po.lot_num) AS io_code,
                                       po.deadline AS process_date, po.prod_code, p.prod_name,
                                       po.req_qtt AS req_qtt, po.outbnd_qtt AS proc_qtt,
                                       'c4' AS status_code, cc.note AS status_name,
                                       po.mcode AS emp_code, e.emp_name
                                FROM poutbnd_tbl po
                                JOIN prod_tbl p ON p.prod_code = po.prod_code
                                JOIN emp_tbl e ON e.emp_code = po.mcode
                                LEFT JOIN common_code cc ON cc.group_value = '0C'
                                                            AND cc.com_value = 'c4') t
                                WHERE 1 = 1
                                      AND (? = 'ALL' OR t.io_type = ?)
                                      AND (? IS NULL OR t.process_date >= ?)
                                      AND (? IS NULL OR t.process_date <= ?)
                                      AND ( ? = ''
                                            OR t.prod_code LIKE CONCAT('%', ?, '%')
                                            OR t.prod_name LIKE CONCAT('%', ?, '%'))
                                      AND (? = 'ALL' OR t.status_code = ?)
                                ORDER BY t.io_type, t.process_date DESC`;

// insert, update 중복 체크 용
const selectMprDExists = `SELECT 1
                          FROM mpr_d_tbl
                          WHERE mpr_code = ? AND mat_code = ? AND source_type = ?
                          LIMIT 1`;

// 재고현황 목록 + 검색
const selectMaterialStockList = `SELECT m.mat_code, m.mat_name, bm.mat_type, cc_i.note AS mat_type_name,
                                        IFNULL(s.current_qty, 0) AS current_qty, IFNULL(m.save_inven, 0) AS save_inven,

                                        CASE WHEN IFNULL(m.save_inven, 0) = 0 THEN 'd2'
                                             WHEN IFNULL(s.current_qty, 0) < IFNULL(m.save_inven, 0) THEN 'd4'
                                             WHEN IFNULL(s.current_qty, 0) < IFNULL(m.save_inven, 0) * 1.2 THEN 'd1'
                                             WHEN IFNULL(s.current_qty, 0) <= IFNULL(m.save_inven, 0) * 2 THEN 'd2'
                                             ELSE 'd3'
                                        END AS stock_status_code, cc_d.note AS stock_status_name

                                 FROM mat_tbl m
                                 LEFT JOIN bom_mat bm ON bm.mat_code = m.mat_code
                                 LEFT JOIN common_code cc_i ON cc_i.group_value = '0I'
                                 AND cc_i.com_value = bm.mat_type
                                 LEFT JOIN (SELECT mat_code, SUM(inbnd_qtt) - SUM(outbnd_qtt) AS current_qty
                                 FROM (SELECT mat_code, IFNULL(inbnd_qtt, 0) AS inbnd_qtt, 0 AS outbnd_qtt
                                       FROM minbnd_tbl
                                       UNION ALL
                                       SELECT mat_code, 0 AS inbnd_qtt, IFNULL(outbnd_qtt, 0) AS outbnd_qtt
                                       FROM moutbnd_tbl) x
                                       GROUP BY mat_code) s ON s.mat_code = m.mat_code
                                 LEFT JOIN common_code cc_d ON cc_d.group_value = '0D'
                                                               AND cc_d.com_value = (CASE WHEN IFNULL(m.save_inven, 0) = 0 THEN 'd2'
                                                                                          WHEN IFNULL(s.current_qty, 0) < IFNULL(m.save_inven, 0) THEN 'd4'
                                                                                          WHEN IFNULL(s.current_qty, 0) < IFNULL(m.save_inven, 0) * 1.2 THEN 'd1'
                                                                                          WHEN IFNULL(s.current_qty, 0) <= IFNULL(m.save_inven, 0) * 2 THEN 'd2'
                                                                                          ELSE 'd3'
                                                                                          END)
                                 WHERE m.is_used = 'f2'
                                       AND (? = '' OR m.mat_code LIKE CONCAT('%', ?, '%') OR m.mat_name LIKE CONCAT('%', ?, '%'))
                                       AND (? = 'ALL' OR bm.mat_type = ?)
                                       AND (? = 'ALL' OR (CASE
                                                            WHEN IFNULL(m.save_inven, 0) = 0 THEN 'd2'
                                                            WHEN IFNULL(s.current_qty, 0) < IFNULL(m.save_inven, 0) THEN 'd4'
                                                            WHEN IFNULL(s.current_qty, 0) < IFNULL(m.save_inven, 0) * 1.2 THEN 'd1'
                                                            WHEN IFNULL(s.current_qty, 0) <= IFNULL(m.save_inven, 0) * 2 THEN 'd2'
                                                            ELSE 'd3'
                                                          END) = ?)
                                 ORDER BY m.mat_code`;

// 재고 상세 조회 - 기본정보 + 재고정보
const selectMaterialStockDetail = `SELECT m.mat_code, m.mat_name, bm.mat_type,
                                          cc_i.note AS mat_type_name, m.spec,
                                          m.unit, cc_u.note AS unit_label,
                                          IFNULL(s.current_qty, 0) AS current_qty,
                                          IFNULL(m.save_inven, 0) AS save_inven,
                                          CASE WHEN IFNULL(m.save_inven, 0) = 0 THEN 'd2'
                                               WHEN IFNULL(s.current_qty, 0) < IFNULL(m.save_inven, 0) THEN 'd4'
                                               WHEN IFNULL(s.current_qty, 0) < IFNULL(m.save_inven, 0) * 1.2 THEN 'd1'
                                               WHEN IFNULL(s.current_qty, 0) <= IFNULL(m.save_inven, 0) * 2 THEN 'd2'
                                               ELSE 'd3'
                                          END AS stock_status_code, cc_d.note AS stock_status_name
                                   FROM mat_tbl m
                                   LEFT JOIN bom_mat bm ON bm.mat_code = m.mat_code
                                   LEFT JOIN common_code cc_i ON cc_i.group_value = '0I' AND cc_i.com_value = bm.mat_type
                                   LEFT JOIN common_code cc_u ON cc_u.com_value = m.unit
                                   LEFT JOIN (SELECT mat_code, SUM(inbnd_qtt) - SUM(outbnd_qtt) AS current_qty
                                              FROM (SELECT mat_code, IFNULL(inbnd_qtt, 0) AS inbnd_qtt, 0 AS outbnd_qtt
                                                    FROM minbnd_tbl
                                                    UNION ALL
                                                    SELECT mat_code, 0 AS inbnd_qtt, IFNULL(outbnd_qtt, 0) AS outbnd_qtt
                                                    FROM moutbnd_tbl) x
                                                    GROUP BY mat_code) s ON s.mat_code = m.mat_code 
                                   LEFT JOIN common_code cc_d ON cc_d.group_value = '0D'
                                                                 AND cc_d.com_value = (CASE
                                                                                          WHEN IFNULL(m.save_inven, 0) = 0 THEN 'd2'
                                                                                          WHEN IFNULL(s.current_qty, 0) < IFNULL(m.save_inven, 0) THEN 'd4'
                                                                                          WHEN IFNULL(s.current_qty, 0) < IFNULL(m.save_inven, 0) * 1.2 THEN 'd1'
                                                                                          WHEN IFNULL(s.current_qty, 0) <= IFNULL(m.save_inven, 0) * 2 THEN 'd2'
                                                                                          ELSE 'd3'
                                                                                       END )

                                   WHERE m.mat_code = ? AND m.is_used = 'f2'`;

// 자재 상세 - 공급업체별 재고(입고/LOT 기준)
const selectMaterialStockSupplierList = `SELECT mi.mat_code, mi.lot_num, mi.inbnd_date,
                                                mi.inbnd_qtt, c.client_code, c.client_name
                                         FROM minbnd_tbl mi
                                         LEFT JOIN client_tbl c ON c.client_code = mi.mat_sup
                                         WHERE mi.mat_code = ?
                                         ORDER BY mi.inbnd_date DESC`;

// 자재 상세 - 최근 입출고 이력
const selectMaterialStockInOutHistory = `SELECT *
                                         FROM (SELECT mi.inbnd_date AS process_date, 'IN' AS io_type,
                                                      mi.inbnd_qtt AS qty, c.client_name, e.emp_name
                                               FROM minbnd_tbl mi
                                               LEFT JOIN client_tbl c ON c.client_code = mi.mat_sup
                                               LEFT JOIN emp_tbl e ON e.emp_code = mi.mcode
                                               WHERE mi.mat_code = ?

                                         UNION ALL
                                         SELECT mo.moutbnd_date AS process_date, 'OUT' AS io_type,
                                                mo.outbnd_qtt AS qty, c.client_name, e.emp_name
                                         FROM moutbnd_tbl mo
                                         LEFT JOIN client_tbl c ON c.client_code = mo.mat_sup
                                         LEFT JOIN emp_tbl e ON e.emp_code = mo.emp_code
                                         WHERE mo.mat_code = ?) t
                                         ORDER BY process_date DESC
                                         LIMIT 10`;

module.exports = {
  selectByMatCodeMatTbl,
  selectByMprCodeMprTbl,
  selectByMprCodeMprDTbl,
  selectMaxMprCode,
  selectMaxMprDCode,
  selectAllMrpCodeMrpTbl,
  insertMprTbl,
  insertMprDTbl,
  // selectAllMprTbl,
  selectAllClientTbl,
  selectMprHeaderModal,
  selectMprHeader,
  selectByMrpCodeMrpDTbl,
  selectIsEditable,
  updateMprTbl,
  deleteMprDTbl,
  updateMprDTbl,
  selectByMprCodeIsMrpCode,
  deleteMpr,
  deleteDetailMpr,
  selectByMprDCodeSourceType,
  selectMaterialInOutList,
  selectProductInOutList,
  selectMprDExists,
  selectMaterialStockList,
  selectMaterialStockDetail,
  selectMaterialStockSupplierList,
  selectMaterialStockInOutHistory,
};
