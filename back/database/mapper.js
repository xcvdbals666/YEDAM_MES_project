const mysql = require("mysql2/promise");
const produce = require("./sqls/produce.js");
const material = require("./sqls/material.js");
const quality = require("./sqls/quality.js");
const order = require("./sqls/order.js");
const pool = mysql.createPool({
  host: `localhost`,
  user: `dev01`,
  password: `dev01`,
  database: `dev`,
  connectionLimit: 5,
});

// 생산
const produceQuery = async (selected, values) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let exeuteSql = produce[selected];
    let result = (await conn.query(exeuteSql, values))[0];
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 생산
const materialQuery = async (selected, values) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let exeuteSql = material[selected];
    let result = (await conn.query(exeuteSql, values))[0];
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 생산
const qualityQuery = async (selected, values) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let exeuteSql = quality[selected];
    let result = (await conn.query(exeuteSql, values))[0];
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 생산
const orderQuery = async (selected, values) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let exeuteSql = order[selected];
    let result = (await conn.query(exeuteSql, values))[0];
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { produceQuery, materialQuery, qualityQuery, orderQuery };
