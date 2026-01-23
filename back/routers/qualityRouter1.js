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

module.exports = router;
