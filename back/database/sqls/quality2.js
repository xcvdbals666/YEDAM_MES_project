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

module.exports = {
  selectQiOrderList,
  selectAllQiOrderList,
  selectAllQiResultList,
};
