const ajv = require("../validation/ajv");
const ReportDao = require("../../dao/report-dao.js");

const dao = new ReportDao();

const schema = {
    type: "object",
    properties: {
        trackingCode: { type: "string", minLength: 1 },
    },
    required: ["trackingCode"],
    additionalProperties: false,
};

function sendValidationError(res, params) {
    res.status(400).send({
        errorMessage: "validation of input failed",
        params,
        reason: ajv.errors,
    });
}

async function GetByTrackingCodeAbl(req, res) {
    try {
        const dto = req.query?.trackingCode ? req.query : req.body;

        if (!ajv.validate(schema, dto)) {
            sendValidationError(res, dto);
            return;
        }

        const report = await dao.getByTrackingCode(dto.trackingCode);

        if (!report) {
            res.status(404).json({
                code: "reportNotFound",
                message: `report with trackingCode ${dto.trackingCode} does not exist`,
            });
            return;
        }

        res.json(report);
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message ?? e);
    }
}

module.exports = GetByTrackingCodeAbl;
