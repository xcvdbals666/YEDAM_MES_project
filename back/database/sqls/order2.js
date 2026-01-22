// 출고 조회
const selectAllOutreqtbl = `
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
  o.note
FROM ord_tbl o
JOIN client_tbl c ON c.client_code = o.client_code
WHERE o.ord_code = ?
`;

// 주문정보 제품 조회
const selectProdList = `
SELECT 
  p.prod_name,

  c_type.note AS prod_type,
  c_spec.note AS spec, 
  c_unit.note AS unit,

  od.ord_amount,
  od.delivery_date,

  (COALESCE(stock_in.total_in, 0)
  - COALESCE(out_req.total_req, 0)) AS current_stock

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
  SELECT prod_code, SUM(out_req_d_amount) AS total_req
  FROM out_req_d_tbl
  GROUP BY prod_code
) out_req ON out_req.prod_code = od.prod_code

WHERE od.ord_code = ?
`;

// 출고 코드 생성
const generateOutCode = `
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

module.exports = {
  selectAllOutreqtbl,
  searchOutreqtbl,
  selectByOrdcode,
  selectProdList,
  generateOutCode,
};
