// 발주서 (MPO) 관련
// 발주서 전체 목록 조회
const selectAllMpoTbl = `
SELECT 
  mpo.purchase_code,
  DATE_FORMAT(mpo.purchase_req_date, '%Y-%m-%d') AS purchase_req_date,  
  CASE 
    WHEN mpo.stat = 'c1' THEN '요청완료'
    WHEN mpo.stat = 'c2' THEN '입고완료'
    ELSE mpo.stat
  END AS stat,
  mpo.mcode,
  e.emp_name,
  DATE_FORMAT(mpo.regdate, '%Y-%m-%d') AS regdate,
  GROUP_CONCAT(DISTINCT m.mat_name SEPARATOR ', ') AS material_names,
  GROUP_CONCAT(DISTINCT 
    CASE 
      WHEN m.material_type_code = 't1' THEN '원자재'
      WHEN m.material_type_code = 't2' THEN '부자재'
      ELSE m.material_type_code
    END 
    SEPARATOR ', '
  ) AS material_type,
  GROUP_CONCAT(DISTINCT c.client_name SEPARATOR ', ') AS supplier_name,
  SUM(d.req_qtt) AS req_qtt,
  MIN(DATE_FORMAT(d.deadline, '%Y-%m-%d')) AS deadline
FROM mpo_tbl mpo
LEFT JOIN emp_tbl e ON mpo.mcode = e.emp_code       
LEFT JOIN mpo_d_tbl d ON mpo.purchase_code = d.purchase_code
LEFT JOIN mat_tbl m ON d.mat_code = m.mat_code
LEFT JOIN client_tbl c ON d.client_code = c.client_code
GROUP BY mpo.purchase_code, mpo.purchase_req_date, mpo.stat, mpo.mcode, mpo.regdate
ORDER BY mpo.purchase_code DESC
`;

// 발주서 기본정보 단건 조회
const selectByCodeMpoTbl = `
SELECT 
  mpo.purchase_code,           
  DATE_FORMAT(mpo.purchase_req_date, '%Y-%m-%d') AS purchase_req_date,     
  mpo.mcode,
  e.emp_name,                   
    CASE 
    WHEN mpo.stat = 'c1' THEN '요청완료'
    WHEN mpo.stat = 'c2' THEN '입고완료'
    ELSE mpo.stat
  END AS stat,                   
  mpo.note,                    
  mpr.mpr_code                 
FROM mpo_tbl mpo
LEFT JOIN emp_tbl e ON mpo.mcode = e.emp_code
LEFT JOIN mpr_mapp_tbl mapp ON mpo.purchase_code = mapp.purchase_code
LEFT JOIN mpr_tbl mpr ON mapp.mpr_code = mpr.mpr_code
WHERE mpo.purchase_code = ?
`;

// 발주서 자재 상세 조회
const selectByCodeMpoDTbl = `
SELECT 
  mpod.mat_code,
  m.mat_name,
  m.material_type_code,
  mpod.unit,
  mpod.req_qtt,
  IFNULL(s.current_qty, 0) AS current_stock,
  CASE
    WHEN mpod.req_qtt - IFNULL(s.current_qty, 0) > 0
    THEN mpod.req_qtt - IFNULL(s.current_qty, 0)
    ELSE 0
  END AS shortage_qtt,
  DATE_FORMAT(mpod.deadline, '%Y-%m-%d') AS deadline,
  c.client_name AS supplier_name,
  mpod.client_code
FROM mpo_d_tbl mpod
JOIN mat_tbl m ON mpod.mat_code = m.mat_code
LEFT JOIN client_tbl c ON mpod.client_code = c.client_code
LEFT JOIN (
  SELECT mat_code,
         IFNULL(SUM(inbnd_qtt), 0) - IFNULL(SUM(outbnd_qtt), 0) AS current_qty
  FROM (
    SELECT mat_code, inbnd_qtt, 0 AS outbnd_qtt FROM minbnd_tbl
    UNION ALL
    SELECT mat_code, 0 AS inbnd_qtt, outbnd_qtt FROM moutbnd_tbl
  ) x
  GROUP BY mat_code
) s ON s.mat_code = mpod.mat_code
WHERE mpod.purchase_code = ?
`;

// 발주서번호 자동생성
const selectNextMpoCode = `
SELECT 
  CONCAT('BJ', LPAD(IFNULL(MAX(CAST(SUBSTRING(purchase_code, 3) AS UNSIGNED)), 0) + 1, 4, '0')) 
  AS next_code
FROM mpo_tbl
WHERE purchase_code LIKE 'BJ%'
`;

