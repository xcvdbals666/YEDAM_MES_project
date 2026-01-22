const express = require("express");
const router = express.Router();
const materialService = require("../services/materialService1.js");

// MPR
// 검색
router.get("/mpr/search/:keyword", async (req, res) => {
  const { keyword } = req.params;
  const list = await materialService.searchMprTbl(keyword);
  res.send(list);
});

// MPR 선택 -> 포함 자재 조회
router.get("/mpr/:mprCode", async (req, res) => {
  const { mprCode } = req.params;
  const list = await materialService.findByMprCode(mprCode);
  res.send(list);
});

// MPR 목록 (가장 일반적)
router.get("/mpr", async (req, res) => {
  const list = await materialService.findAllMprTbl();
  res.send(list);
});

// 자재 마스터 (자재추가 모달)
router.get("/mat", async (req, res) => {
  const list = await materialService.findAllMatTbl();
  res.send(list);
});

// MRP
router.get("/mrp/:mrpCode", async (req, res) => {
  const { mrpCode } = req.params;
  const list = await materialService.findByMrpCodeMrpDTbl(mrpCode);
  res.send(list);
});

// MPO
router.post("/mpo", async (req, res) => {
  const result = await materialService.addMpoTbl(req.body);
  res.send(result);
});

// 발주서 수정
router.put("/mpo/:purchaseCode", async (req, res) => {
  const { purchaseCode } = req.params;
  const { statCode, mpoData } = req.body;
  const result = await materialService.updateMpoTbl(
    statCode,
    purchaseCode,
    mpoData,
  );
  res.send(result);
});

// 발주서 삭제
router.delete("/mpo/:purchaseCode", async (req, res) => {
  try {
    const { purchaseCode } = req.params;
    const result = await materialService.deleteMpoTbl(purchaseCode);
    res.json(result);
  } catch (err) {
    console.error("발주서 삭제 에러:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

//발주서 상세 검색
router.get("/mpo/search/detail", async (req, res) => {
  const list = await materialService.searchMpoDetail(req.query);
  res.send(list);
});

// 발주서 검색
router.get("/mpo/search/:keyword", async (req, res) => {
  const { keyword } = req.params;
  const list = await materialService.searchMpoTbl(keyword);
  res.send(list);
});

router.get("/mpo/:purchaseCode/detail", async (req, res) => {
  const { purchaseCode } = req.params;
  const list = await materialService.findByCodeMpoDTbl(purchaseCode);
  res.send(list);
});

router.get("/mpo/:purchaseCode", async (req, res) => {
  const { purchaseCode } = req.params;
  const list = await materialService.findByCodeMpoTbl(purchaseCode);
  res.send(list);
});

router.get("/mpo", async (req, res) => {
  const list = await materialService.findAllMpoTbl();
  res.send(list);
});

module.exports = router;
