const express = require("express");
const router = express.Router();

const produceService = require("../services/produceService2.js");

// 생산계획서 조회
router.get(`/planList`, async (req, res) => {
  const data = req.query;
  let list = await produceService.findAllPrdp(data);
  res.send(list);
});

// 생산계획 검색
router.get(`/prdpList`, async (req, res) => {
  const data = req.query;
  let list = await produceService.findByCodeOrNamePrdp(data);
  res.send(list);
});

// 생산계획 상세 제품 조회
router.get(`/api/produce/planProd/:prdp_code`, async (req, res) => {
  const prdpCode = req.params;
  let list = await produceService.findPrdpDetail(prdpCode);
  res.send(list);
});

// 주문 검색
router.get(`/orderList`, async (req, res) => {
  const data = req.query;
  let list = await produceService.findByCodeOrNameOrd(data);
  res.send(list);
});

// 제품 검색
router.get(`/prodList`, async (req, res) => {
  const data = req.query;
  let list = await produceService.findByCodeOrNameProd(data);
  res.send(list);
});

// 라인 검색
router.get(`/lineList`, async (req, res) => {
  const data = req.query;
  let list = await produceService.findByCodeOrNameLine(data);
  res.send(list);
});

module.exports = router;
