// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 출고 조회
const findAllOutreqtbl = async () => {
  let list = await mysql.query("selectAllOutreqtbl", [], "order2");
  return list;
};

// 출고 번호 선택 모달
const findByOutcodeOutTbl = async (keyword) => {
  let sql = `
    SELECT r.out_req_code, r.out_req_date, r.ord_code, c.client_name, 
           d.ord_amount, d.out_req_d_amount, r.out_req_stat
    FROM out_req_tbl r
    JOIN client_tbl c ON c.client_code = r.client_code
    JOIN out_req_d_tbl d ON d.out_req_code = r.out_req_code
    JOIN ord_tbl o ON o.ord_code = r.ord_code
    WHERE 1=1
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        r.out_req_code LIKE ?
        OR r.ord_code LIKE ?
        OR c.client_name LIKE ?
      )
    `;
    const like = `%${keyword}%`;
    params.push(like, like, like);
  }
  sql += ` ORDER BY r.out_req_code `;
  return mysql.rquery(sql, params);
};

// 출고 제품 선택 모달
const findByCodeProdTbl = async (keyword) => {
  let sql = `
    SELECT prod_code, prod_name, com_value
    FROM prod_tbl
    WHERE prod_type = 'i1'
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        prod_code LIKE ?
        OR prod_name LIKE ?
      )
    `;
    const like = `%${keyword}%`;
    params.push(like, like);
  }
  sql += ` ORDER BY prod_code `;
  return mysql.rquery(sql, params);
};

// 거래처 선택 모달
const findByCodeClientTbl = async (keyword) => {
  let sql = `
    SELECT client_code, client_name
    FROM client_tbl
    WHERE client_type = 'l1'
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        client_code LIKE ?
        OR client_name LIKE ?
      )
    `;
    const like = `%${keyword}%`;
    params.push(like, like);
  }
  sql += ` ORDER BY client_code `;
  return mysql.rquery(sql, params);
};

// 출고 담당자 선택 모달
const findByEmpcodeEmpTbl = async (keyword) => {
  let sql = `
    SELECT emp_code, emp_name
    FROM emp_tbl
    WHERE dept_code = 'DEPT-1'
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        emp_code LIKE ?
        OR emp_name LIKE ?
      )
    `;
    const like = `%${keyword}%`;
    params.push(like, like);
  }
  sql += ` ORDER BY emp_code `;
  return mysql.rquery(sql, params);
};

// 출고 조회 검색
const findSearchOutreqtbl = async (params) => {
  const queryParams = [
    params.out_req_code || null,
    params.out_req_code || null,
    params.prod_code || null,
    params.prod_code || null,
    params.emp_code || null,
    params.emp_code || null,
    params.client_code || null,
    params.client_code || null,
    params.req_qtt_min || null,
    params.req_qtt_min || null,
    params.req_qtt_max || null,
    params.req_qtt_max || null,
    params.date_start || null,
    params.date_start || null,
    params.date_end || null,
    params.date_end || null,
  ];

  let list = await mysql.query("searchOutreqtbl", queryParams, "order2");
  return list;
};

// 주문 선택 모달
const findByOrderOrdTbl = async (keyword) => {
  let sql = `
    SELECT o.ord_code, od.prod_code, p.prod_name, od.ord_amount, o.ord_name, o.ord_date, o.ord_stat
    FROM ord_tbl o
    JOIN ord_d_tbl od ON o.ord_code = od.ord_code
    JOIN prod_tbl p ON od.prod_code = p.prod_code
    WHERE 1=1
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        o.ord_code LIKE ?
        OR o.ord_name LIKE ?
      )
    `;
    const like = `%${keyword}%`;
    params.push(like, like);
  }
  sql += ` ORDER BY o.ord_code DESC `;
  return mysql.rquery(sql, params);
};

// 주문 정보 단건 조회
const findByOrdcode = async (ord_code) => {
  let info = await mysql.query("selectByOrdcode", [ord_code], "order2");
  return info;
};

// 주문 제품 목록 조회
const findProductsByOrdcode = async (ord_code) => {
  let list = await mysql.query("selectProdList", [ord_code], "order2");
  return list;
};

// 주문 정보 + 제품 목록 조회 + 출고코드 생성
const findOrderDetailForOutbound = async (ord_code) => {
  // Promise.all(): 여러 개의 비동기 작업을 동시에 실행하고 모두 끝날 때까지 기다림
  const [orderInfo, products, outCode] = await Promise.all([
    mysql.query("selectByOrdcode", [ord_code], "order2"),
    mysql.query("selectProdList", [ord_code], "order2"),
    mysql.query("generateOutReqCode", [], "order2"),
  ]);

  // 제품 목록의 숫자 필드들을 Number로 변환
  const processedProducts = products.map((product) => ({
    ...product,
    ord_amount: Number(product.ord_amount),
    current_stock: Number(product.current_stock) || 0,
    already_out_amount: Number(product.already_out_amount) || 0,
    pending_amount: Number(product.pending_amount) || 0,
  }));

  return {
    orderInfo: orderInfo[0] || null, // 주문 정보는 1개
    products: processedProducts, // 변환된 배열
    out_req_code: outCode[0].new_out_req_code,
  };
};

