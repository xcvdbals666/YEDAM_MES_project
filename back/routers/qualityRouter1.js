const express = require("express");
const router = express.Router();

const qualityService = require("../services/qualityService1.js");

// 검사지시서 관리
// 게시글 전체 목록
router.get(`/qiorder`, async (req, res) => {
  let list = await qualityService.findAllQiOrderCheckList();
  res.send(list);
});

// 재고목록 전체 불러오기
router.get(`/minbndlist`, async (req, res) => {
  let list = await qualityService.findAllMinbndList();
  res.send(list);
});

// 검사지 전체 불러오기
router.get(`/qiorderlist`, async (req, res) => {
  let list = await qualityService.findAllQiOrderList();
  res.send(list);
});
module.exports = router;
