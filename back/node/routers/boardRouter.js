// 라우터 모듈 => 스스로 서버를 실행할 수 없음
const express = require("express");
const router = express.Router();
// route : 사용자가 정해진 엔드포인트(URI+METHOD)
//         에 접속할 경우 어떤 서비스를
//         어떤 형태로 제공할 건지 정의하는 것
const boardService = require("../services/boardService.js");
// 게시글 전체조회 : boards + GET
router.get(`/boards`, async (req, res) => {
  // 해당 경로로 접속했을 때 제공하는 서비스
  // : 게시글의 전체 목록
  let list = await boardService.findAll();
  res.send(list);
});

// 게시글 단건조회 : boards/:bno + GET  ex) boards/100, boards/130
router.get(`/boards/:bno`, async (req, res) => {
  const bId = req.params.bno;
  let info = await boardService.findByBoardId(bId);
  res.send(info);
});

// 게시글 단건등록 : boards + POST
router.post(`/boards`, async (req, res) => {
  const info = req.body;
  let result = await boardService.addInfo(info);
  res.send(result);
});

// 게시글 단건수정 : boards/:bno + PUT
router.put(`/boards/:bno`, async (req, res) => {
  const bId = req.params.bno;
  const info = req.body;
  let result = await boardService.modifyInfo(bId, info);
  res.send(result);
});
// 게시글 단건삭제 : boards/:bno + DELETE
router.delete(`/boards/:bno`, async (req, res) => {
  const bId = req.params.bno;
  let result = await boardService.removeInfo(bId);
  res.send(result);
});

module.exports = router; // 파일의 마지막 코드
