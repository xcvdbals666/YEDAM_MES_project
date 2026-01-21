// 현우

//품질 검사 지시 목록 조회
const selectQiOrderList = `
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

module.exports = {
  selectQiOrderList,
  selectAllQiOrderList,
};
