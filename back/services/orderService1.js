// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// 주문 전체 조회
const findAllOrder = async () => {
  let list = await mysql.query("selectAllOrder", [], "order1");
  return list;
};
const findOrderDetailByCode = async (code) => {
  let list = await mysql.query("selectOrderDetailByCode", [code], "order1");
  return list;
};
// 공급업체 목록 조회
const findAllClient = async () => {
  let list = await mysql.query("selectAllClient", [], "order1");
  return list;
};

// 영업부서 직원 전체조회
const findAllEmployees = async () => {
  let list = await mysql.query("selectAllEmployees", [], "order1");
  return list;
};
// 완제품 전체 조회
const findAllProducts = async () => {
  let list = await mysql.query("selectAllProducts", [], "order1");
  return list;
};
// 주문 및 주문상세 등록
const addOrder = async (order, orderDetail) => {
  console.log(order);
  console.log(orderDetail);
  let result = await mysql.query("selectOrderCode", [], "order1");
  let ordCode = result[0].ord_code;
  // ord_code 받아오기
  order.ord_code = ordCode;
  order.ord_stat = "a1";
  // 주문 등록
  let rows = await mysql.query("insertOrder", [order], "order1");
  // 주문상세 데이터 정리
  const detailValues = orderDetail.map((item) => [
    item.unit,
    item.spec,
    item.ord_amount,
    item.prod_price,
    item.delivery_date,
    item.ord_priority,
    item.total_price,
    ordCode,
    item.prod_code,
  ]);
  console.log(detailValues);
  // 주문상세 등록
  let detailResult = await mysql.query(
    "insertOrderDetail",
    [detailValues],
    "order1",
  );
  return ordCode;
};
// 주문 및 주문상세 수정(상세는 추가도 가능함.)
const modifyOrder = async (order, orderDetail) => {
  let ordCode = order.ord_code;
  delete order.ord_code;
  delete order.client_name;
  delete order.ord_date;
  delete order.ord_priority;
  delete order.stat_note;
  delete order.mname;
  delete order.count;
  const detailValues = orderDetail.map((item) => [
    item.ord_d_code,
    item.unit,
    item.spec,
    item.ord_amount,
    item.prod_price,
    item.delivery_date,
    item.ord_priority,
    item.total_price,
    ordCode,
    item.prod_code,
  ]);
  console.log(orderDetail);
  console.log(detailValues);
  let detail = await mysql.query("deleteDetail", [ordCode], "order1");
  let orderResult = await mysql.query(
    "updateOrder",
    [order, ordCode],
    "order1",
  );
  let detailResult = await mysql.query(
    "updateDetail",
    [detailValues],
    "order1",
  );
  return { order: orderResult, detail: detailResult };
};
// 주문 삭제
const removeOrder = async (ordCode) => {
  let result;
  let detail = await mysql.query("deleteDetail", [ordCode], "order1");
  let order = await mysql.query("deleteOrder", [ordCode], "order1");
  if (order.affectedRows > 0 || detail.affectedRows > 0) {
    result = `삭제완료`;
  } else {
    result = `삭제실패`;
  }

  return result;
};
// 상태 가져오기
const findStats = async () => {
  let result = await mysql.query("selectOrderStats", [], "order1");
  return result;
};
// ai활용
const askAI = async (prodCode, orderQty) => {
  const prodRows = await mysql.query("selectProductQty", [prodCode], "order1");
  console.log(prodRows);
  const currentStock = prodRows[0]?.current_qty || 0;
  const prodName = prodRows[0]?.prod_name || prodCode;
  const productionNeeded = Math.max(0, orderQty - currentStock);
  let materialShortages = [];
  const matRows = await mysql.query(
    "selectMatStock",
    [productionNeeded, prodCode],
    "order1",
  );
  materialShortages = matRows
    .filter((m) => m.stock_qty < m.need_qty)
    .map((m) => ({
      name: m.mat_name,
      shortage_qty: m.need_qty - m.stock_qty,
      lead_time: 3,
    }));
  const wkoRows = await mysql.query("selectwkoByStat", [], "order1");
  const factoryLoad = wkoRows[0].cnt > 10 ? "High (주문 밀림)" : "Low (원활)";
  const contextData = {
    product: prodName,
    order_qty: orderQty,
    current_stock: currentStock,
    production_needed: productionNeeded,
    material_shortages: materialShortages,
    factory_load: factoryLoad,
    today: new Date().toISOString().split("T")[0],
  };
  console.log(wkoRows);
  const model = genAI.getGenerativeModel({
    model: "gemma-3-12b-it",
  });
  const prompt = `
        당신은 노련한 생산 관리자입니다. 아래 공장 상황 데이터를 분석하여 납기 예정일을 계산해주세요.

        [공장 상황 데이터]
        ${JSON.stringify(contextData, null, 2)}

        [납기 계산 규칙]
        1. 재고가 충분하면 납기일은 '내일'입니다.
        2. 생산이 필요하면 기본 생산 기간은 2일입니다.
        3. 자재가 부족하면 '자재 리드타임(lead_time)' 중 가장 긴 기간을 생산 기간에 더하세요.
        4. 공장 혼잡도(factory_load)가 'High'라면 1일을 추가로 더하세요.
        5. 최종 납기일은 '오늘' 날짜에 위 기간들을 더해서 계산하세요.

        [응답 형식]
        반드시 아래 JSON 포맷으로만 응답하세요. (마크다운, 설명 텍스트 금지,추가 문의 금지)
        {
          "estimated_date": "YYYY-MM-DD",
          "days_needed": 총_소요_일수(숫자),
          "risk_level": "Low" | "Medium" | "High",
          "reason": "고객에게 설명할 친절한 사유 (한 문장)"
        }
      `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  console.log(response);
  const text = response
    .text()
    .replace(/```json|```/g, "")
    .trim(); // 마크다운 제거
  console.log(text);
  return JSON.parse(text);
};
module.exports = {
  findAllOrder,
  findAllClient,
  findAllEmployees,
  findAllProducts,
  findOrderDetailByCode,
  addOrder,
  modifyOrder,
  removeOrder,
  findStats,
  askAI,
};
