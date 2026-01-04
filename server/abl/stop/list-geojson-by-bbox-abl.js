const ajv = require("../validation/ajv");
const StopDao = require("../../dao/stop-dao.js");

const dao = new StopDao();

const schema = {
    type: "object",
    properties: {
        bbox: { type: "string", minLength: 1 },
    },
    required: ["bbox"],
    additionalProperties: false,
};

function sendValidationError(res, params) {
    res.status(400).send({
        errorMessage: "validation of input failed",
        params,
        reason: ajv.errors,
    });
}

function parseBbox(bboxStr) {
    const parts = String(bboxStr).split(",");
    if (parts.length !== 4) return null;

    const nums = parts.map((p) => Number(String(p).trim()));
    if (!nums.every(Number.isFinite)) return null;

    return nums;
}

async function ListGeoJsonByBboxAbl(req, res) {
    try {
        const dto = req.query;

        if (!ajv.validate(schema, dto)) {
            sendValidationError(res, dto);
            return;
        }

        const bbox = parseBbox(dto.bbox);
        if (!bbox) {
            res.status(400).json({
                code: "invalidBbox",
                message: "bbox must be 'minLon,minLat,maxLon,maxLat' with finite numbers",
            });
            return;
        }

        const geojson = await dao.listGeoJsonByBbox(bbox);
        res.json(geojson);
    } catch (e) {
        console.log(e);

        if (String(e.message || "").includes("bbox must be")) {
            res.status(400).json({
                code: "invalidBbox",
                message: e.message,
            });
            return;
        }

        res.status(500).send(e.message ?? e);
    }
}

module.exports = ListGeoJsonByBboxAbl;
