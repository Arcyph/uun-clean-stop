const ajv = require("../validation/ajv");
const StopDao = require("../../dao/stop-dao.js");

const dao = new StopDao();

const schema = {
    type: "object",
    properties: {
        id: { type: "string", minLength: 1 },
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

async function GetAbl(req, res) {
    try {
        const dto = req.query?.id ? req.query : req.body;

        if (!ajv.validate(schema, dto)) {
            sendValidationError(res, dto);
            return;
        }

        const stopId = dto.id;
        const stop = await dao.get(stopId);

        if (!stop) {
            res.status(404).json({
                code: "stopNotFound",
                message: `stop with id ${stopId} does not exist`,
            });
            return;
        }

        res.json(stop);
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message ?? e);
    }
}

module.exports = GetAbl;
