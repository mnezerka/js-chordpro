// Returns an ElementTree-based DOM using output from tokenizer()'
export class Node {
    constructor() {
        this.children = [];
    }
}

export class NodeDoc {
    constructor() {
        this.body = []
        this.title = null
        this.subTitle = null
    }
}

export class NodeMeta extends Node { }
export class NodeHead extends Node { }
export class NodeBody extends Node { }
export class NodeComment extends Node { }
export class NodeChord extends Node {
    constructor(chord = null) {
        super();
        this.chord = chord
        this.text = '';
    }
}
export class NodeRow extends Node { }
export class NodeVerse extends Node { }
export class NodeChorus extends Node { }
export class NodeTab extends Node { }

var LineBegin = {type:'line-begin'};
var VerseBegin = {type:'verse-begin'};
var ChorusBegin = {type:'chorus-begin'};

function ltrim(str) {
    return str.replace(/^\s+/, '');
}

function arrayExtend(arr, otherArr) {
    // you should include a test to check whether other_array really is an array
    otherArr.forEach(function(v) {arr.push(v)}, arr);
}


// Test wether "o" is an Node
function isNode(o) {
    return o instanceof Node;
}

// Test wether "o" is an Comment'
function isComment(n) {
    return n instanceof NodeComment;
}

/*
Scan stack "s" for "t", pop and return between "t" and end of stack.
If item "t" is not found, then restore stack and return empty list.
*/
function popToObject(s, t) {
    //console.log('------------------------------');
    //console.log('pop to object enter stack:', s, ' look for:',  t);
    let result = [];
    if (s.length === 0) {
        return result;
    }

    let foundPos = null;
    for (let i = s.length - 1; i >= 0; i--) {
        if (s[i] === t) {
            foundPos = i;
            break;
        }
    }

    if (foundPos !== null) {
        result = s.splice(foundPos, s.length - foundPos);
        result.shift();
    }

    //console.log('pop to object leave stack:', s, ' result:', result);
    //console.log('------------------------------');

    return result; 
}

export function parse(tokens)
{
    let doc = new NodeDoc();

    let stack = [] // bottommost stack member is the meta dict
    //let stack = []; // bottommost stack member is the meta dict

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        let ttype = token[0];
        let tvalue = token[1];

        //console.log('-------------');
        //console.log('before', token, stack);

        switch (ttype) {
        case CHP_TOKEN_DIRECTIVE:
            directiveHandler(tokens, stack, doc, ttype, tvalue)
            break;
        case CHP_TOKEN_COMMENT:
            stack.push(new Node(Node.EL_TYPE_COMMENT, tvalue));
            break;
        case CHP_TOKEN_CHORD:
            // always maintain a chord:lyric pairing on the stack
            stack.push(new NodeChord(tvalue.trim()));
            stack[stack.length - 1].text = ''
            break;
        case CHP_TOKEN_LYRIC:
            // if a lyric appears before a chord, assume a blank chord
            tvalue = ltrim(tvalue);
            if (tvalue.length > 0) {
                if (!isNode(stack[stack.length - 1]) || !stack[stack.length - 1] instanceof NodeChord) {
                    stack.push(new NodeChord(''));
                }
                stack[stack.length - 1].text = stack[stack.length - 1].text + tvalue
            }
            break;
        case CHP_TOKEN_SOL:
            stack.push(LineBegin)
            break;
        case CHP_TOKEN_SOF:
            break;
        case CHP_TOKEN_EOL:
        case CHP_TOKEN_EOF:
            eolHandler(tokens, stack, doc, ttype, tvalue)
            break;
        default:
            throw new Error(`Unrecognized token ${ttype} (${tvalue}) at line xxx`);
        }
        //console.log('after', token, stack);
        //console.log('-------------');
    }

    return doc;
}

/*
Parser handler of end-of-line and end-of-file events

This is largely where elements are moved from the stack and put into
the document.
*/
function eolHandler(tokens, stack, doc) {

    //console.log('doc is ', doc);

    // get list of object on current line
    let line = popToObject(stack, LineBegin)

    if (line.length > 0) {
        let allComments = true;
        for (let i = 0; i < line.length; i++) {
            if (!isComment(line[i])) {
                allComments = false;
                break;
            }
        }
        //console.log('all comments', allComments);
        if (allComments) {
            // current line contains nothing but Comment objects
            arrayExtend(stack, line);
        } else {
            let r = new NodeRow();
            stack.push(r);
            arrayExtend(r.children, line);
        }
    } else {
        //  odds are we're currently parsing a blank line
        // - which is used to separate verse blocks

        // check if we are inside chorus
        let inChorus = false;
        for (let i = stack.length - 1; i >= 0; i --) {
            if (stack[i] === ChorusBegin) {
                inChorus = true;
                break
            }
        }

        // if we're in a chrous, stay in chorus mode
        // else, stop verse and start new verse
        if (!inChorus) {
            let verseItems = popToObject(stack, VerseBegin)

            if (verseItems.length > 0) {
                let v = new NodeVerse();
                doc.body.push(v);
                arrayExtend(v.children, verseItems);
                //console.log('after pushing node verse', JSON.stringify(doc));

            } else {
                // we're not in a verse, so move everything from the 
                // stack to the document
                arrayExtend(doc.body, stack);
            } 
            stack.push(VerseBegin)
        }
    }
}

