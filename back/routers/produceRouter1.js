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
  res.json(rows);
});

// 작업진행 상세 조회
router.get("/workInProcessDetail/:wko_code", async (req, res) => {
  try {
    const { wko_code } = req.params;
    const result = await produceService.getWorkInProcessDetail(wko_code);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "작업진행 상세 조회 실패" });
  }
});

//라인 기준 사용해야 할 설비 목록 뽑아오기
//ex. LINE-001에 매핑된 eq_code전부의 eq_name 띄우기
router.get("/equipmentByLine/:lineCode", async (req, res) => {
  try {
    const { lineCode } = req.params;
    const data = await produceService.getEquipmentsByLine(lineCode);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "라인 설비 목록 조회 실패",
      error: String(err.message || err),
    });
  }
});

//선택한 wko_tbl의 prod_code로 타고가서 po_tbl에서 공정명 드롭다운 뽑기
router.get("/wkprocessByPrdCode/:wkoCode", async (req, res) => {
  try {
    const { wkoCode } = req.params;
    const data = await produceService.getProcessesByWko(wkoCode);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "공정 드롭다운 조회 실패",
      error: String(err.message || err),
    });
  }
});

//작업시작버튼 눌렀을때
router.post("/workStart", async (req, res) => {
  try {
    const result = await produceService.startWork(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// 작업지시서 기준 설비 진행상태
router.get("/prdrByWko/:wko_code", async (req, res) => {
  const { wko_code } = req.params;
  const data = await produceService.getPrdrStatusByWko(wko_code);
  res.json(data);
});

// 설비 단건 상세
router.get("/prdrDDetail/:prdr_d_code", async (req, res) => {
  const { prdr_d_code } = req.params;
  const data = await produceService.getPrdrDDetail(prdr_d_code);
  res.json(data);
});

//Bulletin 공정 조회
router.get('/wipBulletin/:wkoCode', async (req, res) => {
  try {
    const { wkoCode } = req.params;
    const data = await produceService.getWipBulletin(wkoCode);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'bulletin 조회 실패', error: String(err.message || err) });
  }
});
module.exports = router;
