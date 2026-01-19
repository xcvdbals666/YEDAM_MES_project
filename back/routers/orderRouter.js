const express = require("express");
const router = express.Router();

const orderServie = require("../services/orderServie.js");

router.get(`/order`, async (req, res) => {
  let list = await orderServie.findAllOrder();
  res.send(list);
});

router.get(`/clientList`, async (req, res) => {
  let list = await orderServie.findAllClient();
  res.send(list);
});
module.exports = router;
