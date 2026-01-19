const express = require("express");
const router = express.Router();

const qualityServie = require("../services/qualityServie.js");

router.get(`/quality`, async (req, res) => {
  let list = await qualityServie.findAll();
  res.send(list);
});

module.exports = router;
