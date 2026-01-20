const mysql = require("../database/mapper.js");

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

// 발주서 등록 (기본정보 + 자재 상세)
const addMpoTbl = async (mpoData) => {
  // 1. 발주서 번호 자동생성
  let codeResult = await mysql.query("selectNextMpoCode", [], "material1");
  let nextCode = codeResult[0].next_code;

  // 2. 발주서 기본정보 등록
  let list = await mysql.query(
    "insertMpoTbl",
    [nextCode, mpoData.stat, mpoData.mcode, mpoData.note],
    "material1",
  );

  let resObj = {};
  if (list.affectedRows > 0) {
    // 3. 발주서 자재 상세 등록 (반복)
    for (let item of mpoData.materials) {
      await mysql.query(
        "insertMpoDetailTbl",
        [
          nextCode,
          item.mat_code,
          item.unit,
          item.req_qtt,
          item.deadline,
          item.client_code,
        ],
        "material1",
      );
    }
    resObj = {
      status: "success",
      poCode: nextCode,
    };
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

  // 자재구매요청서 (MPR)
  findAllMprTbl,
  searchMprTbl,
  findByMprCode,

  // 자재 (MAT)
  findAllMatTbl,
};
