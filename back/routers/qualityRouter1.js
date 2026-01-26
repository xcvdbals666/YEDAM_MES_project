const express = require("express");
const router = express.Router();

const qualityService = require("../services/qualityService1.js");

// 검사지시서 관리
// 게시글 전체 목록
router.get(`/qiorder`, async (req, res) => {
  let list = await qualityService.findAllQiOrderCheckList();
  res.send(list);
});

// 검사지 전체 불러오기
router.get(`/qiorderlist`, async (req, res) => {
  let list = await qualityService.findAllQiOrderList();
  res.send(list);
});

// 검사지에 해당하는 자재 및 검사항목 불러오기
router.get(`/qiorderiteminfo/:id`, async (req, res) => {
  let id = req.params.id;
  let list = await qualityService.findQiOrderItemInfo(id);
  res.send(list);
});

// 검사지에 해당하는 생산품 및 검사항목 불러오기
router.get(`/qiorderProdinfo/:id`, async (req, res) => {
  let id = req.params.id;
  let list = await qualityService.findQiProdInfo(id);
  res.send(list);
});

// 생산실적 전체 불러오기
router.get(`/qiproducelist`, async (req, res) => {
  let list = await qualityService.findQiProduceList();
  res.send(list);
});

// 발주서상세 목록 불러오기
router.get("/qimpolist", async (req, res) => {
  let list = await qualityService.findQiMpoList();
  res.send(list);
});

// 검사지시서 등록
router.post("/submitqiorderform", async (req, res) => {
  let data = req.body;
  console.log(data);
  let list = await qualityService.addQiOrderForm(data);
  res.send(list);
});

// 검사지시서 삭제
router.delete("/removeqiorder/:id", async (req, res) => {
  let id = req.params.id;
  console.log(id);
  let list = await qualityService.removeqiorder(id);
  res.send(list);
});

// 검사 결과서 관리
// 검사지 전체 불러오기
router.get(`/qirqiorderlist`, async (req, res) => {
  let list = await qualityService.findAllQirQiOrder();
  res.send(list);
});

// 검사 결과서 등록
router.post("/submitqiresult", async (req, res) => {
  let data = req.body;
  console.log(data);
  let list = await qualityService.addQiResultForm(data);
  res.send(list);
});

// 검사지 정보 불러오기(생산일 경우)
router.get(`/qirprodinfo/:id`, async (req, res) => {
  let id = req.params.id;
  let list = await qualityService.findQirProdInfo(id);
  res.send(list);
});

// 검사결과서 불러오기
router.get(`/qirlist`, async (req, res) => {
  let list = await qualityService.findQirList();
  res.send(list);
});

// 검사결과서 수정
router.put(`/modifyqirlist`, async (req, res) => {
  let data = req.body;
  console.log("data: ", data);
  let list = await qualityService.modifyQirList(data);
  res.send(list);
});

// 검사결과서 삭제
router.delete("/removeqir/:id", async (req, res) => {
  let id = req.params.id;
  console.log(id);
  let list = await qualityService.removeqir(id);
  res.send(list);
});

// 품질기준정보 관리
// 품질기준정보 불러오기
router.get(`/qcrlist`, async (req, res) => {
  let list = await qualityService.findAllQcrList();
  res.send(list);
});

// 품질기준정보 등록
router.post("/addqcrform", async (req, res) => {
  let data = req.body;
  console.log(data);
  let list = await qualityService.addQcrForm(data);
  res.send(list);
});

// 기준정보 등록 단위 공통코드 변환
router.get(`/qcrcomvalue/:id`, async (req, res) => {
  let id = req.params.id;
  let list = await qualityService.findComValue(id);
  res.send(list);
});

// 기준정보 수정
router.put(`/modifyqcrinfo`, async (req, res) => {
  let data = req.body;
  console.log("data: ", data);
  let list = await qualityService.modifyQcrInfo(data);
  res.send(list);
});

// 기준정보 삭제
router.delete(`/delqcrinfo/:id`, async (req, res) => {
  let id = req.params.id;
  let list = await qualityService.removeQcrInfo(id);
  res.send(list);
});

// 제품별 품질검사항목 선택
// 생산품 정보 불러오기
router.get(`/qiprodinfo`, async (req, res) => {
  let list = await qualityService.findAllProd();
  res.send(list);
});

// 자재 정보 불러오기
router.get(`/qibominfo`, async (req, res) => {
  let list = await qualityService.findAllBom();
  res.send(list);
});

// 제품별 검사항목 불러오기
router.get(`/qilist/:id`, async (req, res) => {
  let id = req.params.id;
  let list = await qualityService.findAllQiList(id);
  res.send(list);
});

// 제품별 검사항목 등록
router.post("/addqiinfo", async (req, res) => {
  let data = req.body;
  let list = await qualityService.addQiInfo(data);
  res.send(list);
});

// 검사항목 삭제
router.delete(`/removeqi/:id`, async (req, res) => {
  let id = req.params.id;
  let list = await qualityService.removeQi(id);
  res.send(list);
});

module.exports = router;
