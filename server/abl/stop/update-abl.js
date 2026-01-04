const ajv = require("../validation/ajv");
const StopDao = require("../../dao/stop-dao.js");

const dao = new StopDao();

const schema = {
    type: "object",
    properties: {
        id: { type: "string", minLength: 1 },
        code: { type: "integer" },
        name: { type: "string", maxLength: 200 },
        latitude: { type: "number", minimum: -90, maximum: 90 },
        longitude: { type: "number", minimum: -180, maximum: 180 },
        note: { anyOf: [{ type: "string", maxLength: 2000 }, { type: "null" }] },
    },
    required: ["id"],
    additionalProperties: false,
};

function sendValidationError(res, params) {
    res.status(400).send({
        errorMessage: "validation of input failed",
        params,
        reason: ajv.errors,
    });
}

async function UpdateAbl(req, res) {
    try {
        const dto = req.body;

        if (!ajv.validate(schema, dto)) {
            sendValidationError(res, dto);
            return;
        }

        if (dto.latitude !== undefined && !Number.isFinite(Number(dto.latitude))) {
            res.status(400).json({
                code: "invalidLatitude",
                message: "latitude must be a valid number",
            });
            return;
        }

        if (dto.longitude !== undefined && !Number.isFinite(Number(dto.longitude))) {
            res.status(400).json({
                code: "invalidLongitude",
                message: "longitude must be a valid number",
            });
            return;
        }

        let updated;
        try {
            updated = await dao.update(dto);
        } catch (e) {
            if (String(e.message || "").includes("does not exist")) {
                res.status(404).json({
                    code: "stopNotFound",
                    message: `stop with id ${dto.id} does not exist`,
                });
                return;
            }
            throw e;
        }

        res.json(updated);
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message ?? e);
    }
}

module.exports = UpdateAbl;
