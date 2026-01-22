// 주문 전체 조회
const selectAllOrder = `SELECT ord_code,
		    ord_name,
        DATE_FORMAT(ord_date,'%Y-%m-%d') AS ord_date,
        client_code,
        (SELECT client_name
        FROM client_tbl c
        WHERE c.client_code = o.client_code)
        client_name,
        mcode,
        note,
        (SELECT min(ord_priority)
        FROM ord_d_tbl d
        WHERE d.ord_code=o.ord_code) AS ord_priority,
        ord_stat
FROM ord_tbl o
order by 1 desc`;

// 주문 상세 조회
const selectOrderDetailByCode = `SELECT ord_d_code,
		    unit,
        com_note(unit) AS unit_note,
        spec,
        com_note(spec) AS spec_note,
        ord_amount,
        prod_price,
        date_format(delivery_date,'%Y-%m-%d') AS delivery_date,
        ord_priority,
        total_price,
        prod_code,
        (SELECT prod_name
        FROM prod_tbl p
        WHERE p.prod_code = d.prod_code) AS prod_name,
        (SELECT com_value
        FROM prod_tbl p
        WHERE p.prod_code = d.prod_code) AS com_value,
        (SELECT com_note(com_value)
        FROM prod_tbl p
        WHERE p.prod_code = d.prod_code) AS com_note
FROM ord_d_tbl d
WHERE ord_code = ?`;

// 주문작성시 client 목록 가져오기(납품업체)
const selectAllClient = `SELECT client_code,client_name 
FROM client_tbl 
WHERE client_type = 'l1'`;

// 주문서 작성시 emp 목록 가져오기(거래처 담당자)
const selectAllEmployees = `SELECT emp_code,emp_name
FROM emp_tbl
WHERE dept_code='DEPT-1'
ORDER BY 1 desc`;

// 주문서 작성시 제품 목록 가져오기
const selectAllProducts = `SELECT prod_code,
        prod_name,
        edate,
        unit,
        com_note(unit) AS unit_note,
        spec,
        com_note(spec) AS spec_note,
        note,
        com_value,
        com_note(com_value) AS com_note,
        prod_type
FROM prod_tbl p
WHERE is_used = 'f2'
AND prod_type = 'i1'`;

const insertOrder = `INSERT INTO ord_tbl 
                      SET ?`;

const insertOrderDetail = `INSERT INTO ord_d_tbl (
        unit,
        spec,
        ord_amount,
        prod_price,
        delivery_date,
        ord_priority,
        total_price,
        ord_code,  
        prod_code  
      ) 
VALUES ?`;
const selectOrderCode = `SELECT create_ord_code() as ord_code
FROM dual`;
module.exports = {
  selectAllOrder,
  selectAllClient,
  selectAllEmployees,
  selectAllProducts,
  selectOrderDetailByCode,
  insertOrder,
  insertOrderDetail,
  selectOrderCode,
};
