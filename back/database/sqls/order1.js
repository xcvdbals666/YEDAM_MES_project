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
        (SELECT emp_name FROM emp_tbl e WHERE e.emp_code=o.mcode)AS mname,
        (SELECT count(*) FROM ord_d_tbl d WHERE d.ord_code=o.ord_code) AS count
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
// 주문 상태 코드 및 노트 가져오기
const selectOrderStats = `SELECT com_value, 
		note 
FROM common_code 
WHERE group_value IN ('0A','0Q')`;

// 완제품 재고 체크
const selectProductQty = `SELECT current_qty, prod_name FROM view_prod_stock WHERE prod_code = ?`;
// 자재 재고 체크
const selectMatStock = `SELECT 
             bm.mat_code,
             bm.mat_name,
             (bm.req_qtt * ?) as need_qty,      -- 필요량 = (개당 소요량 * 생산수량)
             IFNULL(v.current_qty, 0) as stock_qty -- 현재고 (만들어둔 뷰 활용)
           FROM bom_tbl b
           JOIN bom_mat bm ON b.bom_code = bm.bom_code  -- [핵심] 헤더와 상세를 코드로 연결
           LEFT JOIN view_mat_stock v ON bm.mat_code = v.mat_code
           WHERE b.prod_code = ? 
             AND b.is_used = 'f2'`;
// 공장 혼잡도 체크
const selectwkoByStat = `SELECT COUNT(*) as cnt FROM wko_tbl WHERE stat != 'v2'`;
module.exports = {
  selectAllOrder,
  selectAllClient,
  selectAllEmployees,
  selectAllProducts,
  selectOrderDetailByCode,
  selectOrderStats,
  insertOrder,
  insertOrderDetail,
  selectOrderCode,
  updateOrder,
  updateDetail,
  deleteOrder,
  deleteDetail,
  selectProductQty,
  selectMatStock,
  selectwkoByStat,
};
