// 순수 기능에 대한 정의 => 함수(function)
const mysql = require("../database/mapper.js");

// 게시글 전체 목록
const findAll = async () => {
  let list = await mysql.query("selectAll");
  return list;
};

// 게시글 단건 정보 : selectById, 필수값(숫자, 1개) => board_id
const findByBoardId = async (boardId) => {
  let info = (await mysql.query("selectById", boardId))[0];
  return info; // 반드시 단건으로 반환
};

// 게시글 단건 등록 : insertInfo, 필요값 (title, content, author) => 필수값 title
const addInfo = async (boardInfo) => {
  let { title, content, author } = boardInfo;
  if (title == null || title == undefined) {
    return { status: "error", message: "title not found" };
  }
  let result = await mysql.query("insertInfo", [title, content, author]);
  let resObj = {};
  if (result.insertId > 0) {
    resObj = { status: "success", boardId: result.insertId };
  } else {
    resObj = { status: "fail" };
  }
  return resObj;
};

// 게시글 단건 수정 : updateInfo, 수정가능 (title, content, author)
const modifyInfo = async (boardId, boardInfo) => {
  let { title, content, author } = boardInfo;
  let result = await mysql.query("updateInfo", [
    title,
    content,
    author,
    boardId,
  ]);
  let resObj = {};
  if (result.affectedRows > 0) {
    resObj = { status: "success", boardId: boardId };
  } else {
    resObj = { status: "fail" };
  }
  return resObj;
};

// 게시글 단건 삭제 : delInfo, 필요값(boardId)
const removeInfo = async (boardId) => {
  let result = await mysql.query("delInfo", boardId);
  let resObj = {};
  if (result.affectedRows > 0) {
    resObj = { status: "success", boardId: boardId };
  } else {
    resObj = { status: "fail" };
  }
  return resObj;
};
module.exports = {
  findAll,
  findByBoardId,
  addInfo,
  modifyInfo,
  removeInfo,
};
