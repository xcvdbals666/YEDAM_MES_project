const mysql = require("mysql2/promise");
const produceSql1 = require("./sqls/produce1.js");
const materialSql1 = require("./sqls/material1.js");
const qualitySql1 = require("./sqls/quality1.js");
const orderSql1 = require("./sqls/order1.js");
const produceSql2 = require("./sqls/produce2.js");
const materialSql2 = require("./sqls/material2.js");
const qualitySql2 = require("./sqls/quality2.js");
const orderSql2 = require("./sqls/order2.js");
require("dotenv").config();

const sqlList = {
  produce1: { ...produceSql1 },
  material1: { ...materialSql1 },
  quality1: { ...qualitySql1 },
  order1: { ...orderSql1 },
  produce2: { ...produceSql2 },
  material2: { ...materialSql2 },
  quality2: { ...qualitySql2 },
  order2: { ...orderSql2 },
};

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

const query = async (selected, values, type) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let executeSql = "";
    // type으로 사용할 메인 테이블 구분해서 쿼리문 접근
    executeSql = sqlList[type][selected];
    console.info(selected, executeSql);
    let result = (await conn.query(executeSql, values))[0];
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

//검색용 보조쿼리 추가
const rquery = async (sql, values = []) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(sql, values);
    return rows;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  query,
  rquery,
};
