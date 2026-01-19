// 전체조회
const selectAllOrder = `SELECT *
FROM ord_tbl
ORDER BY board_id`;

const selectAll = `SELECT *
FROM qcr_tbl`;

// 출고 조회
const selectAllOutreqtbl = `SELECT r.out_req_code, pr.prod_name, po.req_qtt, po.outbnd_qtt,
                                   (po.req_qtt - po.outbnd_qtt) as real_qtt, 
                                   r.out_req_date, e.emp_name, c.client_name, o.ord_stat
                            FROM out_req_tbl r
                            JOIN out_req_d_tbl d ON r.out_req_code = d.out_req_code
                            JOIN prod_tbl pr ON pr.prod_code = d.prod_code
                            JOIN poutbnd_tbl po ON po.outbound_request_code = r.out_req_code
                            JOIN emp_tbl e ON e.emp_code = r.mcode
                            JOIN client_tbl c ON c.client_code = r.client_code
                            JOIN ord_tbl o ON o.ord_code = r.ord_code`;

// 주문작성시 client 목록 가져오기(납품업체)
const selectAllClient = `SELECT client_code,client_name 
FROM client_tbl 
WHERE client_type = 'l1';`;
module.exports = {
  selectAllOrder,
  selectAllClient,
  selectAll,
  selectAllOutreqtbl,
};
