use noodle;

select * from mrp_tbl;
SELECT * FROM mrp_d_tbl;
SELECT * FROM material_tbl;
SELECT * FROM vendor_tbl;
select * from inventory_tbl ;
select * from sup_tbl;
select * from client_tbl;
select * from  minbnd_tbl ;
select * from mat_tbl;
select * from moutbnd_tbl;


-- mat_tbl에 공급업체 정보 확인
SELECT mat_code, mat_name, sup 
FROM mat_tbl 
WHERE mat_code = 'MAT-1001';

-- client_tbl에서 공급업체 확인
SELECT client_code, client_name 
FROM client_tbl 
LIMIT 5;

SELECT
    md.mrp_d_code,
    m.mrp_code,
    md.mat_code,
    md.req_qtt,
    md.unit
FROM mrp_tbl m
JOIN mrp_d_tbl md ON m.mrp_code = md.mrp_code;

SELECT 
    md.mat_code,
    m.mat_name,
    md.unit,
    md.req_qtt
FROM mrp_d_tbl md
JOIN mat_tbl m ON md.mat_code = m.mat_code
WHERE md.mrp_code = 'MRP-20250624-001';


-- 입고 합계 (자재별)
SELECT mat_code, SUM(ord_qtt) AS total_in
FROM minbnd_tbl
GROUP BY mat_code;
-- 출고 합계 (자재별)
SELECT mat_code, SUM(outbnd_qtt) AS total_out
FROM moutbnd_tbl
GROUP BY mat_code;


-- 자재 상세목록 쿼리
SELECT 
    md.mat_code,
    m.mat_name,
    m.material_type_code,
    md.unit,
    md.req_qtt,
    COALESCE(inbound.total_in, 0) AS total_in,
    COALESCE(outbound.total_out, 0) AS total_out,
        -- 현재남은수량 = 입고-출고
    (COALESCE(inbound.total_in, 0) - COALESCE(outbound.total_out, 0)) AS current_stock,
    -- 부족수량 = MRP소요량 - 현재남은수량
    (md.req_qtt - (COALESCE(inbound.total_in, 0) - COALESCE(outbound.total_out, 0))) AS shortage_qtt,
        7 AS lead_time,                        -- 리드타임
    DATE_ADD(CURDATE(), INTERVAL 7 DAY) AS delivery_date,  -- 입고예정일 (오늘 + 7일)
    c.client_name AS supplier_name         -- 공급업체명
FROM mrp_d_tbl md
JOIN mat_tbl m ON md.mat_code = m.mat_code
LEFT JOIN client_tbl c ON m.sup = c.client_code 
LEFT JOIN (
    SELECT mat_code, SUM(ord_qtt) AS total_in
    FROM minbnd_tbl
    GROUP BY mat_code
) inbound ON md.mat_code = inbound.mat_code
LEFT JOIN (
    SELECT mat_code, SUM(outbnd_qtt) AS total_out
    FROM moutbnd_tbl
    GROUP BY mat_code
) outbound ON md.mat_code = outbound.mat_code
WHERE md.mrp_code = 'MRP-20250624-002' ;


-- 발주서등록
INSERT INTO mpo_tbl (
    purchase_code,
    purchase_req_date,
    stat,
    regdate,
    mcode,
    note
) VALUES (?, NOW(),?,NOW(),?,? );
SELECT CONCAT('MPO-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', 
       LPAD(IFNULL(MAX(CAST(SUBSTRING(purchase_code, 16) AS UNSIGNED)), 0) + 1, 3, '0')
) AS next_code
FROM mpo_tbl
WHERE purchase_code LIKE CONCAT('MPO-', DATE_FORMAT(NOW(), '%Y%m%d'), '%');

select 
mpo.purchase_code,
mpo.purchase_req_date,
mpo.stat,
mpo.regdate,
mpo.mcode,
mpo.note
from mpo_tbl mpo
ORDER BY mpo.purchase_code DESC;

select * from mrp_tbl;
select * from mrp_d_tbl;
-- 발주서 기본 정보
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
WHERE mpo.purchase_code = '';

select * from mpr_mapp_tbl;

SELECT * FROM mpr_d_tbl WHERE mpr_code = 'MPR-001';

SELECT rd.mat_code, m.mat_name
FROM mpr_d_tbl rd
LEFT JOIN mat_tbl m ON rd.mat_code = m.mat_code
WHERE rd.mpr_code = 'MPR-001';



-- 발주서 테이블
select * from mpo_tbl;
select * from mpr_d_tbl;

select * from mat_tbl;
select * from mpr_mapp_tbl;

select * from minbnd_tbl;
select * from mat_lot_tbl;
select * from qir_tbl;  -- 품질검사 테이블 (g2)
select * from  qio_tbl;
select * from client_tbl;
