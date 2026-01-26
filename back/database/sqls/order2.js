// 출고 조회
const selectAllOutreqtbl = `
SELECT 
  r.out_req_code, 
  r.out_req_date, 
  d.ord_amount,
  
  pr.prod_name,
  d.prod_code,
  
  d.out_req_d_amount, 
  CAST(COALESCE(already_out.total_outbnd_qtt, 0) AS UNSIGNED) as outbnd_qtt,
  
  r.out_req_stat,
  e.emp_name,
  c.client_name

FROM out_req_tbl r

JOIN out_req_d_tbl d ON r.out_req_code = d.out_req_code
JOIN prod_tbl pr ON pr.prod_code = d.prod_code

-- 이미 출고된 수량 집계 (제품별로)
LEFT JOIN (
  SELECT 
    outbound_request_code,
    prod_code,
    SUM(outbnd_qtt) AS total_outbnd_qtt
  FROM poutbnd_tbl
  GROUP BY outbound_request_code, prod_code
) already_out ON already_out.outbound_request_code = r.out_req_code 
              AND already_out.prod_code = d.prod_code

JOIN emp_tbl e ON e.emp_code = r.mcode
JOIN client_tbl c ON c.client_code = r.client_code

ORDER BY r.out_req_date DESC
`;

// 출고 조회 검색
const searchOutreqtbl = `
SELECT r.out_req_code, 
       r.out_req_date, 

       pr.prod_name, 
       
       po.req_qtt, 
       po.outbnd_qtt,
       (po.req_qtt - po.outbnd_qtt) as un_qtt, 
       po.stat,
       
       e.emp_name, 
       
       c.client_name

FROM out_req_tbl r

JOIN out_req_d_tbl d ON r.out_req_code = d.out_req_code
JOIN prod_tbl pr ON pr.prod_code = d.prod_code
JOIN poutbnd_tbl po ON po.outbound_request_code = r.out_req_code
JOIN emp_tbl e ON e.emp_code = r.mcode
JOIN client_tbl c ON c.client_code = r.client_code

WHERE (? IS NULL OR r.out_req_code = ?)
  AND (? IS NULL OR pr.prod_code = ?)
  AND (? IS NULL OR e.emp_code = ?)
  AND (? IS NULL OR c.client_code = ?)
  AND (? IS NULL OR po.req_qtt >= ?)
  AND (? IS NULL OR po.req_qtt <= ?)
  AND (? IS NULL OR r.out_req_date >= ?)
  AND (? IS NULL OR r.out_req_date <= ?)
ORDER BY r.out_req_date DESC
`;

// 출고 상세페이지(주문정보)

// 출고 상세페이지(출고정보)

// 출고 상세페이지(제품내역)

// 주문 기본 정보
const selectByOrdcode = `
SELECT 
  o.ord_code, 
  o.ord_date, 
  c.client_name, 
  c.client_code,
  o.note
FROM ord_tbl o
JOIN client_tbl c ON c.client_code = o.client_code
WHERE o.ord_code = ?
`;

// 주문정보 제품 조회
const selectProdList = `
SELECT 
  p.prod_name,
  p.com_value AS prod_type_code,
  c_type.note AS prod_type,
  c_spec.note AS spec, 
  c_unit.note AS unit,

  od.prod_code, 
  od.ord_amount,
  od.delivery_date,
  od.spec AS spec_code,
  od.unit AS unit_code,   

  (COALESCE(stock_in.total_in, 0) - COALESCE(out_req.total_req, 0)) AS current_stock,  
  COALESCE(already_out.already_out_amount, 0) AS already_out_amount,  
  (od.ord_amount - COALESCE(already_out.already_out_amount, 0)) AS pending_amount

FROM ord_d_tbl od

JOIN prod_tbl p ON od.prod_code = p.prod_code
JOIN common_code c_type ON c_type.com_value = p.com_value
JOIN common_code c_spec ON c_spec.com_value = od.spec
JOIN common_code c_unit ON c_unit.com_value = od.unit

LEFT JOIN (
  SELECT prod_code, SUM(qtt) AS total_in
  FROM pinbnd_tbl
  GROUP BY prod_code
) stock_in ON stock_in.prod_code = od.prod_code

LEFT JOIN (
  SELECT ord.prod_code, SUM(ord.out_req_d_amount) AS total_req
  FROM out_req_d_tbl ord
  JOIN out_req_tbl ore ON ord.out_req_code = ore.out_req_code
  WHERE ore.out_req_stat != 'r4'
  GROUP BY ord.prod_code
) out_req ON out_req.prod_code = od.prod_code

LEFT JOIN (
  SELECT 
    ore.ord_code,
    ord.prod_code,
    SUM(ord.out_req_d_amount) AS already_out_amount
  FROM out_req_d_tbl ord
  JOIN out_req_tbl ore ON ord.out_req_code = ore.out_req_code
  WHERE ore.out_req_stat != 'r4'
  GROUP BY ore.ord_code, ord.prod_code
) already_out ON already_out.ord_code = od.ord_code 
              AND already_out.prod_code = od.prod_code

WHERE od.ord_code = ?
`;

