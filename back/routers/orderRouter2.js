const express = require("express");
const router = express.Router();

const orderService = require("../services/orderService2.js");

router.get(`/order`, async (req, res) => {
  let list = await orderService.findAllOrder();
  res.send(list);
});

router.get(`/clientList`, async (req, res) => {
  let list = await orderService.findAllClient();
  res.send(list);
});
router.get(`/outbounds`, async (req, res) => {
  let list = await orderService.findAllOutreqtbl();
  res.send(list);
});

module.exports = router;
