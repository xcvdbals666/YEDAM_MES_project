const mysql = require("../database/mapper.js");

// 작성자 선택 - 사원 정보 조회
const findByEmpcodeEmpTbl = async (keyword) => {
  let sql = `
    SELECT e.emp_code, e.emp_name, d.dept_name
    FROM emp_tbl e
    JOIN dept_tbl d ON e.dept_code = d.dept_code
    WHERE 1=1
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        e.emp_code LIKE ?
        OR e.emp_name LIKE ?
      )
    `;
    const like = `%${keyword || ""}%`;
    params.push(like, like);
  }
  sql += ` ORDER BY e.emp_code `;
  return mysql.rquery(sql, params);
};

// 다음 요청번호 생성(프론트용)
const findMaxMprCode = async () => {
  const mprCode = await mysql.query("selectMaxMprCode", [], "material2");
  const last = mprCode[0]?.last_code || "MPR-000";

  // 숫자만 꺼냄
  const lastNum = Number(last.replace("MPR-", ""));
  const nextNum = lastNum + 1;

  return `MPR-${String(nextNum).padStart(3, "0")}`;
};

// mrp code 조회
const findAllMrpCodeMrpTbl = async () => {
  const list = await mysql.query("selectAllMrpCodeMrpTbl", [], "material2");
  return list;
};

// 자재 선택 - 자재 정보 조회
const findByMatCodeMatTbl = async ({ keyword, mrpCode }) => {
  const like = `%${keyword || ""}%`;
  const list = await mysql.query(
    "selectByMatCodeMatTbl",
    [mrpCode || null, mrpCode || null, like],
    "material2",
  );
  return list;
};

// 자재구매요청/수정
const modifyMprTbl = async ({ request, requestDetail }) => {
  let mprCode = request.mprCode;
  let mrpCode = request.mrpCode;

  // =========================
  // 1. 신규 / 수정 분기
  // =========================
  if (!mprCode) {
    // 신규
    const rows = await mysql.query("selectMaxMprCode", [], "material2");
    const last = rows[0]?.last_code || "MPR-000";

    mprCode = `MPR-${String(Number(last.replace("MPR-", "")) + 1).padStart(
      3,
      "0",
    )}`;

    await mysql.query(
      "insertMprTbl",
      [mprCode, request.reqDate, request.deadline, mrpCode, request.mCode],
      "material2",
    );
  } else {
    // 수정
    const map = await mysql.query("selectIsEditable", [mprCode], "material2");
    if (map.length > 0) {
      throw new Error("발주가 진행된 구매요청은 수정할 수 없습니다.");
    }

    const origin = await mysql.query(
      "selectByMprCodeIsMrpCode",
      [mprCode],
      "material2",
    );

    if (!origin.length) {
      throw new Error("존재하지 않는 구매요청입니다.");
    }

    // 수정 시 MRP 변경 차단
    if (origin[0].mrp_code !== mrpCode) {
      throw new Error("수정 시에는 MRP를 추가하거나 변경할 수 없습니다.");
    }

    mrpCode = origin[0].mrp_code;

    await mysql.query(
      "updateMprTbl",
      [request.reqDate, request.deadline, mrpCode, mprCode],
      "material2",
    );
  }

  // =========================
  // 2. 상세 데이터 1차 필터
  // =========================
  const details = requestDetail.filter(
    (m) => m.matCode && m.reqQtt && m.reqQtt > 0,
  );

  // =========================
  // 3. 상세 처리
  // =========================
  for (const mat of details) {
    // 의미 없는 삭제 요청 방어
    if (mat.is_deleted && !mat.mprDCode) continue;

    // 기존 row인 경우 source_type 확인
    if (mat.mprDCode) {
      const rows = await mysql.query(
        "selectByMprDCodeSourceType",
        [mat.mprDCode],
        "material2",
      );

      if (!rows.length) continue;

      // MRP 자재는 수정 / 삭제 불가
      if (rows[0].source_type === "mrp") continue;
    }

    // 삭제
    if (mat.is_deleted && mat.mprDCode) {
      await mysql.query("deleteMprDTbl", [mat.mprDCode], "material2");
      continue;
    }

    // 수정
    if (mat.mprDCode) {
      await mysql.query(
        "updateMprDTbl",
        [
          mat.reqQtt,
          mat.unitCode,
          mat.note,
          mat.matSup,
          mat.matCode,
          mat.mprDCode,
        ],
        "material2",
      );
      continue;
    }

    // =========================
    // 신규 INSERT (수동 / MRP 모두 허용)
    // =========================
    const dRows = await mysql.query("selectMaxMprDCode", [], "material2");
    const lastD = dRows[0]?.last_code || "MPR-D-000";

    const newMprDCode = `MPR-D-${String(
      Number(lastD.replace("MPR-D-", "")) + 1,
    ).padStart(3, "0")}`;

    try {
      await mysql.query(
        "insertMprDTbl",
        [
          newMprDCode,
          mat.reqQtt,
          mat.unitCode,
          mat.note,
          mprCode,
          mat.matSup,
          mat.matCode,
          mat.sourceType || "manual",
        ],
        "material2",
      );
    } catch (err) {
      // UNIQUE 제약에 걸린 경우만 무시
      if (err.code === "ER_DUP_ENTRY") {
        continue; // 이미 존재 → 그냥 스킵
      }
      throw err;
    }
  }

  return { mprCode };
};

