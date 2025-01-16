const Grammar = require('../src/grammar.js')
const FormatterHtml = require('../src/formatterHtml.js');

describe('ChordPro HTML formatter', function() {

    it('works for simple song', function () {

        const song_chordpro =
            '{title: Some Song}\n\n' +
            '[G]This is first [C]verse\n' +
            'with [G]chords';

        const song_doc = Grammar.parse(song_chordpro)

        const song_html = FormatterHtml.processSong(song_doc);

        expect(song_html).toMatch(/"header"/)
        expect(song_html).toMatch(/"content"/)
        expect(song_html).toMatch(/"verse"/)
        expect(song_html).toMatch(/"line"/)
        expect(song_html).toMatch(/"chord"/)
    });

    it('does not render empty header', function () {

        const song_chordpro =
            'This is first verse\n' +
            'with chords';

        const song_doc = Grammar.parse(song_chordpro)

        const song_html = FormatterHtml.processSong(song_doc);

        expect(song_html).not.toMatch(/"header"/)
        expect(song_html).toMatch(/"content"/)
        expect(song_html).toMatch(/"verse"/)
        expect(song_html).toMatch(/"line"/)
        expect(song_html).not.toMatch(/"chord"/)
    });

});
