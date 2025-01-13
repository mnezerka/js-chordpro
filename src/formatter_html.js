
function processRow(node) {
    let chords = [];
    let lyrics = [];
    let last_chord = null;

    for (let i = 0; i < row.children.length; i++) {
        let item = row.children[i];

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

    let result = '<table class="jschordpro-row">';

    // chords row
    // check if there is at least one real chord in a row
    let chords_real = chords.filter(c => c !== "")
    if (chords_real.length > 0) {
        result += '<tr class="jschordpro-row-chords">';
        result += chords.map(c => `<td class="jschordpro-chord">${c}</td>`).join("\n");
        result += '</tr>';
    }

    // lyris row
    result += '<tr class="jschordpro-row-lyrics">';
    result += lyrics.map(l => `<td class="jschordpro-lyrics">${l.replaceAll(" ", "&nbsp;")}</td>`).join("\n");
    result += '</tr>';

    result += '</table>';

    return result;
}

function processTextPart(part) {
    let result = `<div class="jschordpro-${part.type}">`;
    for (let i = 0; i < part.lines.length; i++) {
        let row = part.lines[i];
        if (row.type != "row") { continue }
        result += process_row(row);
    }
    result += '</div>'; // verse

    return result;
}

function processSong(doc) {
    var result = '<div class="jschordpro-song">';

    if (doc.type === "chordpro") {
        result += '<div class="jschordpro-header">';
        if (doc.header.title.length > 0) { result += `<h1>${doc.header.title}</h1>` };
        if (doc.header.subtitle.length > 0) { result += `<h2>${doc.header.subtitle}</h2>` };
        if (doc.header.artist.length > 0) { result += `<h2>${doc.header.artist}</h2>` };
        result += '</div>';

        // loop through song content item by item
        if (doc.content.type === "content") {
            result += '<div class="jschordpro-content">';
            for (let i = 0; i < doc.content.parts.length; i++) {
                let part = doc.content.parts[i];
                result += process_text_part(part)
            }
            result += '</div>';
        }

    }

    result += '</div>';

    return result;
}

module.exports = {
    processSong,
    processTextPart,
    processRow
}
