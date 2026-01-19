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

module.exports = router;
