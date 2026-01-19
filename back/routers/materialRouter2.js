const express = require("express");
const router = express.Router();

const materialService2 = require("../services/materialService2.js");

// router.get(`/material`, async (req, res) => {
//   let list = await materialService2.findAll();
//   res.send(list);
// });

// 작성자 선택 - 사원 정보 조회
router.get("/emp", async (req, res) => {
  let list = await materialService2.findByEmpcodeEmpTbl();
  res.send(list);
});

// 자재 선택 - 자재 정보 조회
router.get(`/mat-detail`, async (req, res) => {
  let list = await materialService2.findByMatCodeMatTbl();
  res.send(list);
});

//발주서 기본 등록
router.post(`/mpo`, async (req, res) => {
  let list = await materialService2.addMpo(req.body);
  res.send(list);
});

//발주 자재 상세목록
router.get(`/mrp`, async (req, res) => {
  const { mrpCode } = req.query;
  let list = await materialService2.findByMrpCodeMrpDetail(mrpCode);
  res.send(list);
});

module.exports = router;
