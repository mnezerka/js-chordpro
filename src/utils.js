//var chordpro = require('./chordpro');

function transpose(song, step) {

    for (let block of song.content) {

        // ignore block types different from verse and chorus
        if (!['verse', 'chorus'].includes(block.type)) {
            continue;
        }

        for (let item of block.items) {
            if (item.type != 'line') {
                continue;
            }

            for (let token of item.items) {
                if (token.type == 'chord') {
                    token.value = transposeChord(token.value, step);
                }
            }
        }

    }

    return song;
}


function transposeChord(chord, step) {
    const roots = 'CDEFGAB';
    const steps = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

    if (chord.length < 1) { return; }

    let result = '';

    let i = 0;
    while (i < chord.length) {
        // look for chord root in array of roots
        let rootIndex = roots.indexOf(chord[i]);

        // nothing to do if no predefined capital letter found
        if (rootIndex === -1) {
            result += chord[i];
            i++;
            continue;
        }

        let root = chord[i];
        i++;

        // check for root modifiers (#, b)
        if (i < chord.length) {
            if (chord[i] === '#' || chord[i] === 'b')
            {
                root += chord[i];
                i++;
            }
        }

        // look for step
        let stepIndex = steps.indexOf(root);

        if (stepIndex === -1) {
            console.error('Unknown chord root', root);  //eslint-disable-line no-console

        }

        // transposition
        stepIndex += step;
        stepIndex %= 12;

        if (stepIndex < 0) {
            stepIndex = 12 + stepIndex;
        }

        result += steps[stepIndex];
    }
    return result
}

module.exports = {
    transpose,
    transposeChord
}
