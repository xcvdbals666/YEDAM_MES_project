const express = require("express");
const router = express.Router();

const materialServie = require("../services/materialServie.js");

// router.get(`/material`, async (req, res) => {
//   let list = await materialServie.findAll();
//   res.send(list);
// });

// 작성자 선택 - 사원 정보 조회
router.get("/emp", async (req, res) => {
  let list = await materialServie.findByEmpcodeEmpTbl();
  res.send(list);
});

// 자재 선택 - 자재 정보 조회
router.get(`/mat-detail`, async (req, res) => {
  let list = await materialServie.findByMatCodeMatTbl();
  res.send(list);
});

//발주서 기본 등록
router.post(`/mpo`, async (req, res) => {
  let list = await materialServie.addMpo(req.body);
  res.send(list);
});

//발주 자재 상세목록
router.get(`/mrp`, async (req, res) => {
  const { mrpCode } = req.query;
  let list = await materialServie.findByMrpCodeMrpDetail(mrpCode);
  res.send(list);
});

module.exports = router;
