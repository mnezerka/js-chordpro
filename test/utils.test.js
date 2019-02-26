import {NodeDoc, NodeVerse, NodeRow, NodeChord} from '../src/parser';
import {transpose} from '../src/utils';

describe('ChordPro Transpose', function() {
    it('simple chords', function () {
        let doc = new NodeDoc();
        let verse = new NodeVerse();
        doc.body.push(verse);

        let row = new NodeRow();
        verse.children.push(row);

        let chord = new NodeChord('C D E F G A B');
        row.children.push(chord);

        transpose(doc, 2);

        expect(chord.chord).toBe('D E F# G A B C#');

        transpose(doc, -4);

        expect(chord.chord).toBe('Bb C D Eb F G A');

    });

    it('complex chords', function () {
        let doc = new NodeDoc();
        let verse = new NodeVerse();
        doc.body.push(verse);

        let row = new NodeRow();
        verse.children.push(row);

        let chord = new NodeChord('Cm7/5-');
        row.children.push(chord);

        transpose(doc, 6);

        expect(chord.chord).toBe('F#m7/5-');
    });


});