// 발주서 기본정보 등록
const insertMpoTbl = `
INSERT INTO mpo_tbl (  
  purchase_code,
  purchase_req_date,
  stat,
  regdate,
  mcode,
  note
) VALUES (?, NOW(), ?, NOW(), ?, ?)
`;

// 발주서 자재 상세 등록
const insertMpoDetailTbl = `
INSERT INTO mpo_d_tbl (
  mpo_d_code,
  purchase_code,
  mat_code,
  unit,
  req_qtt,
  deadline,
  client_code
) VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// 발주서 기본정보 수정
const updateMpoTbl = `
UPDATE mpo_tbl 
SET stat = ?, mcode = ?, note = ?
WHERE purchase_code = ?
`;

// 발주서 자재 상세 삭제
const deleteMpoDetailTbl = `
DELETE FROM mpo_d_tbl WHERE purchase_code = ?
`;

// 발주서 삭제 (기본정보)
const deleteMpoTbl = `
DELETE FROM mpo_tbl WHERE purchase_code = ?
`;
// 발주서 (mapp 삭제)
const deleteMprMappByPurchaseCode = `
DELETE FROM mpr_mapp_tbl WHERE purchase_code = ?
`;

// 발주서 검색
const selectSearchMpoTbl = `
SELECT 
  mpo.purchase_code,
  DATE_FORMAT(mpo.purchase_req_date, '%Y-%m-%d') AS purchase_req_date,
  CASE 
    WHEN mpo.stat = 'c1' THEN '요청완료'
    WHEN mpo.stat = 'c2' THEN '입고완료'
    ELSE mpo.stat
  END AS stat,
  mpo.mcode,
  e.emp_name,
  DATE_FORMAT(mpo.regdate, '%Y-%m-%d') AS regdate,
  GROUP_CONCAT(DISTINCT m.mat_name SEPARATOR ', ') AS material_names,
  GROUP_CONCAT(DISTINCT 
    CASE 
      WHEN m.material_type_code = 't1' THEN '원자재'
      WHEN m.material_type_code = 't2' THEN '부자재'
      ELSE m.material_type_code
    END 
    SEPARATOR ', '
  ) AS material_type,
  GROUP_CONCAT(DISTINCT c.client_name SEPARATOR ', ') AS supplier_name,
  SUM(d.req_qtt) AS req_qtt,
  MIN(DATE_FORMAT(d.deadline, '%Y-%m-%d')) AS deadline
FROM mpo_tbl mpo
LEFT JOIN emp_tbl e ON mpo.mcode = e.emp_code        
LEFT JOIN mpo_d_tbl d ON mpo.purchase_code = d.purchase_code
LEFT JOIN mat_tbl m ON d.mat_code = m.mat_code
LEFT JOIN client_tbl c ON d.client_code = c.client_code
WHERE mpo.purchase_code LIKE CONCAT('%', ?, '%')
GROUP BY mpo.purchase_code, mpo.purchase_req_date, mpo.stat, mpo.mcode, mpo.regdate
ORDER BY mpo.purchase_code DESC
`;

//발주 상세 조회 검색
const selectSearchMpoDetailTbl = `
SELECT 
  mpo.purchase_code,
  DATE_FORMAT(mpo.purchase_req_date, '%Y-%m-%d') AS purchase_req_date,
  CASE 
    WHEN mpo.stat = 'c1' THEN '요청완료'
    WHEN mpo.stat = 'c2' THEN '입고완료'
    ELSE mpo.stat
  END AS stat,
  mpo.mcode,
  e.emp_name,
  DATE_FORMAT(mpo.regdate, '%Y-%m-%d') AS regdate,
  GROUP_CONCAT(DISTINCT m.mat_name SEPARATOR ', ') AS material_names,
  GROUP_CONCAT(DISTINCT 
    CASE 
      WHEN m.material_type_code = 't1' THEN '원자재'
      WHEN m.material_type_code = 't2' THEN '부자재'
      ELSE m.material_type_code
    END SEPARATOR ', '
  ) AS material_type,
  GROUP_CONCAT(DISTINCT c.client_name SEPARATOR ', ') AS supplier_name,
  SUM(d.req_qtt) AS req_qtt,
  MIN(DATE_FORMAT(d.deadline, '%Y-%m-%d')) AS deadline
