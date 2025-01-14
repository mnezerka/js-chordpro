const Grammar = require('./grammar.js')
const FormatterAscii = require("./formatterAscii.js");
const FormatterHtml = require("./formatterHtml.js");

module.exports.parse = Grammar.parse;
module.exports.to_ascii = FormatterAscii.processSong;
module.exports.to_html = FormatterHtml.processSong;
