
module.exports.process_row = function process_row(node) {
    let line_chord = '';
    let line_text = '';

    for (let i = 0; i < node.children.length; i++) {
        const item = node.children[i];
        const max_len = Math.max(item.chord.length, item.text.length);
        line_chord += item.chord + ' '.repeat(max_len - item.chord.length);
        line_text += item.text + ' '.repeat(max_len - item.text.length);
    }

    let result = '';

    if (line_chord.length > 0) {
        result += line_chord + '\n';
    }

    return result + line_text;
}

module.exports.process_verse = function process_verse(node) {
    var result = '';

    for (let i = 0; i < node.children.length; i++) {
        const item = node.children[i];
        if (item instanceof chordpro.NodeRow)
        {
            result += processRow(item) + '\n';
        }
    }
    return result;
}

module.exports.process_song = function process_song(doc) {

    var result = '';

    if (doc.title) {result += `Title: ${doc.title}\n`};
    if (doc.subTitle) {result += `Subtitle: ${doc.subTitle}\n`};
    if (doc.artist) {result += `Artist: ${doc.artist}\n`};

    // one empty line to separate metadata and song lyrics
    result += '\n';

    // loop through song content item by item
    for (let i = 0; i < doc.body.length; i++) {
        let node = doc.body[i];

        if (node instanceof chordpro.NodeVerse) {
            result += process_verse(node)
        }
        else {
            //console.log(node);
        }
    }
    return result;
}
