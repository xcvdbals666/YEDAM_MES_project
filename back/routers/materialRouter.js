const express = require("express");
const router = express.Router();

const materialService = require("../services/materialService.js");

router.get(`/material`, async (req, res) => {
  let list = await materialService.findAll();
  res.send(list);
});

module.exports = router;
