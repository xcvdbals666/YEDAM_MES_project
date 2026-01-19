const express = require("express");
const router = express.Router();

const qualityService = require("../services/qualityService");

router.get(`/qiorder`, async (req, res) => {
  let list = await qualityService.findAllQiOrderCheckList();
  res.send(list);
});

module.exports = router;
