const express = require("express");
const router = express.Router();

const CreateAbl = require("../abl/stop/create-abl");
const GetAbl = require("../abl/stop/get-abl");
const GetByCodeAbl = require("../abl/stop/get-by-code-abl");
const ListAbl = require("../abl/stop/list-abl");
const ListWithReportStatsAbl = require("../abl/stop/list-with-report-stats-abl");
const ListGeoJsonByBboxAbl = require("../abl/stop/list-geojson-by-bbox-abl");
const UpdateAbl = require("../abl/stop/update-abl");
const DeleteAbl = require("../abl/stop/delete-abl");

router.post("/create", async (req, res) => {
    await CreateAbl(req, res);
});

router.get("/get", async (req, res) => {
    await GetAbl(req, res);
});

router.get("/getByCode", async (req, res) => {
  await GetByCodeAbl(req, res);
});

router.post("/update", async (req, res) => {
    await UpdateAbl(req, res);
});

router.get("/list", async (req, res) => {
    await ListAbl(req, res);
});

router.get("/listWithReportStats", async (req, res) => {
  await ListWithReportStatsAbl(req, res);
});

router.get("/geojsonByBbox", async (req, res) => {
    await ListGeoJsonByBboxAbl(req, res);
});

router.post("/delete", async (req, res) => {
    await DeleteAbl(req, res);
});

module.exports = router;
