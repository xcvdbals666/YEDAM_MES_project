const express = require("express");
const router = express.Router();

const materialServie = require("../services/materialServie.js");

router.get(`/material`, async (req, res) => {
  let list = await materialServie.findAll();
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
