'use strict'

const Grammar = require('../src/grammar.js')

const metaTags = [
    "composer",
    "lyricist",
    "copyright",
    "album",
    "year",
    "key",
    "capo",
    "time",
    "tempo",
    "duration"
]

describe('Parser', function() {

    it('works for empty song', function () {
        let song = Grammar.parse('');
        expect(song.header).toBe(null);
        expect(song.content.length).toBe(0);
    });

    it('works for title', function () {
        let song = Grammar.parse('{title: This is title}');
        expect(song.header[0]).toStrictEqual({type: 'title', value: 'This is title'});

        song = Grammar.parse("{title: Dyin'}");
        expect(song.header[0]).toStrictEqual({type: 'title', value: "Dyin'"});

        // short formt
        song = Grammar.parse('{t: This is title}');
        expect(song.header[0]).toStrictEqual({type: 'title', value: 'This is title'});

        // meta
        song = Grammar.parse('{meta: title This is title}');
        expect(song.header[0]).toStrictEqual({type: 'title', value: 'This is title'});
    });

    it('works for subtitle', function () {
        let song = Grammar.parse('{subtitle: This is subtitle}');
        expect(song.header[0]).toStrictEqual({type: 'subtitle', value: 'This is subtitle'});

        // short form
        song = Grammar.parse('{st: This is subtitle}');
        expect(song.header[0]).toStrictEqual({type: 'subtitle', value: 'This is subtitle'});

        // meta
        song = Grammar.parse('{meta: subtitle This is subtitle}');
        expect(song.header[0]).toStrictEqual({type: 'subtitle', value: 'This is subtitle'});
    });

    it('works for artist', function () {
        let song = Grammar.parse('{artist: This is artist}');
        expect(song.header[0]).toStrictEqual({type: 'artist', value: 'This is artist'});

        // meta
        song = Grammar.parse('{meta: artist This is artist}');
        expect(song.header[0]).toStrictEqual({type: 'artist', value: 'This is artist'});
    });

    it.each(metaTags)('works for meta tag %s', function (tag) {

        let songRaw = '{' + tag +': This is ' + tag + '}';
        let song = Grammar.parse(songRaw);
        expect(song.header).toContainEqual({type: tag, value: 'This is ' + tag});

        // meta
        song = Grammar.parse('{meta: ' + tag + ' This is ' + tag + '}');
        expect(song.header).toContainEqual({type: tag, value: 'This is ' + tag});
    });

    it('works for single line verse without chords', function () {
        let song = Grammar.parse('This is verse line');
        expect(song.content.length).toBe(1);
        let verse = song.content[0];
        expect(verse.type).toBe('verse')
        expect(verse.items.length).toBe(1);
        let line = verse.items[0];
        expect(line.type).toBe('line')
        expect(line.items.length).toBe(1);
        let textToken = line.items[0];
        expect(textToken.type).toBe('text')
        expect(textToken.value).toBe('This is verse line');
    });

    it('works for single line verse with chords', function () {
        let song = Grammar.parse('Before[C]after [Am]end');

        expect(song.content.length).toBe(1);

        let verse = song.content[0];
        expect(verse.type).toBe('verse')
        expect(verse.items.length).toBe(1);

        let line = verse.items[0];
        expect(line.type).toBe('line')
        expect(line.items.length).toBe(5);

        expect(line.items[0].type).toBe('text')
        expect(line.items[0].value).toBe('Before')

        expect(line.items[1].type).toBe('chord')
        expect(line.items[1].value).toBe('C')

        expect(line.items[2].type).toBe('text')
        expect(line.items[2].value).toBe('after ')

        expect(line.items[3].type).toBe('chord')
        expect(line.items[3].value).toBe('Am')

        expect(line.items[4].type).toBe('text')
        expect(line.items[4].value).toBe('end')
    });

    it('works for multiple line verse without chords', function () {
        let song = Grammar.parse('line1\nline2\nline3');

        expect(song.content.length).toBe(1);

        let verse = song.content[0];
        expect(verse.type).toBe('verse')
        expect(verse.items.length).toBe(3);

        expect(verse.items[0].type).toBe('line')
        expect(verse.items[0].items.length).toBe(1)
        expect(verse.items[0].items[0].type).toBe('text')
        expect(verse.items[0].items[0].value).toBe('line1')

        expect(verse.items[1].type).toBe('line')
        expect(verse.items[1].items.length).toBe(1)
        expect(verse.items[1].items[0].type).toBe('text')
        expect(verse.items[1].items[0].value).toBe('line2')

        expect(verse.items[2].type).toBe('line')
        expect(verse.items[2].items.length).toBe(1)
        expect(verse.items[2].items[0].type).toBe('text')
        expect(verse.items[2].items[0].value).toBe('line3')
    });

    it('works for chorus without chords', function () {

        let song = Grammar.parse('{soc}\nline1\nline2\nline3\n{eoc}');

        expect(song.content.length).toBe(1);

        let chorus = song.content[0];
        expect(chorus.type).toBe('chorus')
        expect(chorus.items.length).toBe(3);

        expect(chorus.items[0].type).toBe('line')
        expect(chorus.items[0].items.length).toBe(1)
        expect(chorus.items[0].items[0].type).toBe('text')
        expect(chorus.items[0].items[0].value).toBe('line1')

        expect(chorus.items[1].type).toBe('line')
        expect(chorus.items[1].items.length).toBe(1)
        expect(chorus.items[1].items[0].type).toBe('text')
        expect(chorus.items[1].items[0].value).toBe('line2')

        expect(chorus.items[2].type).toBe('line')
        expect(chorus.items[2].items.length).toBe(1)
        expect(chorus.items[2].items[0].type).toBe('text')
        expect(chorus.items[2].items[0].value).toBe('line3')
    });

    it('works for chorus long version', function () {

        let song = Grammar.parse('{start_of_chorus}\nline1\n{end_of_chorus}');

        expect(song.content.length).toBe(1);

        let chorus = song.content[0];
        expect(chorus.type).toBe('chorus')
        expect(chorus.items.length).toBe(1);

        expect(chorus.items[0].type).toBe('line')
        expect(chorus.items[0].items.length).toBe(1)
        expect(chorus.items[0].items[0].type).toBe('text')
        expect(chorus.items[0].items[0].value).toBe('line1')
    });

    /*
    it('works for tab section', function () {

        let song = Grammar.parse(
            '{start_of_tab}\n' +
            '---\n' +
            '-2-\n' +
            '-3-\n' +
            '\n' +
            '-3-\n' +
            '-3-\n' +
            '-0-\n' +
            '{end_of_tab}');

        expect(song.content.length).toBe(1);

        console.log(song.content[0]);

        let tab = song.content[0];
        expect(tab.type).toBe('tab')
        expect(tab.value).toBe(
            '---\n' +
            '-2-\n' +
            '-3-\n' +
            '\n' +
            '-3-\n' +
            '-3-\n' +
            '-0-\n')
    });
    */


    it('works for song with comments', function () {
        let song = Grammar.parse('{c: some comment}\n\nsome verse\n\n{comment: second comment}');

        expect(song.content.length).toBe(3);

        expect(song.content[0].type).toBe('comment')
        expect(song.content[0].value).toBe('some comment')

        expect(song.content[1].type).toBe('verse')

        expect(song.content[2].type).toBe('comment')
        expect(song.content[2].value).toBe('second comment')
    });

    it('works for simple song', function () {
        let songStr = '{title: Song title}\n' +
            '{subtitle: Song subtitle}\n\n' +
            'verse1 line1\n' +
            'verse1 line2\n\n' +
            '{soc}\n' +
            'chorus line1\n' +
            'chorus line2\n' +
            'chorus line3\n' +
            '{eoc}\n\n' +
            'verse2 line1';

        let song = Grammar.parse(songStr);

        expect(song.header).toContainEqual({type: 'title', value: 'Song title'});
        expect(song.header).toContainEqual({type: 'subtitle', value: 'Song subtitle'});

        expect(song.content.length).toBe(3);

        expect(song.content[0].type).toBe('verse')
        expect(song.content[0].items.length).toBe(2);

        expect(song.content[1].type).toBe('chorus')
        expect(song.content[1].items.length).toBe(3);

        expect(song.content[2].type).toBe('verse')
        expect(song.content[2].items.length).toBe(1);
    });

});