FROM mpo_tbl mpo
LEFT JOIN emp_tbl e ON mpo.mcode = e.emp_code
LEFT JOIN mpo_d_tbl d ON mpo.purchase_code = d.purchase_code
LEFT JOIN mat_tbl m ON d.mat_code = m.mat_code
LEFT JOIN client_tbl c ON d.client_code = c.client_code
WHERE 1=1
  AND (? = '' OR mpo.purchase_code LIKE CONCAT('%', ?, '%'))
  AND (? = '전체' OR 
       (CASE 
          WHEN m.material_type_code = 't1' THEN '원자재'
          WHEN m.material_type_code = 't2' THEN '부자재'
        END) = ?)
  AND (? = '' OR c.client_name LIKE CONCAT('%', ?, '%'))
  AND (? = '전체' OR 
       (CASE 
          WHEN mpo.stat = 'c1' THEN '요청완료'
          WHEN mpo.stat = 'c2' THEN '입고완료'
        END) = ?)
GROUP BY mpo.purchase_code, mpo.purchase_req_date, mpo.stat, mpo.mcode, mpo.regdate
ORDER BY mpo.purchase_code DESC
`;

// 자재구매요청서 (MPR) 관련
// 자재구매요청서 전체 목록 조회
const selectAllMprTbl = `
SELECT 
  m.mpr_code,
  DATE_FORMAT(m.reqdate, '%Y-%m-%d') AS reqdate,
  m.mcode,
  e.emp_name,
  DATE_FORMAT(m.deadline, '%Y-%m-%d') AS deadline,
  m.mrp_code,
  GROUP_CONCAT(DISTINCT mat.mat_name SEPARATOR ', ') AS material_names
FROM mpr_tbl m
LEFT JOIN emp_tbl e ON m.mcode = e.emp_code          
LEFT JOIN mpr_d_tbl md ON m.mpr_code = md.mpr_code
LEFT JOIN mat_tbl mat ON md.mat_code = mat.mat_code
GROUP BY m.mpr_code, m.reqdate, m.mcode, m.deadline, m.mrp_code
ORDER BY m.mpr_code DESC
`;

// 자재구매요청서 검색 조회
const selectSearchMprTbl = `
SELECT 
  m.mpr_code,
  DATE_FORMAT(m.reqdate, '%Y-%m-%d') AS reqdate,
  m.mcode,
  DATE_FORMAT(m.deadline, '%Y-%m-%d') AS deadline,
  m.mrp_code,
  e.emp_name,
  GROUP_CONCAT(DISTINCT mat.mat_name SEPARATOR ', ') AS material_names
FROM mpr_tbl m
LEFT JOIN emp_tbl e ON m.mcode = e.emp_code          
LEFT JOIN mpr_d_tbl md ON m.mpr_code = md.mpr_code
LEFT JOIN mat_tbl mat ON md.mat_code = mat.mat_code
WHERE m.mpr_code LIKE CONCAT('%', ?, '%')
   OR m.mcode LIKE CONCAT('%', ?, '%')
   OR mat.mat_name LIKE CONCAT('%', ?, '%')
