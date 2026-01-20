const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
  console.log("Server start");
  console.log(`http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("Wellcome! Rest Server!");
});

const produceRouter = require("./routers/produceRouter1.js");
const materialRouter = require("./routers/materialRouter1.js");
const qualityRouter = require("./routers/qualityRouter1.js");
const orderRouter = require("./routers/orderRouter1.js");
const produceRouter2 = require("./routers/produceRouter2.js");
const materialRouter2 = require("./routers/materialRouter2.js");
const qualityRouter2 = require("./routers/qualityRouter2.js");
const orderRouter2 = require("./routers/orderRouter2.js");
app.use("/api", produceRouter); // 생산
app.use("/api", materialRouter); // 자재
app.use("/api", qualityRouter); // 품질
app.use("/api", orderRouter); // 주문
app.use("/api", produceRouter2); // 생산
app.use("/api", materialRouter2); // 자재
app.use("/api", qualityRouter2); // 품질
app.use("/api", orderRouter2); // 주문
