const Grammar = require('../src/grammar.js')
const FormatterHtml = require('../src/formatterHtml.js');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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

    it('works for blocks with chords only at some lines', function () {

        const song_chordpro =
            '{title: Some Song}\n\n' +
            '[G]This is first [C]verse\n' +
            'with [G]chords and\n' +
            'this is line without chords at all.';

        const song_doc = Grammar.parse(song_chordpro)

        const song_html = FormatterHtml.processSong(song_doc);
        console.log(song_html);

        const dom = new JSDOM(song_html);
        const doc = dom.window.document;
        //dom.window.document.getElementById("content").children.length
        //
        expect(doc.getElementsByClassName("header").length).toBe(1)
        expect(doc.getElementsByClassName("content").length).toBe(1)

        const verses = doc.getElementsByClassName("verse")
        expect(verses.length).toBe(1)

        const verse = verses[0];
        const lines = doc.getElementsByClassName("line")
        expect(lines.length).toBe(3)

        // first line
        expect(lines[0].getElementsByClassName("line-chords").length).toBe(1)
        expect(lines[0].getElementsByClassName("line-lyrics").length).toBe(1)

        // second line
        expect(lines[1].getElementsByClassName("line-chords").length).toBe(1)
        expect(lines[1].getElementsByClassName("line-lyrics").length).toBe(1)

        // third line
        expect(lines[2].getElementsByClassName("line-chords").length).toBe(1)
        expect(lines[2].getElementsByClassName("line-lyrics").length).toBe(1)
    });

});
