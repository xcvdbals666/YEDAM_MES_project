// 라우터
const express = require("express");
const router = express.Router();
const qualityService2 = require("../services/qualityService2.js");

// /api/quality/qi-order

router.get("/qi-order", async (req, res) => {
  try {
    const { qio_code } = req.query;
    const list = await qualityService2.findQiOrderList(qio_code);
    res.json(list);
  } catch (err) {
    console.error(err); // 터미널에 에러 출력
    res.status(500).json({ message: "서버 에러", error: err.message });
  }
});

module.exports = router;
