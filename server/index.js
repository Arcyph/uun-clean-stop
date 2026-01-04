"use strict";
const express = require("express");

const stopController = require("./controller/stop-controller");
const reportController = require("./controller/report-controller");

const app = express();

app.use(express.json({ limit: "10mb" }));

app.get("/ping", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/stop", stopController);
app.use("/report", reportController);

app.use((req, res) => {
  res.status(404).json({
    code: "notFound",
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    code: "internalError",
    message: err?.message ?? "Internal server error",
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
