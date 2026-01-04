const ajv = require("../validation/ajv");
const ReportDao = require("../../dao/report-dao.js");
const StopDao = require("../../dao/stop-dao.js");

const reportDao = new ReportDao();
const stopDao = new StopDao();

const schema = {
    type: "object",
    properties: {
        stopId: { type: "string", minLength: 1 },

        status: { type: "string", enum: ["Přijato", "V řešení", "Vyřešeno", "Zamítnuto"] },
        damageType: { type: "string", enum: ["Graffiti", "Rozbité sklo", "Poškozený panel", "Nečistota"] },
        severity: { type: "string", enum: ["Nízká", "Střední", "Vysoká"] },

        description: { anyOf: [{ type: "string", maxLength: 5000 }, { type: "null" }] },
        photoUrl: { anyOf: [{ type: "string", maxLength: 2000 }, { type: "null" }] },
    },
    required: ["stopId", "status", "damageType", "severity"],
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
        const dto = req.body;

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

        const created = await reportDao.create(dto);
        res.json(created);
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message ?? e);
    }
}

module.exports = CreateAbl;