GROUP BY m.mpr_code, m.reqdate, m.mcode, m.deadline, m.mrp_code
ORDER BY m.mpr_code DESC
`;

// 자재구매요청서 상세 조회 (발주용)
const selectByMrpCodeMrpDetailTbl = `
SELECT *
FROM (
  SELECT
    rd.mat_code,
    m.mat_name,
    m.material_type_code,
    rd.unit,
    rd.req_qtt AS req_qtt,                          
    IFNULL(s.current_qty, 0) AS current_stock,      
    IFNULL(p.plan_in_qty, 0) AS plan_in_qty,        
    m.save_inven AS safety_stock,                  
    
    CASE
      WHEN rd.req_qtt - (IFNULL(s.current_qty, 0) + IFNULL(p.plan_in_qty, 0) - IFNULL(m.save_inven, 0)) > 0
      THEN rd.req_qtt - (IFNULL(s.current_qty, 0) + IFNULL(p.plan_in_qty, 0) - IFNULL(m.save_inven, 0))
      ELSE 0
    END AS shortage_qtt,
    
    CASE
      WHEN rd.req_qtt - (IFNULL(s.current_qty, 0) + IFNULL(p.plan_in_qty, 0) - IFNULL(m.save_inven, 0)) > 0
      THEN rd.req_qtt - (IFNULL(s.current_qty, 0) + IFNULL(p.plan_in_qty, 0) - IFNULL(m.save_inven, 0))
      ELSE 0
    END AS order_qtt,
    
  DATE_FORMAT(DATE_ADD(mpr.reqdate, INTERVAL 7 DAY), '%Y-%m-%d') AS delivery_date,  -- 요청일 기준 +7일!
  c.client_name AS supplier_name,
  m.sup AS client_code
  FROM mpr_d_tbl rd
  JOIN mpr_tbl mpr ON rd.mpr_code = mpr.mpr_code 
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
    SELECT d.mat_code, SUM(d.req_qtt) AS plan_in_qty
    FROM mpo_d_tbl d
    JOIN mpo_tbl h ON d.purchase_code = h.purchase_code
    WHERE h.stat = 'c1'  
    GROUP BY d.mat_code
  ) p ON p.mat_code = rd.mat_code
  
  WHERE rd.mpr_code = ?
) t
`;

// 자재 (MAT) 관련
// 자재 전체 목록 조회 (모달용)
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
LEFT JOIN client_tbl c ON m.sup = c.client_code
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

// MPR-MPO 매핑 코드 자동생성
const selectNextMappCode = `
SELECT 
  CONCAT('MAPP-', LPAD(IFNULL(MAX(CAST(SUBSTRING(mapp_code, 6) AS UNSIGNED)), 0) + 1, 3, '0')) 
  AS next_code
FROM mpr_mapp_tbl
WHERE mapp_code LIKE 'MAPP-%'
`;

// MPR-MPO 매핑 등록
const insertMprMappTbl = `
INSERT INTO mpr_mapp_tbl (
  mapp_code,
  mpr_code,
  purchase_code,
  req_qtt,
  regdate
) VALUES (?, ?, ?, ?, NOW())
`;

//입고관리
// LOT 번호 자동생성 - 자재
const selectNextLotNum = `
  SELECT CONCAT('LOT-100-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', 
    LPAD(IFNULL(MAX(CAST(SUBSTRING(lot_num, -3) AS UNSIGNED)), 0) + 1, 3, '0')
  ) AS next_lot_num
  FROM mat_lot_tbl
  WHERE lot_num LIKE CONCAT('LOT-100-', DATE_FORMAT(NOW(), '%Y%m%d'), '%')
`;

// LOT 번호 자동생성 - 완제품
const selectNextProductLotNum = `
  SELECT CONCAT('LOT-400-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', 
    LPAD(IFNULL(MAX(CAST(SUBSTRING(lot_num, -3) AS UNSIGNED)), 0) + 1, 3, '0')
  ) AS next_lot_num
  FROM lot_tbl
  WHERE lot_num LIKE CONCAT('LOT-400-', DATE_FORMAT(NOW(), '%Y%m%d'), '%')
`;

// LOT 등록 - 자재
const insertMatLot = `
  INSERT INTO mat_lot_tbl (lot_num, issdate, item_type_code, mat_code)
  VALUES (?, NOW(), ?, ?)
`;

// LOT 등록 - 완재품
const insertProductLot = `
  INSERT INTO lot_tbl (lot_num, issdate, item_type_code, mat_code)
  VALUES (?, NOW(), ?, ?)
`;

// 입고코드 자동생성
const selectNextMinbndCode = `
  SELECT CONCAT('MIN-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', 
    LPAD(IFNULL(MAX(CAST(SUBSTRING(minbnd_code, -3) AS UNSIGNED)), 0) + 1, 3, '0')
  ) AS next_code
  FROM minbnd_tbl
  WHERE minbnd_code LIKE CONCAT('MIN-', DATE_FORMAT(NOW(), '%Y%m%d'), '%')
