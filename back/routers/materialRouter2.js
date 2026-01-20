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

// 자재 선택 - 자재 정보 조회
router.get(`/mat-info`, async (req, res) => {
  let list = await materialService2.findByMatCodeMatTbl();
  res.send(list);
});

module.exports = router;
