var chordpro = require('./chordpro');
var tokenizer = require('./tokenizer');

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

// Test wether "item" is an Node
function isNode(item) {
    return item.type === 'node';
}

// Test wether "item" is an Comment'
function isComment(item) {
    return item instanceof chordpro.NodeComment;
}

/*
Scan stack "s" for "t", pop and return between "t" and end of stack.
If item "t" is not found, then restore stack and return empty list.
*/
function popToObject(s, t) {
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

    return result;
}

module.exports.parse = function (tokens) {
    let doc = new chordpro.NodeDoc();

    let stack = [] // bottommost stack member is the meta dict

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        let ttype = token[0];
        let tvalue = token[1];

        switch (ttype) {
        case tokenizer.CHP_TOKEN_DIRECTIVE:
            directiveHandler(tokens, stack, doc, ttype, tvalue)
            break;
        case tokenizer.CHP_TOKEN_COMMENT:
            stack.push(new chordpro.Node(Node.EL_TYPE_COMMENT, tvalue));
            break;
        case tokenizer.CHP_TOKEN_CHORD:
            // always maintain a chord:lyric pairing on the stack
            stack.push(new chordpro.NodeChord(tvalue.trim()));
            stack[stack.length - 1].text = ''
            break;
        case tokenizer.CHP_TOKEN_LYRIC:
            // if a lyric appears before a chord, assume a blank chord
            tvalue = ltrim(tvalue);
            if (tvalue.length > 0) {
                if (!isNode(stack[stack.length - 1]) || !stack[stack.length - 1] instanceof chordpro.NodeChord) {
                    stack.push(new chordpro.NodeChord(''));
                }
                stack[stack.length - 1].text = stack[stack.length - 1].text + tvalue
            }
            break;
        case tokenizer.CHP_TOKEN_SOL:
            stack.push(LineBegin)
            break;
        case tokenizer.CHP_TOKEN_SOF:
            break;
        case tokenizer.CHP_TOKEN_EOL:
        case tokenizer.CHP_TOKEN_EOF:
            eolHandler(tokens, stack, doc, ttype, tvalue)
            break;
        default:
            throw new Error(`Unrecognized token ${ttype} (${tvalue}) at line xxx`);
        }
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
            let r = new chordpro.NodeRow();
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
                let v = new chordpro.NodeVerse();
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
        let c = new chordpro.NodeComment();
        c.text = arg;
        stack.push(c);

    } else if (['soc', 'start_of_chorus'].indexOf(tag) >= 0) {
        // close the current verse, if any, then start a chorus
        if (arg.length > 0) { throw new Error(`{${tag}} directive needs no argument (${arg})`); }
        popToObject(stack, LineBegin)
        let verse = popToObject(stack, VerseBegin)
        if (verse.length > 0) {
            let v = new chordpro.NodeVerse();
            stack.push(v);
            arrayExtend(v.children, verse);
        }
        stack.push(ChorusBegin)

    } else if (['eoc', 'end_of_chorus'].indexOf(tag) >= 0) {
        // close the current chorus, but don't start a verse
        // - that's done after an sol token
        if (arg.length > 0) { throw new Error(`{${tag}} directive needs no argument (${arg})`); }
        popToObject(stack, LineBegin)
        let c = new chordpro.NodeChorus();
        doc.body.push(c);
        let chorus = popToObject(stack, ChorusBegin)
        arrayExtend(c.children, chorus);

    } else if (tag === 'tab') {
        if (arg.length === 0) { throw new Error(`{${tag}} directive needs an argument`); }
        let t = new chordpro.NodeTab();
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
