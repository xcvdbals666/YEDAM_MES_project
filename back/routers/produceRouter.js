const express = require("express");
const router = express.Router();

const produceService = require("../services/produceService.js");

router.get(`/produce`, async (req, res) => {
  let list = await produceService.findAll();
  res.send(list);
});

module.exports = router;
