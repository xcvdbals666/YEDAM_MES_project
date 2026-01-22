const express = require("express");
const router = express.Router();

const orderService = require("../services/orderService2.js");

// 출고 목록 조회 + 검색
router.get(`/outbounds`, async (req, res) => {
  try {
    // 검색 파라미터가 하나라도 있는지 확인
    const hasSearchParams =
      req.query.out_req_code ||
      req.query.prod_code ||
      req.query.emp_code ||
      req.query.client_code ||
      req.query.req_qtt_min ||
      req.query.req_qtt_max ||
      req.query.date_start ||
      req.query.date_end;

    let result;

    if (hasSearchParams) {
      // 검색 파라미터가 있으면 검색
      const params = {
        out_req_code: req.query.out_req_code,
        prod_code: req.query.prod_code,
        emp_code: req.query.emp_code,
        client_code: req.query.client_code,
        req_qtt_min: req.query.req_qtt_min,
        req_qtt_max: req.query.req_qtt_max,
        date_start: req.query.date_start,
        date_end: req.query.date_end,
      };
      result = await orderService.findSearchOutreqtbl(params);
    } else {
      result = await orderService.findAllOutreqtbl();
    }
    res.send(result);
  } catch (error) {
    console.error("출고 조회 실패: ", error);
    res.status(500).json({ error: "출고 조회 중 오류가 발생했습니다." });
  }
});

// 주문 선택 모달
router.get("/order-code", async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await orderService.findByOrderOrdTbl(keyword);
  res.send(list);
});

// 출고 번호 선택 모달
router.get("/outbound-code", async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await orderService.findByOutcodeOutTbl(keyword);
  res.send(list);
});

// 출고 제품 선택 모달
router.get("/outbound-prod", async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await orderService.findByCodeProdTbl(keyword);
  res.send(list);
});

// 거래처 선택 모달
router.get("/outbound-client", async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await orderService.findByCodeClientTbl(keyword);
  res.send(list);
});

// 출고 담당자 선택 모달
router.get("/outbound-emp", async (req, res) => {
  const { keyword = "" } = req.query;
  let list = await orderService.findByEmpcodeEmpTbl(keyword);
  res.send(list);
});

// 주문 정보 단건 조회
router.get("/order-code/:ord_code", async (req, res) => {
  const ord_code = req.params.ord_code;
  let result = await orderService.findByOrdcode(ord_code);
  res.send(result);
});

// 주문 제품 목록 조회
router.get("/order-products/:ord_code", async (req, res) => {
  const ord_code = req.params.ord_code;
  let result = await orderService.findProductsByOrdcode(ord_code);
  res.send(result);
});

// 주문 정보 + 제품 목록 함께 조회
router.get("/order-detail/:ord_code", async (req, res) => {
  const ord_code = req.params.ord_code;
  let result = await orderService.findOrderDetailForOutbound(ord_code);
  res.send(result);
});

module.exports = router;
