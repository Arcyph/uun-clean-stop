const Ajv = require("ajv");
const addFormats = require("ajv-formats").default;

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

module.exports = ajv;
