// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

//동적쿼리 검색기능 + 전체 작업지시서 조회
const searchWorkOrders = async ({ from, to, stat, line, name, wko }) => {
  let sql = `
    SELECT 
      w.wko_code, 
      w.prdp_code,
      w.prod_code,
      p.prod_name,
      pp.prdp_date,
      w.line_code, 
      w.start_date, 
      w.end_date, 
      w.stat, 
      w.wko_qtt,
      w.wko_name
    FROM wko_tbl w
    JOIN prod_tbl p
      ON w.prod_code = p.prod_code
    JOIN prdp_tbl pp
      ON pp.prdp_code = w.prdp_code 
    WHERE 1=1
  `;
  const params = [];

  if (from) {
    sql += ` AND start_date >= ?`;
    params.push(from + " 00:00:00");
  }
  if (to) {
    sql += ` AND start_date <= ?`;
    params.push(to + " 23:59:59");
  }
  if (stat) {
    sql += ` AND stat = ?`;
    params.push(stat);
  }
  if (line) {
    sql += ` AND line_code = ?`;
    params.push(line);
  }
  if (name) {
    sql += ` AND prod_name LIKE ?`;
    params.push(`%${name}%`);
  }
  if (wko) {
    sql += ` AND wko_code LIKE ?`;
    params.push(`%${wko}%`);
  }

  sql += ` ORDER BY reg_date DESC`;

  return await mysql.rquery(sql, params);
};

//라인 조회 (드롭다운용)
const findAllLinesDJ = async () => {
  const list = await mysql.query("selectAllLinesDJ", [], "produce1");
  return list;
};

//생산계획 (due_date가 오늘날짜 기준 최근 60일까지만) 조회 - 모달 선택용 리스트
const findPrdpActive = async () => {
  const list = await mysql.query("selectPrdpActive", [], "produce1");
  return list;
};

//작업지시서 : 생산계획 상세 + 제품명 + 공정유형 가져오기 (prdp_code로 가져오기)
const findPrdpDetail = async (prdpCode) => {
  const list = await mysql.query("selectPrdpDetail", [prdpCode], "produce1");
  return list;
};

//제품 목록 중복없이 조회
const findAllPrdDistinct = async () => {
  const list = await mysql.query("selectAllPrdDistinct", [], "produce1");
  return list;
};

//작업지시서 등록하기
const updateWorkOrder = async (data) => {
  const {
    wko_code,
    start_date,
    stat,
    prdp_code,
    prod_code,
    wko_qtt,
    end_date,
    line_code,
    wko_name,
  } = data;

  if (
    !wko_code ||
    !start_date ||
    !stat ||
    !prod_code ||
    !wko_qtt ||
    !line_code ||
    !wko_name
  ) {
    throw new Error("필수값 누락");
  }

  const params = [
    wko_code,
    start_date,
    stat,
    prdp_code || null,
    prod_code,
    wko_qtt,
    end_date || null,
    line_code,
    wko_name,
  ];

  const result = await mysql.query("insertWorkOrder", params, "produce1");
  return { ok: true, wko_code, result };
};

//불러온 작업지시서 삭제하기
const removeWorkOrder = async (wko_code) => {
  if (!wko_code) throw new Error("해당 코드에 대한 작업지시서 없음");

  const result = await mysql.query("deleteWorkOrder", [wko_code], "produce1");

  return { ok: true, wko_code, result };
};

//불러온 작업지시서 수정하기
const saveWorkOrder = async (data) => {
  const {
    wko_code,
    start_date,
    stat,
    prdp_code,
    prod_code,
    wko_qtt,
    end_date,
    line_code,
    wko_name,
  } = data;

  const exists = await mysql.query("existsWorkOrder", [wko_code], "produce1");
  const isUpdate = Array.isArray(exists) && exists.length > 0;

  if (isUpdate) {
    const params = [
      start_date,
      stat,
      prdp_code || null,
      prod_code,
      wko_qtt,
      end_date || null,
      line_code,
      wko_name,
      wko_code,
    ];

    const result = await mysql.query("updateWorkOrder", params, "produce1");
    return { ok: true, mode: "update", wko_code, result };
  } else {
    const params = [
      wko_code,
      start_date,
      stat,
      prdp_code || null,
      prod_code,
      wko_qtt,
      end_date || null,
      line_code,
      wko_name,
    ];
    const result = await mysql.query("insertWorkOrder", params, "produce1");
    return { ok: true, mode: "insert", wko_code, result };
  }
};

