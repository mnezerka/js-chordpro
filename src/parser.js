var chordpro = require('./chordpro');
var tokenizer = require('./tokenizer');

var LineBegin = {type:'line-begin'};
var VerseBegin = {type:'verse-begin'};
var ChorusBegin = {type:'chorus-begin'};

function ltrim(str) {
    return str.replace(/^\s+/, '');
}

function array_extend(arr, otherArr) {
    // you should include a test to check whether other_array really is an array
    otherArr.forEach(function(v) {arr.push(v)}, arr);
}

// Test wether "item" is an Node
function is_node(item) {
    return item.type === 'node';
}

// Test wether "item" is an Comment'
function is_comment(item) {
    return item instanceof chordpro.NodeComment;
}

function find_backward(stack, item) {
    let exists = false;
    for (let i = stack.length - 1; i >= 0; i --) {
        if (stack[i] === item) {
            exists = true;
            break
        }
    }

    return exists;
}

function verify_tag_argument(tag, arg, required) {
    if (required) {
        if (arg.length === 0) {
            throw new Error(`{${tag}} directive expects argument`);
        }
    } else {
        if (arg.length > 0) {
            throw new Error(`{${tag}} directive does not expect any argument`);
        }
    }
}

function dump_stack(stack) {

    r = "";

    r += `stack (${stack.length} items)`;
    for (let i = 0; i < stack.length; i++) {
        r += `\n  item ${i} `
        if (stack[i].type == 'node') {
            r += `${stack[i].type}.${stack[i].constructor.name}`;
        } else {
            r += `${stack[i].type}`;

        }
    }
    return r;
}

/*
Scan stack "stack" for "t", pop and return between "t" and end of stack.
If item "t" is not found, then restore stack and return empty list.
*/
function pop_to_object(stack, t) {
    let result = [];

    if (stack.length === 0) {
        return result;
    }

    let foundPos = null;
    for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i] === t) {
            foundPos = i;
            break;
        }
    }

    if (foundPos !== null) {
        result = stack.splice(foundPos, stack.length - foundPos);
        result.shift();
    }

    return result;
}

module.exports.parse = function (tokens) {
    let doc = new chordpro.NodeDoc();

    let stack = []

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        let ttype = token[0];
        let tvalue = token[1];

        switch (ttype) {
        case tokenizer.CHP_TOKEN_DIRECTIVE:
            directive_handler(tokens, stack, doc, ttype, tvalue)
            break;
        case tokenizer.CHP_TOKEN_COMMENT:
            stack.push(new chordpro.Node(Node.EL_TYPE_COMMENT, tvalue));
            break;
        case tokenizer.CHP_TOKEN_CHORD:
            // always maintain a chord:lyric pairing on the stack
            stack.push(new chordpro.NodeChord(tvalue.trim()));
            break;
        case tokenizer.CHP_TOKEN_LYRIC:
            // if a lyric appears before a chord, assume a blank chord
            tvalue = ltrim(tvalue);
            if (tvalue.length > 0) {
                if (!is_node(stack[stack.length - 1]) || !stack[stack.length - 1] instanceof chordpro.NodeChord) {
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
            eol_handler(stack, doc)
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
function eol_handler(stack, doc) {

    //console.log('doc is ', doc);
    console.log("========== eol handler ===========")

    console.log("stack on enter: ", dump_stack(stack))

    // pop list of object on current line (not including LineBegin object)
    let line_stack = pop_to_object(stack, LineBegin)
    console.log("line_stack:", line_stack)
    console.log("stack after pop", dump_stack(stack))

    // if there are some object on current line
    if (line_stack.length > 0) {

        // check if all line tokens represent comment
        let all_comments = true;
        for (let i = 0; i < line_stack.length; i++) {
            if (!is_comment(line_stack[i])) {
                all_comments = false;
                break;
            }
        }

        if (all_comments) {
            // current line contains nothing but comment objects
            array_extend(stack, line_stack);
        } else {
            // if verse isn't already started, let's start it
            if (!find_backward(stack, VerseBegin) && !find_backward(stack, ChorusBegin)) {
                stack.push(VerseBegin)
            }
            let r = new chordpro.NodeRow();
            stack.push(r);
            array_extend(r.children, line_stack);
        }
    } else {
        // blank line - is used to separate verse blocks
        // check if we are inside chorus
        let in_chorus = find_backward(stack, ChorusBegin)

        // if we're in a chrous, stay in chorus mode
        // else, stop verse and start new verse
        if (!in_chorus) {
            let verseItems = pop_to_object(stack, VerseBegin)

            if (verseItems.length > 0) {
                let v = new chordpro.NodeVerse();
                doc.body.push(v);
                array_extend(v.children, verseItems);
                //console.log('after pushing node verse', JSON.stringify(doc));

            } else {
                // we're not in a verse, so move everything from the
                // stack to the document
                array_extend(doc.body, stack);
            }
            stack.push(VerseBegin)
        }
    }
    console.log("stack on leave: ", dump_stack(stack))
}

function finish_verse(stack) {
    console.log("finishing verse for stack: ", dump_stack(stack));
    let verse = pop_to_object(stack, VerseBegin)
    if (verse.length > 0) {
        let v = new chordpro.NodeVerse();
        stack.push(v);
        array_extend(v.children, verse);
    }
    console.log("stack after verse was finished: ", dump_stack(stack));
}

// Parser handler for all directives'
function directive_handler(tokens, stack, doc, ttype, tvalue) {
    let tag = tvalue;
    let arg = '';
    if (tvalue.indexOf(':') > 0) {
        tag = tvalue.substring(0, tvalue.indexOf(':')).trim();
        arg = tvalue.substring(tvalue.indexOf(':') + 1).trim();
    }

    tag = tag.toLowerCase();

    if (['t', 'title'].indexOf(tag) >= 0) {
        verify_tag_argument(tag, arg, true)
        doc.title = arg;

    } else if (['st', 'subtitle'].indexOf(tag) >= 0) {
        verify_tag_argument(tag, arg, true)
        doc.subTitle = arg;

    } else if (['artist'].indexOf(tag) >= 0) {
        verify_tag_argument(tag, arg, true)
        doc.artist = arg;

    } else if (['c', 'comment'].indexOf(tag) >= 0) {
        verify_tag_argument(tag, arg, true)
        finish_verse(stack)
        let c = new chordpro.NodeComment();
        c.text = arg;
        stack.push(c);

    } else if (['soc', 'start_of_chorus'].indexOf(tag) >= 0) {
        // close the current verse, if any, then start a chorus
        verify_tag_argument(tag, arg, false)
        pop_to_object(stack, LineBegin)
        finish_verse(stack)
        stack.push(ChorusBegin)

    } else if (['eoc', 'end_of_chorus'].indexOf(tag) >= 0) {
        // close the current chorus, but don't start a verse
        // - that's done after an sol token
        verify_tag_argument(tag, arg, false)
        pop_to_object(stack, LineBegin)
        let c = new chordpro.NodeChorus();
        doc.body.push(c);
        let chorus = pop_to_object(stack, ChorusBegin)
        array_extend(c.children, chorus);

    } else if (tag === 'tab') {
        verify_tag_argument(tag, arg, true)
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
