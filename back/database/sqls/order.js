// 전체조회
const selectAllOrder = `SELECT *
FROM ord_tbl
ORDER BY board_id`;

// 주문작성시 client 목록 가져오기(납품업체)
const selectAllClient = `SELECT client_code,client_name 
FROM client_tbl 
WHERE client_type = 'l1';`;
module.exports = {
  selectAllOrder,
  selectAllClient,
};
