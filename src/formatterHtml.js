
function blockHasChords(block) {
    if (!block.items) {
        return false;
    }

    for (let i = 0; i < block.items.length; i++) {
        let line = block.items[i];
        for (let j = 0; j < line.items.length; j++) {
            if (line.items[j].type === "chord") {
                return true;
            }
        }
    }
    return false;
}

function processLine(line, hasChords) {
    let chords = [];
    let lyrics = [];
    let last_chord = null;

    for (let i = 0; i < line.items.length; i++) {
        let item = line.items[i];

        if (item.type === "chord") {
            chords.push(item.value);
            last_chord = item.value;
        } else if (item.type === "text") {
            if (last_chord === null) {
                // insert empty chords
                chords.push("")
            }
            lyrics.push(item.value);
            last_chord = null
        }
    }

    let result = '<table class="line">';

    // chords line
    if (hasChords) {
        result += '<tr class="line-chords">';
        result += chords.map(c => `<td class="chord">${c}</td>`).join("\n");
        result += '</tr>';
    }

    // lyris line
    result += '<tr class="line-lyrics">';
    result += lyrics.map(l => `<td class="lyrics">${l.replaceAll(" ", "&nbsp;")}</td>`).join("\n");
    result += '</tr>';

    result += '</table>';

    return result;
}

function processContentBlock(block) {
    let hasChords = blockHasChords(block);

    let result = `<div class="${block.type}">\n`;
    for (let i = 0; i < block.items.length; i++) {
        let line = block.items[i];
        result += processLine(line, hasChords);
    }
    result += '</div>'; // verse

    return result;
}

function processComment(item) {

    let result = `<div class="${item.type}">\n`;
    result += item.value + '\n';
    result += '</div>\n';

    return result;
}

function processTab(tab) {

    let result = `<div class="${tab.type}">\n`;
    for (let i = 0; i < tab.items.length; i++) {
        result += tab.items[i] + '\n';
    }
    result += '</div>'; // verse

    return result;
}

function processSong(song) {
    var result = '<div class="jschordpro-song">\n\n';

    let h = ""
    if (song.header) {
        for (let i = 0; i < song.header.length; i++) {
            let item = song.header[i]

            switch (item.type) {
                case 'title':
                    h += `<h1 class="${item.type}">${item.value}</h1>\n`
                    break;
                case 'subtitle':
                case 'artist':
                case 'composer':
                case 'lyricist':
                case 'copyright':
                case 'album':
                case 'year':
                case 'key':
                case 'capo':
                case 'time':
                case 'tempo':
                case 'duration':
                    h += `<h2 class="${item.type}">${item.value}</h2>\n`
                    break;
                default:
                    console.warn(`no formatting defined for header item of type "${item.type}".`);
            }
        }
    }

    if (h) {
        result += '<div class="header">\n';
        result += h;
        result += '</div>\n\n'; // header
    }

    // loop through song content item by item
    result += '<div class="content">\n';
    for (let i = 0; i < song.content.length; i++) {
        let item = song.content[i];
        switch (item.type) {
            case 'comment':
                result += processComment(item)
                break;
            case 'tab':
                result += processTab(item)
                break;
            default:
                result += processContentBlock(item)
        }
    }
    result += '</div>\n'; // content

    result += '</div>\n'; // song

    return result;
}

module.exports = {
    processSong
}
