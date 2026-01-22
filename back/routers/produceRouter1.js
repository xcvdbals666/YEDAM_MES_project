const express = require("express");
const router = express.Router();

const produceService = require("../services/produceService1.js");

//전체 작업지시서 조회 + 검색
router.get(`/workorderList`, async (req, res) => {
  const list = await produceService.searchWorkOrders(req.query);
  res.send(list);
});

//라인 조회 (드롭다운용)
router.get(`/allLineList`, async (req, res) => {
  try {
    const list = await produceService.findAllLinesDJ();
    res.send(list);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "라인조회실패했음. . " });
  }
});

//생산계획 (due_date가 오늘날짜 기준 최근 60일까지만) 조회 - 모달 선택용 리스트
router.get(`/prdpListActive`, async (req, res) => {
  const list = await produceService.findPrdpActive();
  res.send(list);
});

//작업지시서 : 생산계획 상세 + 제품명 + 공정유형 가져오기 (prdp_code로 가져오기)
router.get(`/prdpDetail/:prdpCode`, async (req, res) => {
  const { prdpCode } = req.params;
  const list = await produceService.findPrdpDetail(prdpCode);
  res.send(list);
});

//제품 목록 중복없이 조회
router.get(`/allProductsList`, async (req, res) => {
  const list = await produceService.findAllPrdDistinct();
  res.send(list);
});

//작업지시서 등록하기
router.post("/workorderSave", async (req, res) => {
  try {
    const result = await produceService.saveWorkOrder(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error("라우터 에러:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

//불러온 작업지시서 삭제하기
router.delete("/workOrderRemove/:wko_code", async (req, res) => {
  const { wko_code } = req.params;
  const result = await produceService.removeWorkOrder(wko_code);
  res.send(result);
});

//(동적)작업진행조회 페이지에서 작업지시서, 생산실적 테이블로 검색조회
router.get(`/workInProcessList`, async (req, res) => {
  const rows = await produceService.getWorkInProcessList(req.query);
  res.json(rows)
})

module.exports = router;
