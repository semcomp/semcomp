const removeAccents = require("remove-accents");

module.exports.normalizeString = (str) =>
  removeAccents(str.toLowerCase().trim());
