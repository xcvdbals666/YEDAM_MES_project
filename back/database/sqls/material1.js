//발주서 전체 모달 조회
const selectAllMpoTbl = `
SELECT
  mpo.purchase_code,
  mpo.purchase_req_date,
  mpo.stat,
  mpo.regdate,
  mpo.mcode,
  mpo.note
FROM mpo_tbl mpo
ORDER BY mpo.purchase_code DESC;`;

// 자재구매요청서 전체 목록 조회
const selectAllMprTbl = `
SELECT 
  m.mpr_code,
  m.reqdate,
  m.mcode,
  m.deadline,
  m.mrp_code,
  GROUP_CONCAT(DISTINCT mat.mat_name SEPARATOR ', ') AS material_names
FROM mpr_tbl m
LEFT JOIN mpr_d_tbl md ON m.mpr_code = md.mpr_code
LEFT JOIN mat_tbl mat ON md.mat_code = mat.mat_code
GROUP BY m.mpr_code,m.reqdate, m.mcode, m.deadline,m.mrp_code
ORDER BY m.mpr_code DESC`;

// 자재구매요청서 검색 조회
const selectSearchMprTbl = `
SELECT 
  m.mpr_code,
  m.reqdate,
  m.mcode,
  m.deadline,
  m.mrp_code,
  GROUP_CONCAT(DISTINCT mat.mat_name SEPARATOR ', ') AS material_names
FROM mpr_tbl m
LEFT JOIN mpr_d_tbl md ON m.mpr_code = md.mpr_code
LEFT JOIN mat_tbl mat ON md.mat_code = mat.mat_code
WHERE m.mpr_code LIKE CONCAT('%', ?, '%')
   OR m.mcode LIKE CONCAT('%', ?, '%')
   OR mat.mat_name LIKE CONCAT('%', ?, '%')
GROUP BY m.mpr_code, m.reqdate, m.mcode, m.deadline,m.mrp_code,
ORDER BY m.mpr_code DESC`;

//발주서 기본정보 단건 조회
const selectByCodeMpoDTbl = `
SELECT 
    mpod.mat_code,
    m.mat_name,
    m.material_type_code,
    mpod.unit,
    mpod.req_qtt,
    mpod.deadline,
    c.client_name,
    mpod.client_code
FROM mpo_d_tbl mpod
JOIN mat_tbl m ON mpod.mat_code = m.mat_code
LEFT JOIN client_tbl c ON mpod.client_code = c.client_code
WHERE mpod.purchase_code = ?`;

//발주서 자재 상세 조회
const selectByCodeMpoTbl = `
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

//발주서 기본정보 등록
const insertMpoTbl = `INSERT INTO mpo_tbl (  
  purchase_code,
  purchase_req_date,
  stat,
  regdate,
  mcode,
  note
) VALUES (?, NOW(),?,NOW(),?,? )`;

//발주 자재 상세 등록
const insertMpoDetailTbl = `
INSERT INTO mpo_d_tbl (
  purchase_code,
  mat_code,
  unit,
  req_qtt,
  deadline,
  client_code
) VALUES (?, ?, ?, ?, ?, ?)`;

//발주 자재 상세목록
const selectByMrpCodeMrpDetailTbl = `
SELECT *
FROM (
  SELECT
    rd.mat_code,
    m.mat_name,
    m.material_type_code,
    rd.unit,
    IFNULL(s.current_qty, 0) AS current_stock,
    rd.req_qtt,
    IFNULL(p.plan_in_qty, 0) AS plan_in_qty,
    CASE
      WHEN rd.req_qtt
           - (
               IFNULL(s.current_qty, 0)
               + IFNULL(p.plan_in_qty, 0)
               - IFNULL(m.save_inven, 0)
             ) > 0
      THEN rd.req_qtt
           - (
               IFNULL(s.current_qty, 0)
               + IFNULL(p.plan_in_qty, 0)
               - IFNULL(m.save_inven, 0)
             )
      ELSE 0
    END AS shortage_qtt,
    CASE
      WHEN rd.req_qtt
           - (
               IFNULL(s.current_qty, 0)
               + IFNULL(p.plan_in_qty, 0)
               - IFNULL(m.save_inven, 0)
             ) > 0
      THEN rd.req_qtt
           - (
               IFNULL(s.current_qty, 0)
               + IFNULL(p.plan_in_qty, 0)
               - IFNULL(m.save_inven, 0)
             )
      ELSE 0
    END AS order_qtt,

    DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), '%Y-%m-%d') AS delivery_date,
    c.client_name AS supplier_name

  FROM mpr_d_tbl rd
  JOIN mat_tbl m ON rd.mat_code = m.mat_code
  LEFT JOIN client_tbl c ON c.client_code = m.sup

  LEFT JOIN (
    SELECT mat_code,
           IFNULL(SUM(inbnd_qtt), 0) - IFNULL(SUM(outbnd_qtt), 0) AS current_qty
    FROM (
      SELECT mat_code, inbnd_qtt, 0 AS outbnd_qtt FROM minbnd_tbl
      UNION ALL
      SELECT mat_code, 0 AS inbnd_qtt, outbnd_qtt FROM moutbnd_tbl
    ) x
    GROUP BY mat_code
  ) s ON s.mat_code = rd.mat_code

  LEFT JOIN (
    SELECT
      d.mat_code,
      SUM(d.req_qtt) AS plan_in_qty
    FROM mpo_d_tbl d
    JOIN mpr_mapp_tbl map
      ON d.purchase_code = map.purchase_code
    GROUP BY d.mat_code
  ) p ON p.mat_code = rd.mat_code

  WHERE rd.mpr_code = ?
) t`;
//자재 추가 목록
const selectAllMatTbl = `
SELECT
  m.mat_code,
  m.mat_name,
  m.material_type_code,
  m.unit,
  IFNULL(s.current_qty, 0) AS current_stock,
  c.client_name AS supplier_name,
  m.sup AS client_code
FROM mat_tbl m
LEFT JOIN client_tbl c
  ON m.sup = c.client_code
LEFT JOIN (
  SELECT mat_code,
         IFNULL(SUM(inbnd_qtt), 0) - IFNULL(SUM(outbnd_qtt), 0) AS current_qty
  FROM (
    SELECT mat_code, inbnd_qtt, 0 AS outbnd_qtt FROM minbnd_tbl
    UNION ALL
    SELECT mat_code, 0 AS inbnd_qtt, outbnd_qtt FROM moutbnd_tbl
  ) x
  GROUP BY mat_code
) s ON s.mat_code = m.mat_code
WHERE m.is_used = 'f2'
ORDER BY m.mat_code
`;
module.exports = {
  selectAllMpoTbl,
  selectAllMprTbl,
  selectSearchMprTbl,
  selectByCodeMpoTbl,
  selectByCodeMpoDTbl,
  selectNextMpoCode,
  insertMpoTbl,
  insertMpoDetailTbl,
  selectByMrpCodeMrpDetailTbl,
  selectAllMatTbl,
};
