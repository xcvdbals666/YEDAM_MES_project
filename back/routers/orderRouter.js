const express = require("express");
const router = express.Router();

const orderServie = require("../services/orderServie.js");

router.get(`/order`, async (req, res) => {
  let list = await orderServie.findAll();
  res.send(list);
});

router.get(`/outbounds`, async (req, res) => {
  let list = await orderServie.findAllOutreqtbl();
  res.send(list);
});

module.exports = router;
