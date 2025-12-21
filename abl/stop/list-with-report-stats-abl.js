const StopDao = require("../../dao/stop-dao.js");
const ReportDao = require("../../dao/report-dao.js");

const stopDao = new StopDao();
const reportDao = new ReportDao();

async function ListWithReportStatsAbl(req, res) {
    try {
        const stops = await stopDao.list();
        const reports = await reportDao.list();

        const activeStatuses = new Set(["Vyřešeno", "Přijato"]);
        const countsByStopId = new Map();

        for (const r of reports) {
            const stopId = r.stopId;
            if (!stopId) continue;

            let c = countsByStopId.get(stopId);
            if (!c) {
                c = { total: 0, active: 0 };
                countsByStopId.set(stopId, c);
            }

            c.total++;

            if (activeStatuses.has(r.status)) {
                c.active++;
            }
        }

        const result = [];
        for (const s of stops) {
            const c = countsByStopId.get(s.id) || { total: 0, active: 0 };

            result.push({
                stop: s,
                stopName: s.name,
                activeReports: c.active,
                totalReports: c.total,
            });
        }

        res.json(result);
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message ?? e);
    }
}

module.exports = ListWithReportStatsAbl;
