
function processRow(node) {
    let line_chord = '';
    let line_text = '';

    for (let i = 0; i < node.items.length; i++) {
        const item = node.items[i];
        const max_len = item.value.length

        let diff
        switch (item.type) {
            case 'chord':
                diff = line_text.length - line_chord.length
                if (diff > 0) {
                    line_chord += ' '.repeat(diff)
                }
                line_chord += item.value + ' '
                break;
            case 'text':
                line_text += item.value
                diff = line_chord.length - line_text.length
                if (diff > 0) {
                    line_text += ' '.repeat(diff)
                }

                break;
        }
    }

    let result = '';

    if (line_chord.length > 0) {
        result += line_chord + '\n';
    }

    return result + line_text;
}

function processVerse(node) {
    var result = '';

    for (let i = 0; i < node.items.length; i++) {
        const item = node.items[i];
        if (item.type == 'line')
        {
            result += processRow(item) + '\n';
        }
    }
    return result;
}

function processSong(doc) {

    var result = '';

    if (doc.header) {
        for (let i = 0; i < doc.header.length; i++) {
            let item = doc.header[i]

            switch (item.type) {
                case 'title':
                    result += `Title: ${item.value}\n`;
                    break;
                case 'subtitle':
                    result += `Subtitle: ${item.value}\n`;
                    break;
                case 'artist':
                    result += `Artist: ${item.value}\n`;
                    break;
            }
        }
    }

    // one empty line to separate metadata and song lyrics
    result += '\n';

    // loop through song content item by item (verses and choruses)
    for (let i = 0; i < doc.content.length; i++) {
        let node = doc.content[i];

        if (i > 0) {
            result += '\n\n'
        }

        if (node.type == 'verse' || node.type == 'chorus') {
            result += processVerse(node)
        }
        else {
            // error ?
        }

    }
    return result;
}

module.exports = {
    processSong,
    processVerse,
    processRow
}
