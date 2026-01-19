const express = require("express");
const router = express.Router();

const produceService = require("../services/produceService1.js");

router.get(`/production/planList`, async (req, res) => {
  const data = req.params;
  let list = await produceService.findAll(data);
  res.send(list);
});

//전체 작업지시서 조회 + 검색
router.get(`/workorderList`, async (req, res) => {
  const list = await produceService.searchWorkOrders(req.query);
  res.send(list);
});

//전체 생산계획서 조회
router.get(`/prdpList`, async (req, res) => {
  const list = await produceService.findAllPrdp();
  res.send(list);
});

module.exports = router;
