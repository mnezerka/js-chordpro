//import chordpro = require('../src/chordpro');
var utils = require('../src/utils');

describe('ChordPro Transpose', function() {

    it('simple chords', function () {
        /*
        let doc = new chordpro.NodeDoc();
        let verse = new chordpro.NodeVerse();
        doc.body.push(verse);

        let row = new chordpro.NodeRow();
        verse.children.push(row);

        let chord = new chordpro.NodeChord('C D E F G A B');
        row.children.push(chord);

        utils.transpose(doc, 2);

        expect(chord.chord).toBe('D E F# G A B C#');

        utils.transpose(doc, -4);

        expect(chord.chord).toBe('Bb C D Eb F G A');
        */

    });

    it('complex chords', function () {
        /*
        let doc = new chordpro.NodeDoc();
        let verse = new chordpro.NodeVerse();
        doc.body.push(verse);

        let row = new chordpro.NodeRow();
        verse.children.push(row);

        let chord = new chordpro.NodeChord('Cm7/5-');
        row.children.push(chord);

        utils.transpose(doc, 6);

        expect(chord.chord).toBe('F#m7/5-');
        */
    });


});
