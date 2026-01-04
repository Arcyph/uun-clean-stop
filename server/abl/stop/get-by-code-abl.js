const ajv = require("../validation/ajv");
const StopDao = require("../../dao/stop-dao.js");

const dao = new StopDao();

const schema = {
    type: "object",
    properties: {
        code: { type: "string", minLength: 1 },
    },
    required: ["code"],
    additionalProperties: false,
};

function sendValidationError(res, params) {
    res.status(400).send({
        errorMessage: "validation of input failed",
        params,
        reason: ajv.errors,
    });
}

async function GetByCodeAbl(req, res) {
    try {
        const dto = req.query?.code ? req.query : req.body;

        if (!ajv.validate(schema, dto)) {
            sendValidationError(res, dto);
            return;
        }

        const code = Number(dto.code);
        if (!Number.isFinite(code)) {
            res.status(400).json({
                code: "invalidCode",
                message: "code must be a valid number",
            });
            return;
        }

        const stop = await dao.getByCode(code);

        if (!stop) {
            res.status(404).json({
                code: "stopNotFound",
                message: `stop with code ${code} does not exist`,
            });
            return;
        }

        res.json(stop);
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message ?? e);
    }
}

module.exports = GetByCodeAbl;
