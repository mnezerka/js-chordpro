@{%
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

%}

# Pass your lexer object using the @lexer option:
@lexer lexer

# rules
chordpro -> header content {% process_chordpro %}

header -> title subtitle artist %nl:* {% process_header %}

title -> null | %title %nl {% process_title %}

subtitle -> null | %subtitle %nl {% process_subtitle %}

artist -> null | %artist %nl {% process_artist %}

content -> (verse | chorus ):* {% process_content %}

verse -> line:+ %nl:+ {% process_verse %} 

chorus -> %soc %nl line:+ %eoc %nl:+ {% process_chorus %}

line -> (%chord | %text):+ %nl {% proces_line %}