const express = require("express");
const router = express.Router();

const materialService2 = require("../services/materialService2.js");

// 작성자 선택 - 사원 정보 조회
router.get("/emp", async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await materialService2.findByEmpcodeEmpTbl(keyword);
  res.send(list);
});

// 다음 요청번호 생성
router.get("/next-code", async (req, res) => {
  const mprCode = await materialService2.findMaxMprCode();
  res.send({ mprCode });
});

// mrp code 조회
router.get("/getMrpCode", async (req, res) => {
  const list = await materialService2.findAllMrpCodeMrpTbl();
  res.send(list);
});

// 자재 선택 - 자재 정보 조회
router.get(`/mat-info`, async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await materialService2.findByMatCodeMatTbl(keyword);
  res.send(list);
});

// 자재구매요청
router.post(`/mat-request`, async (req, res) => {
  const data = req.body;
  let result = await materialService2.addMprTbl(data);
  res.send(result);
});

// 자재구매요청 조회
router.get("/mpr-request", async (req, res) => {
  const {
    mprCode,
    reqDateFrom,
    reqDateTo,
    deadlineFrom,
    deadlineTo,
    mrpCode,
    mcode,
  } = req.query;

  const list = await materialService2.findByMprCodeMprTbl({
    mprCode,
    reqDateFrom,
    reqDateTo,
    deadlineFrom,
    deadlineTo,
    mrpCode,
    mcode,
  });

  res.send(list);
});

// 자재구매요청 상세 정보 조회 - 요청기본정보
router.get("/mpr-request/:mprCode/header", async (req, res) => {
  const mprCode = req.params.mprCode;
  const list = await materialService2.findByMprCodeMprTblDetail(mprCode);
  res.send(list);
});

// 자재구매요청 상세 정보 조회 - 요청자재상세
router.get("/mpr-request/:mprCode/items", async (req, res) => {
  const mprCode = req.params.mprCode;
  const list = await materialService2.findByMprCodeMprDTblDetail(mprCode);
  res.send(list);
});

// 자재구매요청서 목록 조회
router.get("/mpr-list", async (req, res) => {
  const { keyword = "" } = req.query;
  const list = await materialService2.findAllMprTbl(keyword);
  res.send(list);
});

// 공급업체 목록 조회
router.get("/client-list", async (req, res) => {
  const { keyword = "" } = req.query;
  const list = await materialService2.findAllClientTbl(keyword);
  res.send(list);
});
module.exports = router;
