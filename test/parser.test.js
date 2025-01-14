'use strict'

const Grammar = require('../src/grammar.js')

describe('Parser', function() {

    it('works for empty song', function () {
        let song = Grammar.parse('');
        expect(song.header.title).toBe(null);
        expect(song.header.subTitle).toBe(null);
        expect(song.content.length).toBe(0);
    });

    it('works for title', function () {
        let song = Grammar.parse('{title: This is title}');
        expect(song.header.title).toBe('This is title');

        song = Grammar.parse("{title: Dyin'}");
        expect(song.header.title).toBe("Dyin'");
    });

    it('works for subtitle', function () {
        let song = Grammar.parse('{subtitle: This is subtitle}');
        expect(song.header.subTitle).toBe('This is subtitle');
    });

    it('works for artist', function () {
        let song = Grammar.parse('{artist: This is artist}');
        expect(song.header.artist).toBe('This is artist');
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

        expect(song.header.title).toBe('Song title');
        expect(song.header.subTitle).toBe('Song subtitle');
        expect(song.content.length).toBe(3);

        expect(song.content[0].type).toBe('verse')
        expect(song.content[0].items.length).toBe(2);

        expect(song.content[1].type).toBe('chorus')
        expect(song.content[1].items.length).toBe(3);

        expect(song.content[2].type).toBe('verse')
        expect(song.content[2].items.length).toBe(1);
    });

});