// 출고 요청 생성
const createOutboundRequest = async (requestData) => {
  const { outReqInfo, products } = requestData;

  try {
    // 1. 출고요청 기본정보 INSERT
    await mysql.query(
      "insertOutReq",
      [
        outReqInfo.out_req_code,
        outReqInfo.out_req_date,
        outReqInfo.ord_predict_date,
        outReqInfo.note,
        outReqInfo.ord_code,
        outReqInfo.mcode,
        outReqInfo.client_code,
      ],
      "order2",
    );

    // 2. 출고요청 상세코드 INSERT (제품별 반복)
    for (let i = 0; i < products.length; i++) {
      const detailCode = `${outReqInfo.out_req_code}-D${String(i + 1).padStart(4, "0")}`;

      await mysql.query(
        "insertOutReqDetail",
        [
          detailCode,
          products[i].out_req_d_amount,
          products[i].ord_amount,
          outReqInfo.out_req_code,
          products[i].prod_code,
          products[i].com_value,
        ],
        "order2",
      );
    }

    // 3. 주문 상태 UPDATE
    await mysql.query("updateOrdStat", [outReqInfo.ord_code], "order2");

    return {
      success: true,
      message: "출고 요청이 완료되었습니다.",
      out_req_code: outReqInfo.out_req_code,
    };
  } catch (error) {
    console.error("출고 요청 생성 오류:", error);
    throw error;
  }
};

// 출고요청 선택 모달
const findAllOutReq = async (keyword) => {
  let sql = `
    SELECT o.out_req_code, p.prod_name, ord.ord_name, o.out_req_date, o.out_req_stat
    FROM out_req_tbl o
    JOIN out_req_d_tbl od ON od.out_req_code = o.out_req_code
    JOIN prod_tbl p ON od.prod_code = p.prod_code
    JOIN ord_tbl ord ON ord.ord_code = o.ord_code
    WHERE 1=1
  `;
  const params = [];

  if (keyword) {
    sql += `
      AND (
        o.out_req_code LIKE ?
        OR ord.ord_name LIKE ?
      )
    `;
    const like = `%${keyword}%`;
    params.push(like, like);
  }
  sql += ` ORDER BY o.out_req_code DESC `;
  return mysql.rquery(sql, params);
};

// 출고 요청 정보 + 제품 목록 조회
const findOutReqDetailForOutbound = async (out_req_code) => {
  // Promise.all(): 여러 개의 비동기 작업을 동시에 실행하고 모두 끝날 때까지 기다림
  const [outReqInfo, products] = await Promise.all([
    mysql.query("selectByOutReqCode", [out_req_code], "order2"),
    mysql.query("selectProdListByOutreq", [out_req_code, out_req_code], "order2")
  ]);

    // 제품 목록의 숫자 필드들을 Number로 변환
  const processedProducts = products.map((product) => ({
    ...product,
    out_req_amount: Number(product.out_req_amount),
    already_outbnd_qtt: Number(product.already_outbnd_qtt) || 0,
    not_outbnd_qtt: Number(product.not_outbnd_qtt) || 0,
    current_stock: Number(product.current_stock) || 0,
  }));

  return {
    outReqInfo: outReqInfo[0] || null,
    products: processedProducts,
  };
};

// 제품별 로트 재고 조회
const findLotsByProdCode = async (prod_code) => {
  let list = await mysql.query("selectLotsByProdCode", [prod_code, prod_code], "order2");
  return list;
};

// 출고 등록
const createOutbound = async (outboundData) => {
  const { outInfo, products } = outboundData;
  
  try {
    // 1. 출고코드 생성 (출고요청코드 기준)
    const [codeResult] = await mysql.query(
      'generateOutCode', 
      [outInfo.out_req_code, outInfo.out_req_code], 
      'order2'
    );
    const out_code = codeResult.new_out_code;
    
    // 2. 각 제품의 각 로트별로 INSERT
    for (const product of products) {
      for (const lot of product.selectedLots) {
        await mysql.query('insertOutbound', [
          out_code,              // 출고코드
          lot.out_qtt,           // req_qtt
          lot.out_qtt,           // outbnd_qtt
          outInfo.out_date,      // deadline (출고일)
          outInfo.out_req_code,  // outbound_request_code
          lot.lot_num,           // lot_num
          product.prod_code,     // prod_code
          outInfo.client_code,   // client_code
          outInfo.mcode          // mcode
        ], 'order2');
      }
    }
    
    // 3. 출고요청 상태 업데이트
    await mysql.query('updateOutReqStat', [outInfo.out_req_code], 'order2');
    
    // 4. 주문 상태 업데이트
    await mysql.query('updateOrdStat', [outInfo.ord_code], 'order2');
    
    return {
      success: true,
      message: '출고 등록이 완료되었습니다.',
      out_code: out_code
    };
  } catch (error) {
    console.error('출고 등록 오류:', error);
    throw error;
  }
};

module.exports = {
  findAllOutreqtbl,
  findByOrderOrdTbl,
  findByOutcodeOutTbl,
  findByCodeProdTbl,
  findByCodeClientTbl,
  findByEmpcodeEmpTbl,
  findSearchOutreqtbl,
  findByOrdcode,
  findProductsByOrdcode,
  findOrderDetailForOutbound,
  createOutboundRequest,
  findAllOutReq,
  findOutReqDetailForOutbound,
  findLotsByProdCode,
  createOutbound
};
