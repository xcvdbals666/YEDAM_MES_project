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
router.get(`/planProd/:prdp_code`, async (req, res) => {
  const data = req.params;
  let list = await produceService.findPrdpDetail(data);
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

// 생산계획 저장
router.put(`/prdp`, async (req, res) => {
  const data = req.body;
  let result = await produceService.modifyPrdp(data);
  res.send(result);
});

// 생산계획 삭제
router.delete(`/prdp`, async (req, res) => {
  const data = req.body;
  let result = await produceService.removePrdp(data);
  res.send(result);
});

module.exports = router;
