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

const produceRouter = require("./routers/produceRouter.js");
const materialRouter = require("./routers/materialRouter.js");
const qualityRouter = require("./routers/qualityRouter.js");
const orderRouter = require("./routers/orderRouter.js");
app.use("/produce", produceRouter); // 생산
app.use("/material", materialRouter); // 자재
app.use("/quality", qualityRouter); // 품질
app.use("/order", orderRouter); // 주문
