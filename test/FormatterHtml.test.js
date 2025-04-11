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

    it('works for comments', function () {

        const song_chordpro = '{c: some comment}\n\n';
        const song_doc = Grammar.parse(song_chordpro)
        const song_html = FormatterHtml.processSong(song_doc);
        const dom = new JSDOM(song_html);
        const doc = dom.window.document;

        expect(doc.getElementsByClassName("content").length).toBe(1)

        const comments = doc.getElementsByClassName("comment")
        expect(comments.length).toBe(1)

        const comment = comments[0];
        expect(comment.textContent.trim()).toBe('some comment')
    });

    it('works for tabs', function () {

        const song_chordpro =
            '{start_of_tab}\n' +
            '--2-------6------\n' +
            '----3---5--------\n' +
            '------4----------\n' +
            '{end_of_tab}\n';

        const song_doc = Grammar.parse(song_chordpro)
        const song_html = FormatterHtml.processSong(song_doc);
        const dom = new JSDOM(song_html);
        const doc = dom.window.document;

        const tabs= doc.getElementsByClassName("tab")
        expect(tabs.length).toBe(1)

        const tab = tabs[0];
        const expected =
            '--2-------6------\n' +
            '----3---5--------\n' +
            '------4----------';

        expect(tab.textContent.trim()).toBe(expected);
    });

});
