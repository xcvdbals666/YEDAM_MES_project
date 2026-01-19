const mysql = require("mysql2/promise");
const produceSql = require("./sqls/produce.js");
const materialSql = require("./sqls/material.js");
const qualitySql = require("./sqls/quality.js");
const orderSql = require("./sqls/order.js");
require("dotenv").config();

const sqlList = {
  produce: { ...produceSql },
  material: { ...materialSql },
  quality: { ...qualitySql },
  order: { ...orderSql },
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
