const express = require("express");
const router = express.Router();

const materialService = require("../services/materialService1.js");

// 자재구매요청서 목록 조회 (모달용)
router.get(`/mpr`, async (req, res) => {
  let list = await materialService.findAllMprTbl();
  res.send(list);
});

// MRP 기반 자재 목록 조회 (발주서 등록 화면)
router.get(`/material/mrp/:mrpCode`, async (req, res) => {
  const { mrpCode } = req.params;
  let list = await materialService.findByMrpCodeMrpDTbl(mrpCode);
  res.send(list);
});

// 자재구매요청서 검색
router.get(`/mpr/search/:keyword`, async (req, res) => {
  const { keyword } = req.params;
  let list = await materialService.searchMprTbl(keyword);
  res.send(list);
});

// 발주서 기본 등록
router.post(`/mpo`, async (req, res) => {
  let result = await materialService.addMpoTbl(req.body);
  res.send(result);
});

// 발주서 전체 조회 (모달용)
router.get(`/mpo`, async (req, res) => {
  let list = await materialService.findAllMpoTbl();
  res.send(list);
});

//발주서 기본정보 조회 (단건)
router.get(`/mpo/:purchaseCode`, async (req, res) => {
  const { purchaseCode } = req.params;
  let list = await materialService.findByCodeMpoTbl(purchaseCode);
  res.send(list);
});

// 발주서 자재 상세 조회
router.get(`/mpo/:purchaseCode/detail`, async (req, res) => {
  const { purchaseCode } = req.params;
  let list = await materialService.findByCodeMpoDTbl(purchaseCode);
  res.send(list);
});

module.exports = router;
