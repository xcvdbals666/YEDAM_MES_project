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

// 발주서 검색
const searchMpoTbl = async (keyword) => {
  let list = await mysql.query("selectSearchMpoTbl", [keyword], "material1");
  return list;
};

// 발주서 등록 (기본정보 + 자재 상세)
const addMpoTbl = async (mpoData) => {
  // 1. 발주서 번호 자동생성
  let codeResult = await mysql.query("selectNextMpoCode", [], "material1");
  let nextCode = codeResult[0].next_code;

  const statCode = getStatCode(mpoData.stat);

  // 2. 발주서 기본정보 등록
  let result = await mysql.query(
    "insertMpoTbl",
    [nextCode, statCode, mpoData.mcode, mpoData.note],
    "material1",
  );

  let resObj = {};
  if (result.affectedRows > 0) {
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
      seq++;
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
const updateMpoTbl = async (purchaseCode, mpoData) => {
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
  // 1. 자재 상세 먼저 삭제
  await mysql.query("deleteMpoDetailTbl", [purchaseCode], "material1");

  // 2. 발주서 기본정보 삭제
  let result = await mysql.query("deleteMpoTbl", [purchaseCode], "material1");

  let resObj = {};
  if (result.affectedRows > 0) {
    resObj = { status: "success", no: purchaseCode };
  } else {
    resObj = { status: "fail" };
  }
  return resObj;
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
  updateMpoTbl,
  deleteMpoTbl,

  // 자재구매요청서 (MPR)
  findAllMprTbl,
  searchMprTbl,
  findByMprCode,

  // 자재 (MAT)
  findAllMatTbl,
};
