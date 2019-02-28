/*
Splits bytes from infile into tokens for the parser.

Returns an iterator which delivers tokens in the tuple form:
    (line number, token type, token value)

There are currently 8 token types:
'directive': chordpro directives, found in {curly braces}; the token
    value will be the full text of the directive including the
    arguments, if any - also note that unparsed {tab} contents are
    returned as the argument to a {tab} directive
'chord': inline chord notation, found in [square brackets]
'comment': sh-style source-code comment, found between an octothorpe
    and the end of line - not to be confused with a sharp symbol,
    which is found in a chord token using the same character - also
    do not confuse this kind of comment with a chordpro-style
    {comment} directive, which is actually a text block
'lyric': just about any other kind of text
'sof', 'eof': start of file, end of file
'sol', 'eol': start of line, end of line
*/
module.exports.CHP_TOKEN_DIRECTIVE = 'directive';
module.exports.CHP_TOKEN_COMMENT = 'comment';
module.exports.CHP_TOKEN_CHORD = 'chord';
module.exports.CHP_TOKEN_LYRIC = 'lyric';
module.exports.CHP_TOKEN_TAB = 'tab';
module.exports.CHP_TOKEN_SOL = 'sol';
module.exports.CHP_TOKEN_EOL = 'eol';
module.exports.CHP_TOKEN_SOF = 'sof';
module.exports.CHP_TOKEN_EOF = 'eof';

module.exports.tokenize = function (text) {

    var result = [];
    result.push([module.exports.CHP_TOKEN_SOF]);

    let preformattedBuffer = '';
    let preformattedActive = false;

    // split text to lines and go through content
    // line by line
    var lines = text.split('\n');
    var i = 0;
    while (i < lines.length) {
        let line = lines[i].trim();
        result.push([module.exports.CHP_TOKEN_SOL]);

        // check if current line represents "directive", "chord", "comment" or "text"
        let pattern = /\s*{([^}]+)}|\[([^\]]+)\]|\s*#(.+)|([^[]+)/g;
        let m = null;
        while ((m = pattern.exec(line)) !== null) {

            // directive
            if (m[1] !== undefined) {

                // if directive represents tabulature
                if (['sot', 'start_of_tab'].indexOf(m[1]) != -1) {
                    // read lines until end of tab is found, we need
                    // to read whole tab block without looking for any
                    // other tokens here
                    var patternEnd = /\s*{eot}|\s*{end_of_tab}/g;
                    var tab = []
                    i++; // skip line with opening directive
                    while (i < lines.length) {
                        let line = lines[i].trim();
                        if (patternEnd.test(line)) {
                            break;
                        }
                        tab.push(line)
                        i++
                    }
                    // we send tab token also in case we reach end
                    // of file without successfully identification
                    // of closing directive
                    result.push([module.exports.CHP_TOKEN_TAB, tab]);
                } else {
                    result.push([module.exports.CHP_TOKEN_DIRECTIVE, m[1]]);
                }
            }
            // chord
            if (m[2] !== undefined) {
                result.push([module.exports.CHP_TOKEN_CHORD, m[2]]);
            }

            // comment
            if (m[3] !== undefined) {
                result.push([module.exports.CHP_TOKEN_COMMENT, m[3]]);
            }

            // text
            if (m[4] !== undefined) {
                result.push([module.exports.CHP_TOKEN_LYRIC, m[4]]);
            }

            //if ttype == 'directive' and tvalue in ('sot', 'start_of_tab'):
            //    tvalue = preformatted_tokenize(lines, r'^\s*\{(eot|end_of_tab)\}\s*$')
            //    tvalue = 'tab:' + ''.join([v[1] for v in tvalue])
            //yield (lineno + 1, ttype, tvalue)
        }

        result.push([module.exports.CHP_TOKEN_EOL]);
        i++;
    }

    result.push([module.exports.CHP_TOKEN_EOF]);

    return result;
}
