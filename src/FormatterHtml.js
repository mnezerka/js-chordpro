var chordpro = require('./chordpro');

function processText(text) {
    if (text === null || text.length === 0) {
        text = '';
    }
    return `<td class="jschordpro-text">${text}</td>`;
}

function processChord(chord) {
    return `<td class="jschordpro-chord">${chord}</td>`;
}

function processRow(node) {

    var result = '<table class="jschordpro-row"><tbody>';

    // render chord row
    result += '<tr>';
    for (let i = 0; i < node.children.length; i++) {
        const item = node.children[i];
        if (item  instanceof chordpro.NodeChord) {
            result += processChord(item.chord);
        }
    }
    result += '</tr>';

    // render text row
    result += '<tr>';
    for (let i = 0; i < node.children.length; i++) {
        const item = node.children[i];
        if (item  instanceof chordpro.NodeChord) {
            result += processText(item.text);
        }
    }
    result += '</tr>';

    result += '</tbody></table>';

    return result;
}

function processVerse(node) {
    var result = '<div class="jschordpro-verse">';

    for (let i = 0; i < node.children.length; i++) {
        const item = node.children[i];
        if (item instanceof chordpro.NodeRow)
        {
            result += processRow(item);
        }
    }

    result += '</div>';

    return result;
}

function processChorus(node) {
    var result = '<div class="jschordpro-chorus">';

    for (let i = 0; i < node.children.length; i++) {
        const item = node.children[i];
        if (item instanceof chordpro.NodeRow)
        {
            result += processRow(item);
        }
    }

    result += '</div>';

    return result;
}

module.exports.processSong = function(doc) {

    var result = '<html>'
    result += '<head>';
    result += `
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
        `
    result += '<style>';
    result += `
        html, body, table, td {
            font-family: Verdana, Geneva, sans-serif;
            font-size: 11pt;
        }

        .jschordpro-song table {
            border-collapse: collapse
        }

        .jschordpro-song h1 {
            font-size: 17pt;
        }

        .jschordpro-song h2 {
            font-size: 14pt;
        }

        .jschordpro-verse {
            margin-bottom: 1em;
        }

        .jschordpro-chorus {
            margin-bottom: 1em;
            margin-left: 1em;
        }

        .jschordpro-chord {
            font-weight: bold;
            color: #36C;
        }

        .jschordpro-text {
            padding: 0px;
            white-space: pre;
        }
    `


    result += '</style>';

    result += '</head>';
    result += '<body>';
    result += '<div class="jschordpro-song">';

    if (doc.title) {result += `<h1>${doc.title}</h1>`};
    if (doc.subTitle) {result += `<h2>${doc.subTitle}</h2>`};
    if (doc.artist) {result += `<h2>${doc.artist}</h2>`};

    // loop through song content item by item
    for (let i = 0; i < doc.body.length; i++) {
        let node = doc.body[i];

        if (node instanceof chordpro.NodeVerse) {
            result += processVerse(node)
        } else if (node instanceof chordpro.NodeChorus) {
            result += processChorus(node)
        } else {
            //console.log(node);
        }
    }

    result += '</div>';
    result += '</body></html>';

    return result;
}


