const express = require("express");
const router = express.Router();

const materialService2 = require("../services/materialService2.js");

// 작성자 선택 - 사원 정보 조회
router.get("/emp", async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await materialService2.findByEmpcodeEmpTbl(keyword);
  res.send(list);
});

// 다음 요청번호 생성
router.get("/next-code", async (req, res) => {
  const mprCode = await materialService2.findMaxMprCode();
  res.send({ mprCode });
});

// mrp code 조회
router.get("/getMrpCode", async (req, res) => {
  const list = await materialService2.findAllMrpCodeMrpTbl();
  res.send(list);
});

// 자재 선택 - 자재 정보 조회
router.get(`/mat-info`, async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await materialService2.findByMatCodeMatTbl(keyword);
  res.send(list);
});

// 자재구매요청/수정
router.post("/mat-request", async (req, res) => {
  try {
    const data = req.body;
    const result = await materialService2.modifyMprTbl(data);
    res.send(result);
  } catch (err) {
    res.status(400).send({
      message: err.message || "처리 중 오류 발생",
    });
  }
});

// 자재구매요청 삭제
router.delete("/mat-request/:mprCode", async (req, res) => {
  try {
    const mprCode = req.params.mprCode;
    const result = await materialService2.removeMpr(mprCode);
    res.send(result);
  } catch (err) {
    res.status(400).send({
      status: "fail",
      message: err.message,
    });
  }
});

// 자재구매요청 조회
router.get("/mpr-request", async (req, res) => {
  const {
    mprCode,
    reqDateFrom,
    reqDateTo,
    deadlineFrom,
    deadlineTo,
    mrpCode,
    mcode,
  } = req.query;

  const list = await materialService2.findByMprCodeMprTbl({
    mprCode,
    reqDateFrom,
    reqDateTo,
    deadlineFrom,
    deadlineTo,
    mrpCode,
    mcode,
  });

  res.send(list);
});

// 자재구매요청 상세 정보 조회 - 요청기본정보
router.get("/mpr-request/:mprCode/header", async (req, res) => {
  const mprCode = req.params.mprCode;
  const result = await materialService2.findByMprCodeMprTblDetail(mprCode);
  res.send(result);
});

// 자재구매요청 상세 정보 조회 - 요청자재상세
router.get("/mpr-request/:mprCode/items", async (req, res) => {
  const mprCode = req.params.mprCode;
  const list = await materialService2.findByMprCodeMprDTblDetail(mprCode);
  res.send(list);
});

// MPR 불러오기용 모달 + 검색
router.get("/header-modal", async (req, res) => {
  const { keyword = "" } = req.query;
  const list = await materialService2.findMprHeaderModal(keyword);
  res.send(list);
});

// MPR 불러오기용 - 헤더부분
router.get("/mpr-header/:mprCode", async (req, res) => {
  const mprCode = req.params.mprCode;
  const result = await materialService2.findMprHeader(mprCode);
  res.send(result);
});

// 자재구매요청서 목록 조회
// router.get("/mpr-list", async (req, res) => {
//   const { keyword = "" } = req.query;
//   const list = await materialService2.findAllMprTbl(keyword);
//   res.send(list);
// });

// 공급업체 목록 조회
router.get("/client-list", async (req, res) => {
  const { keyword = "" } = req.query;
  const list = await materialService2.findAllClientTbl(keyword);
  res.send(list);
});

//MRP 기준 정보 불러오기
router.get("/request-mrp/:mrpCode", async (req, res) => {
  const mrpCode = req.params.mrpCode;
  const list = await materialService2.findByMrpCodeMrpDTbl(mrpCode);
  res.send(list);
});

// 구매요청 수정/삭제 여부 확인
router.get("/mpr-request/:mprCode/editable", async (req, res) => {
  const mprCode = req.params.mprCode;
  const isEditable = await materialService2.findIsEditable(mprCode);
  res.send({ isEditable });
});

// 입출고내역조회
router.get("/mat-inout", async (req, res) => {
  const params = req.query;
  const list = await materialService2.findMaterialInOutList(params);
  res.send(list);
});

module.exports = router;
