const express = require("express");
const router = express.Router();

const produceService = require("../services/produceService.js");

router.get(`/production/planList`, async (req, res) => {
  const data = req.params;
  let list = await produceService.findAll(data);
  res.send(list);
});

module.exports = router;
