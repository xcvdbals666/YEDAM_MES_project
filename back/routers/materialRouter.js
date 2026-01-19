const express = require("express");
const router = express.Router();

const materialServie = require("../services/materialServie.js");

router.get(`/material`, async (req, res) => {
  let list = await materialServie.findAll();
  res.send(list);
});

module.exports = router;
