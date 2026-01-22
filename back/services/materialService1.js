const mysql = require("../database/mapper.js");

// 날짜 형식 변환 헬퍼 함수
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes("T")) {
    return dateStr.split("T")[0];
  }
  return dateStr;
};

const getStatCode = (statLabel) => {
  const statMap = {
    요청완료: "c1",
    입고완료: "c2",
  };
  return statMap[statLabel] || statLabel;
};

// 발주서 (MPO) 관련
// 발주서 전체 목록 조회 (모달용)
const findAllMpoTbl = async () => {
  let list = await mysql.query("selectAllMpoTbl", [], "material1");
  return list;
};

// 발주서 기본정보 조회 (발주서 선택 시)
const findByCodeMpoTbl = async (purchaseCode) => {
  let list = await mysql.query(
    "selectByCodeMpoTbl",
    [purchaseCode],
    "material1",
  );
  return list;
};

// 발주서 자재 상세 조회 (발주서 선택 시)
const findByCodeMpoDTbl = async (purchaseCode) => {
  let list = await mysql.query(
    "selectByCodeMpoDTbl",
    [purchaseCode],
    "material1",
  );
  return list;
};

//발주서 검색 상세
const searchMpoDetail = async (keyword) => {
  let sql = `
    SELECT 
      mpo.purchase_code,
      DATE_FORMAT(mpo.purchase_req_date, '%Y-%m-%d') AS purchase_req_date,
      CASE 
        WHEN mpo.stat = 'c1' THEN '요청완료'
        WHEN mpo.stat = 'c2' THEN '입고완료'
        ELSE mpo.stat
      END AS stat,
      mpo.mcode,
      e.emp_name,
      DATE_FORMAT(mpo.regdate, '%Y-%m-%d') AS regdate,
      GROUP_CONCAT(DISTINCT m.mat_name SEPARATOR ', ') AS material_names,
      GROUP_CONCAT(DISTINCT 
        CASE 
          WHEN m.material_type_code = 't1' THEN '원자재'
          WHEN m.material_type_code = 't2' THEN '부자재'
          ELSE m.material_type_code
        END 
      SEPARATOR ', ') AS material_type,
      GROUP_CONCAT(DISTINCT c.client_name SEPARATOR ', ') AS supplier_name,
      SUM(d.req_qtt) AS req_qtt,
      MIN(DATE_FORMAT(d.deadline, '%Y-%m-%d')) AS deadline
    FROM mpo_tbl mpo
    LEFT JOIN emp_tbl e ON mpo.mcode = e.emp_code
    LEFT JOIN mpo_d_tbl d ON mpo.purchase_code = d.purchase_code
    LEFT JOIN mat_tbl m ON d.mat_code = m.mat_code
    LEFT JOIN client_tbl c ON d.client_code = c.client_code
    WHERE 1=1
  `;

  const params = [];

  // 발주서번호
  if (keyword.purchaseCode) {
    sql += " AND mpo.purchase_code LIKE ? ";
    params.push(`%${keyword.purchaseCode}%`);
  }

  // 발주상태
  if (keyword.stat && keyword.stat !== "전체") {
    sql += " AND mpo.stat = ? ";
    params.push(keyword.stat === "요청완료" ? "c1" : "c2");
  }

  // 공급업체
  if (keyword.matCode) {
    sql += " AND c.client_name LIKE ? ";
    params.push(`%${keyword.matCode}%`);
  }

  // 자재유형
  if (keyword.matName && keyword.matName !== "전체") {
    sql += " AND m.material_type_code = ? ";
    params.push(keyword.matName === "원자재" ? "t1" : "t2");
  }

  // 발주제안일 FROM
  if (keyword.reqDateStart) {
    sql += " AND mpo.purchase_req_date >= ? ";
    params.push(formatDate(keyword.reqDateStart));
  }

  // 발주제안일 TO
  if (keyword.reqDateEnd) {
    sql += " AND mpo.purchase_req_date <= ? ";
    params.push(formatDate(keyword.reqDateEnd));
  }

  // 납기일 FROM
  if (keyword.deadlineStart) {
    sql += " AND d.deadline >= ? ";
    params.push(formatDate(keyword.deadlineStart));
  }

  // 납기일 TO
  if (keyword.deadlineEnd) {
    sql += " AND d.deadline <= ? ";
    params.push(formatDate(keyword.deadlineEnd));
  }

  sql += `
    GROUP BY mpo.purchase_code, mpo.purchase_req_date, mpo.stat, mpo.mcode, mpo.regdate
    ORDER BY mpo.purchase_code DESC
  `;

  try {
    const result = await mysql.rquery(sql, params);
    return result;
  } catch (err) {
    console.error("[MPO SEARCH ERROR]", err);
    throw err;
  }
};

// 발주서 검색
const searchMpoTbl = async (keyword) => {
  let list = await mysql.query("selectSearchMpoTbl", [keyword], "material1");
  return list;
};

