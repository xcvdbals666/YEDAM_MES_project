const express = require("express");
const router = express.Router();

const orderService = require("../services/orderService2.js");

// 출고 번호 선택 모달
router.get("/outbound-code", async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await orderService.findByOutcodeOutTbl(keyword);
  res.send(list);
});

// 출고 제품 선택 모달
router.get("/outbound-prod", async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await orderService.findByCodeProdTbl(keyword);
  res.send(list);
});

// 거래처 선택 모달
router.get("/outbound-client", async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await orderService.findByCodeClientTbl(keyword);
  res.send(list);
});

// 출고 담당자 선택 모달
router.get("/outbound-emp", async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await orderService.findByEmpcodeEmpTbl(keyword);
  res.send(list);
});

// 출고 목록 조회
router.get(`/outbounds`, async (req, res) => {
  let list = await orderService.findAllOutreqtbl();
  res.send(list);
});

module.exports = router;