//작업진행조회 페이지에서 작업지시서, 생산실적 테이블로 검색조회
const getWorkInProcessList = async (q = {}) => {
  const {
    wko = "",
    wkoName = "",
    name = "",
    line = "",
    from = "",
    to = "",
  } = q;

  let sql = `
  SELECT 
    w.wko_code,
    w.wko_name,
    w.prod_code,
    p.prod_name,
    w.wko_qtt,
    w.stat,
    w.reg_date,
    w.line_code,
    r.start_date,
    r.end_date
  FROM wko_tbl w
  JOIN prod_tbl p
    ON p.prod_code = w.prod_code
  LEFT JOIN prdr_tbl r
    ON r.work_order_code = w.wko_code
  `;

  const params = [];

  if (wko) {
    sql += ` AND w.wko_code LIKE ?`;
    params.push(`%${wko}%`);
  }

  if (wkoName) {
    sql += ` AND w.wko_name LIKE ?`;
    params.push(`%${wkoName}%`);
  }

  if (name) {
    sql += ` AND p.prod_name LIKE ?`;
    params.push(`%${name}%`);
  }

  if (line) {
    sql += ` AND w.line_code = ?`;
    params.push(line);
  }

  if (from) {
    sql += ` AND DATE(w.reg_date) >= ?`;
    params.push(from);
  }

  if (to) {
    sql += ` AND DATE(w.reg_date) <= ?`;
    params.push(to);
  }

  sql += ` ORDER BY w.reg_date DESC, w.wko_code DESC`;

  return await mysql.rquery(sql, params);
};

// 작업진행 상세 조회
const getWorkInProcessDetail = async (wko_code) => {
  const rows = await mysql.query("selectWipDetail", [wko_code], "produce1");

  return rows.length > 0 ? rows[0] : null;
};

//라인 기준 사용해야 할 설비 목록 뽑아오기
//ex. LINE-001에 매핑된 eq_code전부의 eq_name 띄우기
const getEquipmentsByLine = async (lineCode) => {
  const rows = await mysql.query("selectEqnameByLine", [lineCode], "produce1");
  return rows;
};

//선택한 wko_tbl의 prod_code로 타고가서 po_tbl에서 공정명 드롭다운 뽑기
const getProcessesByWko = async (wkoCode) => {
  const rows = await mysql.query(
    "selectProcessDropdownByWko",
    [wkoCode],
    "produce1",
  );
  return rows;
};

//작업시작 버튼 눌렀을때
// prdr 번호 생성
const getNextPrdrCode = async () => {
  const rows = await mysql.query("selectNextPrdrSeq", [], "produce1");
  const maxSeq = rows?.[0]?.maxSeq ?? 0;
  const next = Number(maxSeq) + 1;

  const seq = String(next).padStart(3, "0");
  return `PRDR-${seq}`;
};

//prdr_d 번호생성
const getNextPrdrDCode = async () => {
  const rows = await mysql.query("selectNextPrdrDSeq", [], "produce1");
  const maxSeq = rows?.[0]?.maxSeq ?? 0;
  const next = Number(maxSeq) + 1;

  const seq = String(next).padStart(3, "0");
  return `PRDR-D-${seq}`;
};

//작업시작 누르면 실행
const startWork = async ({ wko_code, line_eq_code, input_qtt }) => {
  if (!wko_code || !line_eq_code) throw new Error("필수값 누락");
  if (!input_qtt || Number(input_qtt) <= 0) throw new Error("투입량 오류");

  // wko 정보 가져오기 selectWipDetail 재사용
  const rows = await mysql.query("selectWipDetail", [wko_code], "produce1");
  const wko = rows?.[0];
  if (!wko) throw new Error("작업지시서를 찾을 수 없음");

  // prdr이 있으면 재사용
  let prdr_code = wko.prdr_code;
  if (!prdr_code) {
    prdr_code = await getNextPrdrCode();

    await mysql.query(
      "insertPrdrStart",
      [prdr_code, wko.prod_code, wko.wko_code, wko.wko_qtt],
      "produce1",
    );
  }

  const prdr_d_code = await getNextPrdrDCode();
  await mysql.query(
    "insertPrdrDStart",
    [prdr_d_code, prdr_code, Number(input_qtt), line_eq_code],
    "produce1",
  );

  return { ok: true, prdr_code, prdr_d_code };
};

//####어어어...
// 설비 카드 상태 조회
const getPrdrStatusByWko = async (wko_code) => {
  const rows = await mysql.query(
    "selectPrdrStatusByWko",
    [wko_code],
    "produce1",
  );
  return rows;
};

// 설비 작업 상세
const getPrdrDDetail = async (prdr_d_code) => {
  const rows = await mysql.query(
    "selectPrdrDDetail",
    [prdr_d_code],
    "produce1",
  );
  return rows.length ? rows[0] : null;
};

module.exports = {
  searchWorkOrders,
  findAllLinesDJ,
  findPrdpActive,
  findPrdpDetail,
  findAllPrdDistinct,
  updateWorkOrder,
  removeWorkOrder,
  saveWorkOrder,
  getWorkInProcessList,
  getWorkInProcessDetail,
  getEquipmentsByLine,
  getProcessesByWko,
  startWork,
  getPrdrStatusByWko,
  getPrdrDDetail,
};
