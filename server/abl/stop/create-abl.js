const ajv = require("../validation/ajv");
const StopDao = require("../../dao/stop-dao.js");

const dao = new StopDao();

const schema = {
    type: "object",
    properties: {
        code: { type: "integer" },
        name: { type: "string", maxLength: 200 },
        latitude: { type: "number", minimum: -90, maximum: 90 },
        longitude: { type: "number", minimum: -180, maximum: 180 },
        note: { anyOf: [{ type: "string", maxLength: 2000 }, { type: "null" }] },
    },
    required: ["code", "name", "latitude", "longitude"],
    additionalProperties: false,
};

function sendValidationError(res, params) {
    res.status(400).send({
        errorMessage: "validation of input failed",
        params,
        reason: ajv.errors,
    });
}

async function CreateAbl(req, res) {
    try {
        const stop = req.body;

        if (!ajv.validate(schema, stop)) {
            sendValidationError(res, stop);
            return;
        }

        const lat = Number(stop.latitude);
        const lon = Number(stop.longitude);

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            res.status(400).json({
                code: "invalidCoordinates",
                message: "latitude and longitude must be valid numbers",
            });
            return;
        }

        const created = await dao.create(stop);
        res.json(created);
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message ?? e);
    }
}

module.exports = CreateAbl;