// 출고 요청 코드 생성
const generateOutReqCode = `
SELECT CONCAT(
  'OUT-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', 
  LPAD(
    IFNULL(
      (SELECT MAX(CAST(SUBSTR(out_req_code, 14, 4) AS UNSIGNED))
       FROM out_req_tbl
       WHERE SUBSTR(out_req_code, 5, 8) = DATE_FORMAT(NOW(), '%Y%m%d')
	   ), 0
	) +1
	, 4
    , '0'
  )
) as new_out_req_code
`;

// 출고 요청 insert
const insertOutReq = `
INSERT INTO out_req_tbl (
  out_req_code,
  out_req_date,
  ord_predict_date,
  note,
  ord_code,
  mcode,
  client_code,
  out_req_stat  
) VALUES (?, ?, ?, ?, ?, ?, ?, 'r1')
`;

// 출고 요청 상세 insert
const insertOutReqDetail = `
INSERT INTO out_req_d_tbl (
  out_req_d_code,
  out_req_d_amount,
  ord_amount,
  out_req_code,
  prod_code,
  com_value
) VALUES (?, ?, ?, ?, ?, ?)
`;

// 주문 상태 자동 계산 UPDATE (출고요청 등록 & 출고 등록 공통 사용)
const updateOrdStat = `
UPDATE ord_tbl o
SET o.ord_stat = CASE
  WHEN (
    SELECT COALESCE(SUM(p.outbnd_qtt), 0)
    FROM poutbnd_tbl p
    JOIN out_req_tbl r ON p.outbound_request_code = r.out_req_code
    WHERE r.ord_code = o.ord_code
  ) = 0 THEN 'q1'
  WHEN (
    SELECT COALESCE(SUM(p.outbnd_qtt), 0)
    FROM poutbnd_tbl p
    JOIN out_req_tbl r ON p.outbound_request_code = r.out_req_code
    WHERE r.ord_code = o.ord_code
  ) >= (
    SELECT COALESCE(SUM(od.ord_amount), 0)
    FROM ord_d_tbl od
    WHERE od.ord_code = o.ord_code
  ) THEN 'q3'
  ELSE 'q2'
END
WHERE o.ord_code = ?
`;

// 출고요청 기본 정보
const selectByOutReqCode = `
SELECT r.out_req_code, 
       r.out_req_date, 
       r.ord_code,        
       r.client_code, 
       r.mcode, 
       r.note,

       ord.ord_date, 

       c.client_name, 

       e.emp_name

FROM out_req_tbl r
JOIN ord_tbl ord ON ord.ord_code = r.ord_code
JOIN client_tbl c ON c.client_code = r.client_code
JOIN emp_tbl e ON e.emp_code = r.mcode
WHERE r.out_req_code = ?
`;

// 출고요청 제품 조회
const selectProdListByOutreq = `
SELECT
  p.prod_name, 
  p.com_value AS prod_type_code,

  c_type.note AS prod_type,
  c_spec.note AS spec,
  c_unit.note AS unit,

  outreqd.out_req_d_amount AS out_req_amount,

  COALESCE(already_out.already_outbnd_qtt, 0) AS already_outbnd_qtt,
  (outreqd.out_req_d_amount - COALESCE(already_out.already_outbnd_qtt, 0)) AS not_outbnd_qtt,
  (COALESCE(stock_in.total_in, 0) - COALESCE(stock_out.total_out, 0)) AS current_stock,

  od.prod_code,
  od.delivery_date,
  od.spec AS spec_code,
  od.unit AS unit_code,
  od.ord_amount,
  
  COALESCE(ord_already_out.ord_already_outbnd_qtt, 0) AS ord_already_outbnd_qtt,
  (od.ord_amount - COALESCE(ord_already_out.ord_already_outbnd_qtt, 0)) AS remaining_stock

FROM ord_d_tbl od

JOIN prod_tbl p ON od.prod_code = p.prod_code
JOIN out_req_tbl outreq ON outreq.ord_code = od.ord_code
JOIN out_req_d_tbl outreqd ON outreqd.out_req_code = outreq.out_req_code AND outreqd.prod_code = od.prod_code
JOIN common_code c_type ON c_type.com_value = p.com_value
JOIN common_code c_spec ON c_spec.com_value = od.spec
JOIN common_code c_unit ON c_unit.com_value = od.unit

LEFT JOIN (
  SELECT prod_code, SUM(qtt) AS total_in
  FROM pinbnd_tbl
  GROUP BY prod_code
) stock_in ON stock_in.prod_code = od.prod_code

LEFT JOIN (
  SELECT prod_code, SUM(outbnd_qtt) AS total_out
  FROM poutbnd_tbl
  GROUP BY prod_code
) stock_out ON stock_out.prod_code = od.prod_code

LEFT JOIN (
  SELECT prod_code, SUM(outbnd_qtt) AS already_outbnd_qtt
  FROM poutbnd_tbl
  WHERE outbound_request_code = ?
  GROUP BY prod_code
) already_out ON already_out.prod_code = od.prod_code

LEFT JOIN (
  SELECT 
    outreq_inner.ord_code,
    pout.prod_code, 
    SUM(pout.outbnd_qtt) AS ord_already_outbnd_qtt
  FROM poutbnd_tbl pout
  JOIN out_req_tbl outreq_inner ON pout.outbound_request_code = outreq_inner.out_req_code
  GROUP BY outreq_inner.ord_code, pout.prod_code
) ord_already_out ON ord_already_out.ord_code = od.ord_code AND ord_already_out.prod_code = od.prod_code

WHERE outreq.out_req_code = ?
`;

