// 현우

//품질 검사 지시 목록 조회
const selectQiOrderList = `
SELECT
    q.qio_code,
    q.qio_date,
    q.insp_date,

    CASE
        WHEN q.mpo_d_code IS NOT NULL THEN '자재검사'
        ELSE '수입검사'
    END AS inspect_type,

    CASE
        WHEN q.insp_date IS NOT NULL THEN '완료'
        WHEN q.qio_date IS NOT NULL THEN '지시'
        ELSE '미지시'
    END AS qio_status,

    bm.mat_name
FROM qio_tbl q
LEFT JOIN mpo_d_tbl md ON q.mpo_d_code = md.mpo_d_code
LEFT JOIN bom_mat bm ON md.mat_code = bm.mat_code
WHERE q.qio_code LIKE CONCAT('%', ?, '%')
ORDER BY q.qio_date DESC`;

//검사 지시서 모달 조회
const selectAllQiOrderList = `
SELECT
    q.qio_code,
    q.qio_date,
    q.insp_date,
    CASE
        WHEN q.prdr_code IS NOT NULL THEN '수입검사'
        WHEN q.po_code IS NOT NULL THEN '제품검사'
        ELSE '자재검사'
    END AS inspect_type,
    CASE
        WHEN q.insp_date IS NOT NULL THEN '완료'
        WHEN q.qio_date IS NOT NULL THEN '지시'
        ELSE '미지시'
    END AS qio_status,
    bm.mat_name
FROM qio_tbl q
LEFT JOIN mpo_d_tbl md ON q.mpo_d_code = md.mpo_d_code
LEFT JOIN bom_mat bm ON md.mat_code = bm.mat_code
ORDER BY q.qio_date DESC`;

//품질검사 결과 목록 조회
const selectAllQiResultList = `
SELECT
    qir.qir_code,
    qcr.qcr_code,
    qcr.inspection_item,
    qcr.range_top,
    qcr.range_bot,
    qir.qir_emp_code,

    -- 단위
    CASE c1.com_value
        WHEN 'h1' THEN 'kg'
        WHEN 'h2' THEN 't'
        WHEN 'h3' THEN 'L'
        WHEN 'h4' THEN 'ea'
        WHEN 'h5' THEN 'box'
        WHEN 'h6' THEN 'g'
        WHEN 'h7' THEN 'mm'
        WHEN 'h8' THEN '%'
        WHEN 'h9' THEN 'cm'
        WHEN 'ha' THEN 'N'
        WHEN 'hb' THEN 'mg'
        WHEN 'hc' THEN 'ml'
        WHEN 'hd' THEN 'mg/g'
        ELSE c1.com_value
    END AS unit,

    -- 품목 유형
    CASE c2.com_value
        WHEN 'i1' THEN '완제품'
        WHEN 'i2' THEN '반제품'
        WHEN 'i3' THEN '부자재'
        WHEN 'i4' THEN '원자재'
        ELSE c2.com_value
    END AS com_value,

    -- 검사결과
    CASE
        WHEN qir.result IS NULL THEN '미검사'
        WHEN c3.com_value = 'g1' THEN '불합격'
        WHEN c3.com_value = 'g2' THEN '합격'
        ELSE c3.com_value
    END AS result,

    qir.end_date

FROM qcr_tbl qcr

/* 검사 결과 */
LEFT JOIN qir_tbl qir
       ON qir.qcr_code = qcr.qcr_code

/* 단위 공통코드 */
LEFT JOIN common_code c1
       ON c1.com_value = qcr.unit

/* 품목 유형 공통코드 */
LEFT JOIN common_code c2
       ON c2.com_value = qcr.com_value

/* 검사결과 공통코드 */
LEFT JOIN common_code c3
       ON c3.com_value = qir.result

WHERE qir.qir_code IS NOT NULL
`;

//품질결과 디테일 조회
const selectResultDetail = `
SELECT
    /* ===============================
       상단 - 검사 기본 정보
       =============================== */
    qir.qir_code            AS qir_code,          -- 검사결과코드
    qio.qio_date            AS qio_date,          -- 검사지시일
    qio.insp_vol            AS insp_vol,          -- 검사요청량
    qir.end_date            AS inspect_datetime,  -- 검사일시

    /* 품목명 */
    CASE c2.com_value
        WHEN 'i1' THEN '완제품'
        WHEN 'i2' THEN '반제품'
        WHEN 'i3' THEN '부자재'
        WHEN 'i4' THEN '원자재'
        ELSE c2.com_value
    END                     AS item_name,

    /* 검사유형 */
    CASE
        WHEN qio.prdr_code IS NOT NULL THEN '수입검사'
        WHEN qio.po_code   IS NOT NULL THEN '제품검사'
        ELSE '자재검사'
    END                     AS inspect_type,

    /* ===============================
       중단 - 검사 기준
       =============================== */
    qcr.inspection_item     AS inspection_item,   -- 검사항목
    qcr.check_method        AS check_method,      -- 검사방법
    qcr.range_top           AS range_top,         -- 상한값
    qcr.range_bot           AS range_bot,         -- 하한값
    c1.com_value            AS unit,              -- 단위

    /* ===============================
       하단 - 검사 결과
       =============================== */
    qir.start_date          AS start_date,        -- 검사시작일
    qir.end_date            AS end_date,          -- 검사종료일
    qir.pass_qtt            AS pass_qtt,          -- 합격수량
    qir.unpass_qtt          AS unpass_qtt,        -- 불합격수량
    qir.unpass_rate         AS unpass_rate,       -- 불량률
    c3.com_value            AS result,            -- 최종결과
    qir.qir_emp_code        AS inspector,         -- 검사자
    qir.note                AS note               -- 비고

FROM qcr_tbl qcr

/* 검사 결과 */
LEFT JOIN qir_tbl qir
       ON qir.qcr_code = qcr.qcr_code

/* 검사 지시 */
LEFT JOIN qio_tbl qio
       ON qir.qio_code = qio.qio_code

/* 단위 공통코드 */
LEFT JOIN common_code c1
       ON c1.com_value = qcr.unit

/* 품목 유형 공통코드 */
LEFT JOIN common_code c2
       ON c2.com_value = qcr.com_value

/* 검사결과 공통코드 */
LEFT JOIN common_code c3
       ON c3.com_value = qir.result

WHERE qir.qir_code IS NOT NULL;`

module.exports = {
  selectQiOrderList,
  selectAllQiOrderList,
  selectAllQiResultList,
  selectResultDetail,
};