// Parser handler for all directives'
function directiveHandler(tokens, stack, doc, ttype, tvalue) {
    let tag = tvalue;
    let arg = '';
    if (tvalue.indexOf(':') > 0) {
        tag = tvalue.substring(0, tvalue.indexOf(':')).trim();
        arg = tvalue.substring(tvalue.indexOf(':') + 1).trim();
    }

    tag = tag.toLowerCase();

    if (['t', 'title'].indexOf(tag) >= 0) {
        if (arg.length === 0) { throw new Error(`{${tag}} directive needs an argument`); }
        doc.title = arg;

    } else if (['st', 'subtitle'].indexOf(tag) >= 0) {
        if (arg.length === 0) { throw new Error(`{${tag}} directive needs an argument`); }
        doc.subTitle = arg;

    } else if (['artist'].indexOf(tag) >= 0) {
        if (arg.length === 0) { throw new Error(`{${tag}} directive needs an argument`); }
        doc.artist = arg;

    } else if (['c', 'comment'].indexOf(tag) >= 0) {
        if (arg.length === 0) { throw new Error(`{${tag}} directive needs an argument`); }
        let c = new NodeComment();
        c.text = arg;
        stack[1].push(c);

    } else if (['soc', 'start_of_chorus'].indexOf(tag) >= 0) {
        // close the current verse, if any, then start a chorus
        if (arg.length > 0) { throw new Error(`{${tag}} directive needs no argument (${arg})`); }
        popToObject(stack, LineBegin)
        let verse = popToObject(stack, VerseBegin)
        if (verse.length > 0) {
            let v = new NodeVerse();
            stack.push(v);
            arrayExtend(v.children, verse);
        }
        stack.push(ChorusBegin)

    } else if (['eoc', 'end_of_chorus'].indexOf(tag) >= 0) {
        // close the current chorus, but don't start a verse
        // - that's done after an sol token
        if (arg.length > 0) { throw new Error(`{${tag}} directive needs no argument (${arg})`); }
        popToObject(stack, LineBegin)
        let c = new NodeChorus();
        doc.body.push(c);
        let chorus = popToObject(stack, ChorusBegin)
        arrayExtend(c.children, chorus);

    } else if (tag === 'tab') {
        if (arg.length === 0) { throw new Error(`{${tag}} directive needs an argument`); }
        let t = new NodeTab();
        t.text = arg;
        doc.body.push(t);

    } else if (['np', 'new_page', 'npp', 'new_physical_page', 'ns', 'new_song', 'rowname'].indexOf(tag) >= 0) {

        // haven't implemented these yet, don't want them throwing errors either
        // ...they're basically just rendering hints anyway

    } else {
        /*
        TODO: do we need a catchall for {directive}?
        TODO: directives seen in other parsers:
        TODO: - textfont, textsize
        TODO: - chordfont, chordsize
        TODO: - ng, no_grid
        TODO: - g, grid
        */
        throw new Error(`Unimplemented directive ${tag}`)
    }
}


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
const CHP_TOKEN_DIRECTIVE = 'directive';
const CHP_TOKEN_COMMENT = 'comment';
const CHP_TOKEN_CHORD = 'chord';
const CHP_TOKEN_LYRIC = 'lyric';
const CHP_TOKEN_SOL = 'sol';
const CHP_TOKEN_EOL = 'eol';
const CHP_TOKEN_SOF = 'sof';
const CHP_TOKEN_EOF = 'eof';


export function tokenize(text) {

    var result = [];
    result.push([CHP_TOKEN_SOF]);

    var lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        result.push([CHP_TOKEN_SOL]);

        // check directive
        let pattern = /\s*{([^}]+)}|\[([^\]]+)\]|\s*#(.+)|([^[]+)/g;

        let m = null;
        while ((m = pattern.exec(line)) !== null) {

            if (m[1] !== undefined) {
                result.push([CHP_TOKEN_DIRECTIVE, m[1]]);
            }
            if (m[2] !== undefined) {
                result.push([CHP_TOKEN_CHORD, m[2]]);
            }
            if (m[3] !== undefined) {
                result.push([CHP_TOKEN_COMMENT, m[3]]);
            }
            if (m[4] !== undefined) {
                result.push([CHP_TOKEN_LYRIC, m[4]]);
            }

            // TODO:
            /*if ttype == 'directive' and tvalue in ('sot', 'start_of_tab'):
                tvalue = preformatted_tokenize(lines, r'^\s*\{(eot|end_of_tab)\}\s*$')
                tvalue = 'tab:' + ''.join([v[1] for v in tvalue])
            yield (lineno + 1, ttype, tvalue)
            */
        }

        result.push([CHP_TOKEN_EOL]);
    }

    result.push([CHP_TOKEN_EOF]);

    return result;
}

