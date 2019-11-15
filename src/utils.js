var chordpro = require('./chordpro');

module.exports.transpose = function(song, step) {

    for (let bodyItem of song.body) {

        if (!(bodyItem instanceof chordpro.NodeVerse || !(bodyItem instanceof chordpro.NodeChord))) {
            continue;
        }

        for (let row of bodyItem.children) {
            if (!(row instanceof chordpro.NodeRow)) {
                continue;
            }

            for (let rowItem of row.children) {
                if (rowItem instanceof chordpro.NodeChord) {
                    transposeChord(rowItem, step);
                }
            }
        }

    }

    return song;
}

function transposeChord(chordNode, step) {
    //console.log('here', chordNode, step);
    const roots = 'CDEFGAB';
    const steps = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

    let chord = chordNode.chord;
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
    chordNode.chord = result;
    //console.log('chord', chord, ' -> ', result);
}
