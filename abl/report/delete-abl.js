const ajv = require("../validation/ajv");
const ReportDao = require("../../dao/report-dao.js");

const dao = new ReportDao();

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

async function DeleteAbl(req, res) {
    try {
        const dto = req.body;

        if (!ajv.validate(schema, dto)) {
            sendValidationError(res, dto);
            return;
        }

        const deleted = await dao.delete(dto.id);

        if (!deleted) {
            res.status(404).json({
                code: "reportNotFound",
                message: `report with id ${dto.id} does not exist`,
            });
            return;
        }

        res.json({});
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message ?? e);
    }
}

module.exports = DeleteAbl;
