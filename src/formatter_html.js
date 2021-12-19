import chordpro from './chordpro';

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
    console.log(doc);

    var result = '<div class="jschordpro-song">';

    if (doc.title) {result += `<h1>${doc.title}</h1>`};
    if (doc.subTitle) {result += `<h2>${doc.subTitle}</h2>`};
    if (doc.artist) {result += `<h2>${doc.artist}</h2>`};

    // loop through song content item by item
    console.log(doc.body.length)
    for (let i = 0; i < doc.body.length; i++) {
        let node = doc.body[i];

        if (node instanceof chordpro.NodeVerse) {
            result += processVerse(node)
        } else if (node instanceof chordpro.NodeChorus) {
            result += processChorus(node)
        } else if (node instanceof chordpro.NodeRow) {
            result += processRow(node)
        } else {
            //console.log(node);
        }
    }

    result += '</div>';

    return result;
}