// 제품별 로트 재고 조회
const selectLotsByProdCode = `
SELECT 
  p.lot_num,
  p.pinbnd_date,
  (p.qtt - COALESCE(out_sum.total_out, 0)) AS lot_stock
FROM pinbnd_tbl p
LEFT JOIN (
  SELECT 
    lot_num,
    SUM(outbnd_qtt) AS total_out
  FROM poutbnd_tbl
  WHERE prod_code = ?
  GROUP BY lot_num
) out_sum ON out_sum.lot_num = p.lot_num
WHERE p.prod_code = ?
  AND (p.qtt - COALESCE(out_sum.total_out, 0)) > 0
ORDER BY p.pinbnd_date ASC
`;

// 완제품 출고 등록 (로트별)
const insertOutbound = `
INSERT INTO poutbnd_tbl (
  poutbnd_code,
  req_qtt,
  outbnd_qtt,
  deadline,
  stat,
  outbound_request_code,
  lot_num,
  prod_code,
  client_code,
  mcode
) VALUES (?, ?, ?, ?, 'w3', ?, ?, ?, ?, ?)
`;

// 출고요청 상태 자동 계산 업데이트
const updateOutReqStat = `
UPDATE out_req_tbl o
SET o.out_req_stat = CASE
  WHEN (
    SELECT COALESCE(SUM(outbnd_qtt), 0)
    FROM poutbnd_tbl
    WHERE outbound_request_code = o.out_req_code
  ) = 0 THEN 'r1'
  WHEN (
    SELECT COALESCE(SUM(outbnd_qtt), 0)
    FROM poutbnd_tbl
    WHERE outbound_request_code = o.out_req_code
  ) < (
    SELECT SUM(out_req_d_amount)
    FROM out_req_d_tbl
    WHERE out_req_code = o.out_req_code
  ) THEN 'r2'
  ELSE 'r3'
END
WHERE o.out_req_code = ?
`;

// 출고코드 생성 (출고요청별 순번)
const generateOutCode = `
SELECT CONCAT(
  ?,
  '-P',
  LPAD(COALESCE(MAX(CAST(SUBSTRING(poutbnd_code, -4) AS UNSIGNED)), 0) + 1, 4, '0')
) AS new_out_code
FROM poutbnd_tbl
WHERE poutbnd_code LIKE CONCAT(?, '-P%')
`;

// 출고요청 삭제
const deleteOutReq = `
UPDATE out_req_tbl 
  SET out_req_stat = 'r4',
      updated_at = NOW()
  WHERE out_req_code = ?
`;

// 출고요청 업데이트
const updateOutReq = `
  UPDATE out_req_tbl 
  SET note = ?,
      updated_at = NOW()
  WHERE out_req_code = ?
`;

// 출고요청 상세 업데이트
const updateOutReqDetail = `
  UPDATE out_req_d_tbl
  SET out_req_d_amount = ?
  WHERE out_req_code = ?
    AND prod_code = ?
`;

module.exports = {
  selectAllOutreqtbl,
  searchOutreqtbl,
  selectByOrdcode,
  selectProdList,
  generateOutReqCode,
  insertOutReq,
  insertOutReqDetail,
  updateOrdStat,
  selectByOutReqCode,
  selectProdListByOutreq,
  selectLotsByProdCode,
  insertOutbound,
  updateOutReqStat,
  generateOutCode,
  deleteOutReq,
  updateOutReq,
  updateOutReqDetail,
};
