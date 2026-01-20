const mysql = require("../database/mapper.js");

// 생산계획서 조회
const findAllPrdp = async (data) => {
  const { code, name, prdpStart, prdpEnd, dueStart, dueEnd } = data;
  const prdpCode = `%${code}%`;
  const prdpName = `%${name}%`;
  let list = await mysql.query(
    "selectAllPrdp",
    [prdpCode, prdpName, prdpStart, prdpEnd, dueStart, dueEnd],
    "produce2",
  );
  return list;
};

// 주문 검색
const findByCodeOrNameOrd = async (data) => {
  const query = `%${data.q}%`;
  let list = await mysql.query(
    "selectByCodeOrNameOrd",
    [query, query],
    "produce2",
  );
  return list;
};

// 제품 검색
const findByCodeOrNameProd = async (data) => {
  const query = `%${data.q}%`;
  const type = query === "봉지라면" ? "J1" : query === "컵라면" ? "J2" : "";
  let list = await mysql.query(
    "selectByCodeOrNameProd",
    [query, query, type],
    "produce2",
  );
  return list;
};

// 라인 검색
const findByCodeOrNameLine = async (data) => {
  const query = `%${data.q}%`;
  let list = await mysql.query(
    "selectByCodeOrNameLine",
    [query, query],
    "produce2",
  );
  return list;
};

module.exports = {
  findAllPrdp,
  findByCodeOrNameOrd,
  findByCodeOrNameProd,
  findByCodeOrNameLine,
};