// 자재구매요청 삭제
const removeMpr = async (mprCode) => {
  // 발주 매핑 여부 체크
  const map = await mysql.query("selectIsEditable", [mprCode], "material2");
  if (map.length > 0) {
    throw new Error("발주가 진행된 구매요청은 삭제할 수 없습니다.");
  }
  // 상세 삭제
  await mysql.query("deleteDetailMpr", [mprCode], "material2");
  // 헤더 삭제
  await mysql.query("deleteMpr", [mprCode], "material2");

  return { status: "success" };
};

// 자재구매요청 조회
const findByMprCodeMprTbl = async (keyword) => {
  let sql = `SELECT m.mpr_code, m.reqdate, m.deadline, m.mrp_code, m.mcode,
                    CASE WHEN COUNT(d.mat_code) = 1 THEN MIN(mt.mat_name)
                         ELSE CONCAT(MIN(mt.mat_name),' 외 ', COUNT(d.mat_code) - 1, '건')
                    END AS mat_summary
             FROM mpr_tbl m
             LEFT JOIN mpr_d_tbl d ON d.mpr_code = m.mpr_code
             LEFT JOIN mat_tbl mt ON mt.mat_code = d.mat_code
             WHERE 1=1`;

  const params = [];

  // 요청번호
  if (keyword.mprCode) {
    sql += " AND m.mpr_code LIKE ?";
    params.push(`%${keyword.mprCode}%`);
  }

  // 요청일자 기간
  if (keyword.reqDateFrom && keyword.reqDateTo) {
    sql += " AND m.reqdate BETWEEN ? AND ?";
    params.push(keyword.reqDateFrom, keyword.reqDateTo);
  } else if (keyword.reqDateFrom) {
    sql += " AND m.reqdate >= ?";
    params.push(keyword.reqDateFrom);
  } else if (keyword.reqDateTo) {
    sql += " AND m.reqdate <= ?";
    params.push(keyword.reqDateTo);
  }

  // 납기일자 기간
  if (keyword.deadlineFrom && keyword.deadlineTo) {
    sql += " AND m.deadline BETWEEN ? AND ?";
    params.push(keyword.deadlineFrom, keyword.deadlineTo);
  } else if (keyword.deadlineFrom) {
    sql += " AND m.deadline >= ?";
    params.push(keyword.deadlineFrom);
  } else if (keyword.deadlineTo) {
    sql += " AND m.deadline <= ?";
    params.push(keyword.deadlineTo);
  }

  // MRP
  if (keyword.mrpCode) {
    sql += " AND m.mrp_code LIKE ?";
    params.push(`%${keyword.mrpCode}%`);
  }

  // 요청자
  if (keyword.mcode) {
    sql += " AND m.mcode LIKE ?";
    params.push(`%${keyword.mcode}%`);
  }

  sql +=
    " GROUP BY m.mpr_code, m.reqdate, m.deadline, m.mrp_code, m.mcode ORDER BY m.mpr_code DESC";

  // console.log("[SQL]", sql);
  // console.log("[PARAMS]", params);

  try {
    const result = await mysql.rquery(sql, params);
    //console.log("[RESULT COUNT]", result.length);
    return result;
  } catch (err) {
    console.error("[DB ERROR]", err);
    throw err;
  }
};

