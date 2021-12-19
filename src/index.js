const Parser = require("./parser.js");
const FormatterAscii = require("./formatter_ascii.js");
const FormatterHtml = require("./formatter_html.js");

module.exports.parse = Parser.parse;
module.exports.to_ascii = FormatterAscii.process_song;
module.exports.to_html = FormatterHtml.process_song;