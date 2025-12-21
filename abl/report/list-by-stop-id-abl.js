const ajv = require("../validation/ajv");
const ReportDao = require("../../dao/report-dao.js");
const StopDao = require("../../dao/stop-dao.js");

const reportDao = new ReportDao();
const stopDao = new StopDao();

const schema = {
    type: "object",
    properties: {
        stopId: { type: "string", minLength: 1 },
    },
    required: ["stopId"],
    additionalProperties: false,
};

function sendValidationError(res, params) {
    res.status(400).send({
        errorMessage: "validation of input failed",
        params,
        reason: ajv.errors,
    });
}

async function ListByStopIdAbl(req, res) {
    try {
        const dto = req.query?.stopId ? req.query : req.body;

        if (!ajv.validate(schema, dto)) {
            sendValidationError(res, dto);
            return;
        }

        const stop = await stopDao.get(dto.stopId);
        if (!stop) {
            res.status(400).json({
                code: "stopDoesNotExist",
                message: `stop with id ${dto.stopId} does not exist`,
            });
            return;
        }

        const list = await reportDao.listByStopId(dto.stopId);
        res.json(list);
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message ?? e);
    }
}

module.exports = ListByStopIdAbl;
