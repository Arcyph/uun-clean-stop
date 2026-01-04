const ajv = require("../validation/ajv");
const ReportDao = require("../../dao/report-dao.js");
const StopDao = require("../../dao/stop-dao.js");

const reportDao = new ReportDao();
const stopDao = new StopDao();

const schema = {
    type: "object",
    properties: {
        id: { type: "string", minLength: 1 },
        stopId: { type: "string", minLength: 1 },

        status: { type: "string", enum: ["Přijato", "V řešení", "Vyřešeno", "Zamítnuto"] },
        damageType: { type: "string", enum: ["Graffiti", "Rozbité sklo", "Poškozený panel", "Nečistota"] },
        severity: { type: "string", enum: ["Nízká", "Střední", "Vysoká"] },

        description: { anyOf: [{ type: "string", maxLength: 5000 }, { type: "null" }] },
        photoUrl: { anyOf: [{ type: "string", maxLength: 2000 }, { type: "null" }] },
        trackingCode: { anyOf: [{ type: "string", maxLength: 50 }, { type: "null" }] },
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

        if (dto.stopId !== undefined) {
            const stop = await stopDao.get(dto.stopId);
            if (!stop) {
                res.status(400).json({
                    code: "stopDoesNotExist",
                    message: `stop with id ${dto.stopId} does not exist`,
                });
                return;
            }
        }

        let updated;
        try {
            updated = await reportDao.update(dto);
        } catch (e) {
            if (String(e.message || "").includes("does not exist")) {
                res.status(404).json({
                    code: "reportNotFound",
                    message: `report with id ${dto.id} does not exist`,
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
