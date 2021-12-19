// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo")

let lexer = moo.compile({
        // check directive
    title: { match: /(?:{title:.*?}|{t:.*?})/, value: s => (s.slice(1, -1).split(":"))[1].trim()},
    subtitle: { match: /(?:{subtitle:.*?}|{st:.*?})/, value: s => (s.slice(1, -1).split(":"))[1].trim()},
    artist: { match: /{artist:.*?}/, value: s => (s.slice(1, -1).split(":"))[1].trim()},
    chord: { match: /\[.+?\]/, value: s  => s.slice(1, -1) },
    nl: { match: /\n/, lineBreaks: true },
    soc: /(?:{soc}|{start_of_chorus})/,
    eoc: /(?:{eoc}|{end_of_chorus})/,
    text: /[^[\n]+/,
})

let tree = []

function process_chordpro(v) {
    var result = {
        type: "chordpro",
        header: [],
        content: []
    }

    result.header = v[0]
    result.content = v[1]

    return result;
}

function process_content(v) {
    var result = {
        type: "content",
        parts: []
    }

    for (let i = 0; i < v[0].length; i++) {
        result.parts.push(v[0][i][0])    
    }

    return result;
}

function process_verse(v) {
    var result = {
        type: "verse",
        lines: []
    }

    for (let i = 0; i < v[0].length; i++) {
        result.lines.push(v[0][i])
    }

    return result;
}

function process_chorus(v) {
    var result = {
        type: "chorus",
        lines: []
    }

    for (let i = 0; i < v[2].length; i++) {
        result.lines.push(v[2][i])
    }

    return result;
}

function proces_line(v) {

    var result = {
        type: "row",
        children: []
    }

    // v0 is list of chord and text matches
    // v1 is new line

    for (let i = 0; i < v[0].length; i++) {
        let line_token = v[0][i][0];
        result.children.push({
            type: line_token.type,
            value: line_token.value,
        })
    }

    return result 
}

function process_title(v) {
    return v[0].value;
}

function process_subtitle(v) {
    return v[0].value;
}

function process_artist(v) {
    return v[0].value;
}

function process_header(v) {
    let result = {
        title: v[0],
        subtitle: v[1],
        artist: v[2]
    }
    return result;
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "chordpro", "symbols": ["header", "content"], "postprocess": process_chordpro},
    {"name": "header$ebnf$1", "symbols": []},
    {"name": "header$ebnf$1", "symbols": ["header$ebnf$1", (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "header", "symbols": ["title", "subtitle", "artist", "header$ebnf$1"], "postprocess": process_header},
    {"name": "title", "symbols": []},
    {"name": "title", "symbols": [(lexer.has("title") ? {type: "title"} : title), (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": process_title},
    {"name": "subtitle", "symbols": []},
    {"name": "subtitle", "symbols": [(lexer.has("subtitle") ? {type: "subtitle"} : subtitle), (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": process_subtitle},
    {"name": "artist", "symbols": []},
    {"name": "artist", "symbols": [(lexer.has("artist") ? {type: "artist"} : artist), (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": process_artist},
    {"name": "content$ebnf$1", "symbols": []},
    {"name": "content$ebnf$1$subexpression$1", "symbols": ["verse"]},
    {"name": "content$ebnf$1$subexpression$1", "symbols": ["chorus"]},
    {"name": "content$ebnf$1", "symbols": ["content$ebnf$1", "content$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "content", "symbols": ["content$ebnf$1"], "postprocess": process_content},
    {"name": "verse$ebnf$1", "symbols": ["line"]},
    {"name": "verse$ebnf$1", "symbols": ["verse$ebnf$1", "line"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "verse$ebnf$2", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)]},
    {"name": "verse$ebnf$2", "symbols": ["verse$ebnf$2", (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "verse", "symbols": ["verse$ebnf$1", "verse$ebnf$2"], "postprocess": process_verse},
    {"name": "chorus$ebnf$1", "symbols": ["line"]},
    {"name": "chorus$ebnf$1", "symbols": ["chorus$ebnf$1", "line"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "chorus$ebnf$2", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)]},
    {"name": "chorus$ebnf$2", "symbols": ["chorus$ebnf$2", (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "chorus", "symbols": [(lexer.has("soc") ? {type: "soc"} : soc), (lexer.has("nl") ? {type: "nl"} : nl), "chorus$ebnf$1", (lexer.has("eoc") ? {type: "eoc"} : eoc), "chorus$ebnf$2"], "postprocess": process_chorus},
    {"name": "line$ebnf$1$subexpression$1", "symbols": [(lexer.has("chord") ? {type: "chord"} : chord)]},
    {"name": "line$ebnf$1$subexpression$1", "symbols": [(lexer.has("text") ? {type: "text"} : text)]},
    {"name": "line$ebnf$1", "symbols": ["line$ebnf$1$subexpression$1"]},
    {"name": "line$ebnf$1$subexpression$2", "symbols": [(lexer.has("chord") ? {type: "chord"} : chord)]},
    {"name": "line$ebnf$1$subexpression$2", "symbols": [(lexer.has("text") ? {type: "text"} : text)]},
    {"name": "line$ebnf$1", "symbols": ["line$ebnf$1", "line$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "line", "symbols": ["line$ebnf$1", (lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": proces_line}
]
  , ParserStart: "chordpro"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
