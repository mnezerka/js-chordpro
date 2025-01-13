const Grammar = require('../src/grammar.js')
const FormatterAscii = require('../src/formatter_ascii.js');

describe('ChordPro Ascii Formatter', function() {

    it('is able to format simple song', function () {

        const song_chordpro =
            '{title: Some Song}\n\n' +
            '[G]This is first [C]verse\n' +
            'with [G]chords';

        const song_doc = Grammar.parse(song_chordpro)

        const song_ascii = FormatterAscii.processSong(song_doc);

        const song_expected =
            'Title: Some Song\n' +
            '\n' +
            'G             C \n' +
            'This is first verse\n' +
            '     G \n' +
            'with chords\n'


        expect(song_ascii).toBe(song_expected);
    });
});
