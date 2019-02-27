import {parse, tokenize} from '../src/parser';
import {FormatterAscii} from '../src/FormatterAscii';
import {transpose} from '../src/utils';

describe('ChordPro Ascii Formatter', function() {

    it('is able to format simple song', function () {
        const song_chordpro = `
        {title: Some Song}

        [G]This is first [C]verse
        with [G]chords
        `;

        const song_doc = parse(tokenize(song_chordpro))

        const formatterAscii = new FormatterAscii();

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
