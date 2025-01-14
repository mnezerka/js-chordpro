
function processLine(line) {
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
    // check if there is at least one real chord in a line
    let chords_real = chords.filter(c => c !== "")
    if (chords_real.length > 0) {
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
    let result = `<div class="${block.type}">\n`;
    for (let i = 0; i < block.items.length; i++) {
        let line = block.items[i];
        result += processLine(line);
    }
    result += '</div>'; // verse

    return result;
}

function processSong(song) {
    var result = '<div class="jschordpro-song">\n\n';

    result += '<div class="header">\n';
    if (song.header.title && song.header.title.length > 0) { result += `<h1>${song.header.title}</h1>\n` };
    if (song.header.subtitle && song.header.subTitle.length > 0) { result += `<h2>${song.header.subTitle}</h2>\n` };
    if (song.header.artist && song.header.artist.length > 0) { result += `<h2>${song.header.artist}</h2>\n` };
    result += '</div>\n\n'; // header

    // loop through song content item by item
    result += '<div class="content">\n';
    for (let i = 0; i < song.content.length; i++) {
        let block = song.content[i];
        result += processContentBlock(block)
    }
    result += '</div>\n'; // content

    result += '</div>\n'; // song

    return result;
}

module.exports = {
    processSong,
}
