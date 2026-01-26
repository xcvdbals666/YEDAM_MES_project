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

// 검사지 전체 불러오기
router.get(`/qiorderlist`, async (req, res) => {
  let list = await qualityService2.findAllQiOrderList();
  res.send(list);
});

// 품질 검사 결과 목록 조회
router.get(`/qioresultlist`, async (req, res) => {
  let list = await qualityService2.findAllResultList();
  res.send(list);
});

// 품질 검사 결과 상세 조회
router.get(`/qioresultdetail/:qir_code`, async (req, res) => {
  try {
    const { qir_code } = req.params; // URL param 받기
    const detail = await qualityService2.findResultDetail(qir_code); // 서비스에 코드 전달
    res.json(detail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 에러", error: err.message });
  }
});


module.exports = router;
