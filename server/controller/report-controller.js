const express = require("express");
const router = express.Router();

const CreateAbl = require("../abl/report/create-abl");
const GetAbl = require("../abl/report/get-abl");
const GetByTrackingCodeAbl = require("../abl/report/get-by-tracking-code-abl");
const ListAbl = require("../abl/report/list-abl");
const ListByStopIdAbl = require("../abl/report/list-by-stop-id-abl");
const UpdateAbl = require("../abl/report/update-abl");
const DeleteAbl = require("../abl/report/delete-abl");

router.post("/create", async (req, res) => {
    await CreateAbl(req, res);
});

router.get("/get", async (req, res) => {
    await GetAbl(req, res);
});

router.get("/getByTrackingCode", async (req, res) => {
    await GetByTrackingCodeAbl(req, res);
});

router.post("/update", async (req, res) => {
    await UpdateAbl(req, res);
});

router.get("/list", async (req, res) => {
    await ListAbl(req, res);
});

router.get("/listByStopId", async (req, res) => {
    await ListByStopIdAbl(req, res);
});

router.post("/delete", async (req, res) => {
    await DeleteAbl(req, res);
});

module.exports = router;
