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

module.exports = {
  selectAllOutreqtbl,
  searchOutreqtbl,
};