`;

// 입고 등록
const insertMinbnd = `
  INSERT INTO minbnd_tbl (
    minbnd_code, mat_code, mat_type, unit, inbnd_qtt, 
    inbnd_date, ord_qtt, lot_num, mat_sup, qio_code, mcode
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// 입고코드 자동생성 - 완제품
const selectNextPinbndCode = `
  SELECT CONCAT('PIN-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', 
    LPAD(IFNULL(MAX(CAST(SUBSTRING(pinbnd_code, -3) AS UNSIGNED)), 0) + 1, 3, '0')
  ) AS next_code
  FROM pinbnd_tbl
  WHERE pinbnd_code LIKE CONCAT('PIN-', DATE_FORMAT(NOW(), '%Y%m%d'), '%')
`;

// 입고 등록 - 완제품
const insertPinbnd = `
INSERT INTO pinbnd_tbl (
  pinbnd_code,
  prod_code,
  qtt,
  pinbnd_date,
  lot_num,
  qio_code,
  mcode
) VALUES (?, ?, ?, NOW(), ?, ?, ?)
`;

// 생산실적 중 품질검사 합격 목록 조회 (입고 안 된 것만) - 완제품
const selectPassedProductList = `
SELECT 
  qio.qio_code AS qio_code,
  qir.qir_code,
  qir.pass_qtt,
  
  prdr.prod_code AS prod_code,
  p.prod_name,
  p.unit,
  
  e.emp_name,
  DATE(NOW()) AS inbnd_date
FROM qir_tbl qir
JOIN qio_tbl qio 
  ON qir.qio_code = qio.qio_code
LEFT JOIN prdr_tbl prdr
  ON qio.prdr_code = prdr.prdr_code
LEFT JOIN prod_tbl p
  ON prdr.prod_code = p.prod_code
LEFT JOIN emp_tbl e 
  ON qio.emp_code = e.emp_code
WHERE qir.result = 'g2'
  AND qio.prdr_code IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM pinbnd_tbl pb
    WHERE pb.qir_code = qir.qir_code
  )
`;

// 품질검사 합격 목록 조회 (입고 안 된 것만)
const selectPassedQirList = `
SELECT 
  qio.qio_code,
  qir.qir_code,
  qir.pass_qtt,
  mpod.mat_code,
  m.mat_name,
  m.material_type_code,
  mpod.unit,
  mpod.client_code,
  c.client_name,
  e.emp_name,
  DATE(NOW()) AS inbnd_date
FROM qir_tbl qir
JOIN qio_tbl qio 
  ON qir.qio_code = qio.qio_code
LEFT JOIN mpo_d_tbl mpod 
  ON qio.mpo_d_code = mpod.mpo_d_code
LEFT JOIN mat_tbl m 
  ON mpod.mat_code = m.mat_code
LEFT JOIN client_tbl c 
  ON mpod.client_code = c.client_code
LEFT JOIN emp_tbl e 
  ON qio.emp_code = e.emp_code
WHERE qir.result = 'g2'
  AND qio.mpo_d_code IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM minbnd_tbl mnb
    WHERE mnb.qio_code = qio.qio_code
  )
`;

// 발주서 상태 업데이트
// const updateMpoStatByQioCode = `
//   UPDATE mpo_tbl mpo
//   JOIN mpo_d_tbl mpod ON mpo.purchase_code = mpod.purchase_code
//   JOIN qir_tbl qir ON mpod.mpo_d_code = qir.mpo_d_code
//   SET mpo.stat = 'c2'
//   WHERE qir.qio_code = ?
// `;
const updateMpoStatByQioCode = `
UPDATE mpo_tbl mpo
JOIN mpo_d_tbl mpod 
  ON mpo.purchase_code = mpod.purchase_code
JOIN qio_tbl qio 
  ON mpod.mpo_d_code = qio.mpo_d_code
SET mpo.stat = 'c2'
WHERE qio.qio_code = ?
`;

module.exports = {
  // 발주서 (MPO)
  selectAllMpoTbl,
  selectByCodeMpoTbl,
  selectByCodeMpoDTbl,
  selectNextMpoCode,
  insertMpoTbl,
  insertMpoDetailTbl,
  selectSearchMpoTbl,
  selectSearchMpoDetailTbl,
  updateMpoTbl,
  deleteMpoDetailTbl,
  deleteMpoTbl,

  // 자재구매요청서 (MPR)
  selectAllMprTbl,
  selectSearchMprTbl,
  selectByMrpCodeMrpDetailTbl,

  // 자재 (MAT)
  selectAllMatTbl,

  // 발주서 & 자재구매요청서 매핑(MPR_MAPP)
  selectNextMappCode,
  insertMprMappTbl,
  deleteMprMappByPurchaseCode,
  updateMpoStatByQioCode,

  //입고관리
  selectNextLotNum,
  insertMatLot,
  selectNextMinbndCode,
  insertMinbnd,
  selectPassedQirList,

  //입관관리-완제품
  selectNextProductLotNum,
  insertProductLot,
  selectNextPinbndCode,
  insertPinbnd,
  selectPassedProductList,
};
