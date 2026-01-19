// Express 기반의 서버를 실행하는 진입파일
const express = require("express");
const app = express();
const port = 3000;
// 미들웨어 등록 => Express에서 사용하는 보조기능
// HTTP Request, Response를 다룰 수 있는 함수

// body parser : HTTP 객체의 Body에서 데이터를 읽고 쓰는 경우 사용

// application/JSON
app.use(express.json());

// application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// 서버 실행 코드
app.listen(port, () => {
  console.log("Server start");
  console.log(`http://localhost:${port}`);
});

// 라우팅 등록
app.get("/", (req, res) => {
  res.send("Wellcome! Rest Server!");
});

// 게시글 라우터 모듈
const boardRouter = require("./routers/boardRouter.js");
app.use(`/`, boardRouter);
