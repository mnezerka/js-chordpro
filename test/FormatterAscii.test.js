var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');
var utils = require('../src/utils');
var FormatterAscii = require('../src/FormatterAscii');

describe('ChordPro Ascii Formatter', function() {

    it('is able to format simple song', function () {
        const song_chordpro = `
        {title: Some Song}

        [G]This is first [C]verse
        with [G]chords
        `;

        const song_doc = parser.parse(tokenizer.tokenize(song_chordpro))

        const formatterAscii = new FormatterAscii.FormatterAscii();
        const song_ascii = formatterAscii.processSong(song_doc);
        const song_expected =
            'Title: Some Song\n' +
            '\n' +
            'G             C    \n' +
            'This is first verse\n' +
            '     G     \n' +
            'with chords\n'


        expect(song_ascii).toBe(song_expected);
    });
});
