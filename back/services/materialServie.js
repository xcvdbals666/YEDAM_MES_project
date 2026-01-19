// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 게시글 전체 목록
const findAll = async () => {
  let list = await mysql.query("selectAll", [], "material");
  return list;
};

//발주서 기본정보 등록
const addMpo = async (mpoData) => {
  //발주서 번호 생성(자동생성)
  let codeResult = await mysql.query("selectNextMpoCode", [], "material");
  let nextCode = codeResult[0].next_code;
  //발주서 기본정보 등록
  let list = await mysql.query(
    "insertMpo",
    [nextCode, mpoData.stat, mpoData.mcode, mpoData.note],
    "material",
  );
  let resObj = {};
  if (result.insertId > 0) {
    //발주서 자재 상세 등록 반복
    for (let item of mpoData.materials) {
      await mysql.query(
        "insertMpoDetail",
        [
          nextCode,
          item.mat_code,
          item.unit,
          item.req_qtt,
          item.deadline,
          item.client_code,
        ],
        "material",
      );
    }
    resObj = {
      status: "success",
      no: result.insertId,
    };
  } else {
    resObj = { status: "fail" };
  }

  return resObj;
};
//발주 자재 상세목록
const findByMrpCodeMrpDetail = async (mrpCode) => {
  let list = await mysql.query(
    "selectByMrpCodeMrpDetail",
    [mrpCode],
    "material",
  );
  return list;
};
module.exports = {
  findAll,
  findByMrpCodeMrpDetail,
};
