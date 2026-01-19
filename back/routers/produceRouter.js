const express = require("express");
const router = express.Router();

const produceService = require("../services/produceService.js");

router.get(`/produce`, async (req, res) => {
  let list = await produceService.findAll();
  res.send(list);
});

//전체 작업지시서 조회 + 검색
router.get(`/workorderList`, async (req, res) => {
  const list = await produceService.findAllWkotbl();
  res.send(list);
})

//전체 생산계획서 조회
router.get(`/prdpList`, async (req, res) => {
  const list = await produceService.findAllPrdp();
  res.send(list);
})

module.exports = router;
