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
        ord_stat,
        com_note(ord_stat) as stat_note,
        (SELECT emp_name FROM emp_tbl e WHERE e.emp_code=o.mcode)AS mname
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

// 주문 작성시 client 목록 가져오기(납품업체)
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

// 주문 등록
const insertOrder = `INSERT INTO ord_tbl 
                      SET ?`;

// 주문 상세 등록
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

// 주문 등록시 사용할 코드 조회
const selectOrderCode = `SELECT create_ord_code() AS ord_code
FROM dual`;

// 주문 수정
const updateOrder = `UPDATE ord_tbl
SET ?
WHERE ord_code = ?
`;

// 주문상세 수정 및 등록
const updateDetail = `INSERT INTO ord_d_tbl (
        ord_d_code,
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
VALUES ?
ON DUPLICATE KEY UPDATE
        unit = VALUES(unit),
        spec = VALUES(spec),
        ord_amount = VALUES(ord_amount),
        prod_price = VALUES(prod_price),
        delivery_date = VALUES(delivery_date),
        ord_priority = VALUES(ord_priority),
        total_price = VALUES(total_price),
        ord_code = VALUES(ord_code), 
        prod_code = VALUES(prod_code)`;

// 주문 삭제
const deleteOrder = `DELETE FROM ord_tbl
WHERE ord_code = ?`;

// 주문 상세 삭제(주문 코드 기반)
const deleteDetail = `DELETE FROM ord_d_tbl
WHERE ord_code = ?`;

module.exports = {
  selectAllOrder,
  selectAllClient,
  selectAllEmployees,
  selectAllProducts,
  selectOrderDetailByCode,
  insertOrder,
  insertOrderDetail,
  selectOrderCode,
  updateOrder,
  updateDetail,
  deleteOrder,
  deleteDetail,
};