// 발주서 등록 (기본정보 + 자재 상세)
const addMpoTbl = async (data) => {
  const statCode = data.statCode || "c1"; // data에서 statCode 꺼내기
  const mpoData = data.mpoData;
  // 1. 발주서 번호 자동생성
  let nextCodeResult = await mysql.query("selectNextMpoCode", [], "material1");
  let nextCode = nextCodeResult[0].next_code;
  // 2. 발주서 기본정보 등록
  let result = await mysql.query(
    "insertMpoTbl",
    [nextCode, statCode, mpoData.mcode, mpoData.note],
    "material1",
  );

  let resObj = {};
  if (result.affectedRows > 0) {
    let totalReqQtt = 0;
    // 3. 발주서 자재 상세 등록 (반복)
    let seq = 1;
    for (let item of mpoData.materials) {
      const mpo_d_code = `${nextCode}-${String(seq).padStart(3, "0")}`;
      await mysql.query(
        "insertMpoDetailTbl",
        [
          mpo_d_code,
          nextCode,
          item.mat_code,
          item.unit,
          item.req_qtt,
          formatDate(item.deadline),
          item.client_code,
        ],
        "material1",
      );
      totalReqQtt += item.req_qtt || 0; // 총요청수량 계산
      seq++;
    }
    // 4. MPR-MPO 매핑 등록
    if (mpoData.mpr_code) {
      // 매핑 코드 생성
      let mappCodeResult = await mysql.query(
        "selectNextMappCode",
        [],
        "material1",
      );
      let mappCode = mappCodeResult[0].next_code;

      await mysql.query(
        "insertMprMappTbl",
        [
          mappCode,
          mpoData.mpr_code,
          nextCode,
          totalReqQtt, //총 요청수량
        ],
        "material1",
      );
    }
    resObj = {
      status: "success",
      no: nextCode,
    };
  } else {
    resObj = { status: "fail" };
  }
  return resObj;
};

// 발주서 수정
const updateMpoTbl = async (statCode, purchaseCode, mpoData) => {
  // 1. 발주서 기본정보 수정
  let result = await mysql.query(
    "updateMpoTbl",
    [statCode, mpoData.mcode, mpoData.note, purchaseCode],
    "material1",
  );

  let resObj = {};
  if (result.affectedRows > 0) {
    // 2. 기존 자재 상세 삭제
    await mysql.query("deleteMpoDetailTbl", [purchaseCode], "material1");

    // 3. 자재 상세 다시 등록
    let seq = 1;
    for (let item of mpoData.materials) {
      const mpo_d_code = `${purchaseCode}-${String(seq).padStart(3, "0")}`;
      await mysql.query(
        "insertMpoDetailTbl",
        [
          mpo_d_code,
          purchaseCode,
          item.mat_code,
          item.unit,
          item.req_qtt,
          formatDate(item.deadline),
          item.client_code,
        ],
        "material1",
      );
      seq++;
    }
    resObj = { status: "success", no: purchaseCode };
  } else {
    resObj = { status: "fail" };
  }

  return resObj;
};

// 발주서 삭제
const deleteMpoTbl = async (purchaseCode) => {
  // 1. MPR 매핑 테이블 먼저 삭제
  await mysql.query("deleteMprMappByPurchaseCode", [purchaseCode], "material1");

  // 2. 자재 상세 삭제
  await mysql.query("deleteMpoDetailTbl", [purchaseCode], "material1");

  // 3. 발주서 기본정보 삭제
  const result = await mysql.query("deleteMpoTbl", [purchaseCode], "material1");

  if (result.affectedRows > 0) {
    return { status: "success", no: purchaseCode };
  } else {
    return { status: "fail" };
  }
};

// 자재구매요청서 (MPR) 관련
// 자재구매요청서 목록 조회
const findAllMprTbl = async () => {
  let list = await mysql.query("selectAllMprTbl", [], "material1");
  return list;
};

// 자재구매요청서 검색
const searchMprTbl = async (keyword) => {
  let list = await mysql.query(
    "selectSearchMprTbl",
    [keyword, keyword, keyword],
    "material1",
  );
  return list;
};

// 자재구매요청서(MPR) 기준 자재 목록 조회
const findByMprCode = async (mprCode) => {
  let list = await mysql.query(
    "selectByMrpCodeMrpDetailTbl",
    [mprCode],
    "material1",
  );
  return list;
};

// 자재 (MAT) 관련
// 자재 전체 목록 조회 (모달용)
const findAllMatTbl = async () => {
  let list = await mysql.query("selectAllMatTbl", [], "material1");
  return list;
};

module.exports = {
  // 발주서 (MPO)
  findAllMpoTbl,
  findByCodeMpoTbl,
  findByCodeMpoDTbl,
  addMpoTbl,
  searchMpoTbl,
  searchMpoDetail,
  updateMpoTbl,
  deleteMpoTbl,

  // 자재구매요청서 (MPR)
  findAllMprTbl,
  searchMprTbl,
  findByMprCode,

  // 자재 (MAT)
  findAllMatTbl,
};