// 자재구매요청 상세 정보 조회 - 요청기본정보
const findByMprCodeMprTblDetail = async (mprCode) => {
  const list = await mysql.query(
    "selectByMprCodeMprTbl",
    [mprCode],
    "material2",
  );
  return list[0] || null;
};

// 자재구매요청 상세 정보 조회 - 요청자재상세
const findByMprCodeMprDTblDetail = async (mprCode) => {
  // console.log(":" + mprCode + ":");
  const list = await mysql.query(
    "selectByMprCodeMprDTbl",
    [mprCode],
    "material2",
  );
  // console.log("service : ", list);
  return list;
};

// MPR 불러오기용 모달 + 검색
const findMprHeaderModal = async (keyword) => {
  const like = `%${keyword || ""}%`;
  const list = await mysql.query("selectMprHeaderModal", [like], "material2");
  return list;
};

// MPR 불러오기용 - 헤더부분
const findMprHeader = async (mprCode) => {
  const list = await mysql.query("selectMprHeader", [mprCode], "material2");
  return list;
};

// 자재구매요청서 전체 목록 조회
// const findAllMprTbl = async (keyword) => {
//   const like = `%${keyword || ""}%`;
//   const list = await mysql.query("selectAllMprTbl", [like], "material2");
//   return list;
// };

// 공급업체 목록 조회
const findAllClientTbl = async (keyword) => {
  const like = `%${keyword || ""}%`;
  const list = await mysql.query("selectAllClientTbl", [like], "material2");
  return list;
};

//MRP 기준 정보 불러오기
const findByMrpCodeMrpDTbl = async (mrpCode) => {
  const list = await mysql.query(
    "selectByMrpCodeMrpDTbl",
    [mrpCode],
    "material2",
  );
  return list;
};

// 구매요청 수정/삭제 여부 확인
const findIsEditable = async (mprCode) => {
  const list = await mysql.query("selectIsEditable", [mprCode], "material2");
  return list.length === 0;
};

// 자재 입출고내역조회
const findMaterialInOutList = async (params) => {
  const {
    ioType = "ALL",
    dateFrom = null,
    dateTo = null,
    keyword = "",
    status = "ALL",
  } = params;

  const list = await mysql.query(
    "selectMaterialInOutList",
    [
      ioType, // 입출고 타입
      ioType,
      dateFrom, // 시작일
      dateFrom,
      dateTo, // 종료일
      dateTo,
      keyword, // 검색어 없음
      keyword, // 자재명
      keyword,
      status, // 처리 상태
      status,
    ],
    "material2",
  );

  return list;
};

// 완제품 입출고내역조회
const findProductInOutList = async (params) => {
  const {
    ioType = "ALL",
    dateFrom = null,
    dateTo = null,
    keyword = "",
    status = "ALL",
  } = params;

  const list = await mysql.query(
    "selectProductInOutList",
    [
      ioType, // 입출고 타입
      ioType,
      dateFrom, // 시작일
      dateFrom,
      dateTo, // 종료일
      dateTo,
      keyword, // 검색어 없음
      keyword, // 자재명
      keyword,
      status, // 처리 상태
      status,
    ],
    "material2",
  );

  return list;
};

module.exports = {
  findByEmpcodeEmpTbl,
  findByMatCodeMatTbl,
  findMaxMprCode,
  modifyMprTbl,
  findAllMrpCodeMrpTbl,
  findByMprCodeMprTbl,
  // findAllMprTbl,
  findAllClientTbl,
  findByMprCodeMprTblDetail,
  findByMprCodeMprDTblDetail,
  findMprHeader,
  findMprHeaderModal,
  findByMrpCodeMrpDTbl,
  findIsEditable,
  removeMpr,
  findMaterialInOutList,
  findProductInOutList,
};
