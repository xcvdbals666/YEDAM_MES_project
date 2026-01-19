const express = require("express");
const router = express.Router();

const qualityService = require("../services/qualityService2.js");

router.get(`/quality`, async (req, res) => {
  let list = await qualityService.findAll();
  res.send(list);
});

module.exports = router;
