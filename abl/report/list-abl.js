const ReportDao = require("../../dao/report-dao.js");

const dao = new ReportDao();

async function ListAbl(req, res) {
    try {
        const list = await dao.list();
        res.json(list);
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message ?? e);
    }
}

module.exports = ListAbl;
