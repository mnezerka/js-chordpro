import {tokenize, parse, NodeChord, NodeChorus, NodeRow, NodeVerse} from '../src/parser';

describe('ChordPro Tokenizer', function() {

    it('empty song shall be tokenized', function () {
        let tokens = tokenize('');
        let expected = [ ['sof'], ['sol'], ['eol'], ['eof']];
        expect(expected).toEqual(tokens);
    });

    it('song title shall be tokenized', function () {
        let tokens = tokenize('{title: This is title}');
        let expected = [
            ['sof'],
            ['sol'],
            ['directive', 'title: This is title'],
            ['eol'],
            ['eof']
        ];   
        expect(expected).toEqual(tokens);
    });

    it('chords and lyrics shall be tokenized', function () {
        let tokens = tokenize('Before chords [C] between chords [Am] after chords');
        let expected = [
            ['sof'],
            ['sol'],
            ['lyric', 'Before chords '],
            ['chord', 'C'],
            ['lyric', ' between chords '],
            ['chord', 'Am'],
            ['lyric', ' after chords'],
            ['eol'],
            ['eof']
        ];   
        expect(expected).toEqual(tokens);
    });

    it('comment shall be tokenized', function () {
        let tokens = tokenize('# This is comment');
        let expected = [
            ['sof'],
            ['sol'],
            ['comment', ' This is comment'],
            ['eol'],
            ['eof']
        ];   
        expect(expected).toEqual(tokens);
    });

    it('multiple lines with chords and lyrics shall be tokenized', function () {
        let tokens = tokenize('{title: something}\nsecond line [C]\nthird line.');
        let expected = [
            ['sof'],
            ['sol'], ['directive', 'title: something'], ['eol'],
            ['sol'], ['lyric', 'second line '], ['chord', 'C'], ['eol'],
            ['sol'], ['lyric', 'third line.'], ['eol'],
            ['eof']
        ];   
        expect(expected).toEqual(tokens);
    });

    it('empty lines are not ignored', function () {
        let tokens = tokenize('first line\n\n\nlast line');
        let expected = [
            ['sof'],
            ['sol'], ['lyric', 'first line'], ['eol'],
            ['sol'], ['eol'],
            ['sol'], ['eol'],
            ['sol'], ['lyric', 'last line'], ['eol'],
            ['eof']
        ];   
        expect(expected).toEqual(tokens);
    });
});

function dumpSong(doc) {
    console.log('Title: ', doc.title);
    console.log('Subtitle: ', doc.subTitle);

    for (let i = 0; i < doc.body.length; i++) {
        let o = doc.body[i];
        if (o instanceof NodeRow) {
            console.log('node row');
            for (let j = 0; j < o.children.length; j++) {
                console.log(o.children[j]);
            }
        } else {
            console.log(doc.body[i]);
        }
    } 
}

describe('ChordPro Parser', function() {

    it('empty song shall be parsed', function () {
        //let song = parse('');
        let tokens = tokenize('');
        let song = parse(tokens);
        expect(song.title).toBe(null);
        expect(song.subTitle).toBe(null);
        expect(song.body.length).toBe(0);
    });

    it('title', function () {
        //let song = parse('');
        let tokens = tokenize('{title: This is title}');
        let song = parse(tokens);
        expect(song.title).toBe('This is title');
    });

    it('subtitle', function () {
        //let song = parse('');
        let tokens = tokenize('{subtitle: This is subtitle}');
        let song = parse(tokens);
        expect(song.subTitle).toBe('This is subtitle');
    });

    it('artist', function () {
        //let song = parse('');
        let tokens = tokenize('{artist: This is artist}');
        let song = parse(tokens);
        expect(song.artist).toBe('This is artist');
    });

    it('single line verse without chords', function () {
        //let song = parse('');
        let tokens = tokenize('\nThis is verse line\n');
        let song = parse(tokens);
        expect(song.body.length).toBe(1);
        let verse = song.body[0];
        expect(verse).toBeInstanceOf(NodeVerse);
        expect(verse.children.length).toBe(1);
        let row = verse.children[0];
        expect(row).toBeInstanceOf(NodeRow);
        //let verse = song.body[0];
        expect(row.children.length).toBe(1);
        let chord = row.children[0];
        expect(chord).toBeInstanceOf(NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('This is verse line');
    });

    it('single line verse with chords', function () {
        //let song = parse('');
        let tokens = tokenize('\nBefore[C]after [Am]end\n');
        let song = parse(tokens);
        expect(song.body.length).toBe(1);
        let verse = song.body[0];
        expect(verse).toBeInstanceOf(NodeVerse);
        expect(verse.children.length).toBe(1);
        let row = verse.children[0];
        expect(row).toBeInstanceOf(NodeRow);
        expect(row.children.length).toBe(3);
        let chord = row.children[0];
        expect(chord).toBeInstanceOf(NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('Before');
        chord = row.children[1];
        expect(chord).toBeInstanceOf(NodeChord);
        expect(chord.chord).toBe('C');
        expect(chord.text).toBe('after ');
        chord = row.children[2];
        expect(chord).toBeInstanceOf(NodeChord);
        expect(chord.chord).toBe('Am');
        expect(chord.text).toBe('end');
    });

    it('multiple line verse without chords', function () {
        //let song = parse('');
        let tokens = tokenize('\nline1\nline2\nline3\n');
        let song = parse(tokens);
        expect(song.body.length).toBe(1);
        let verse = song.body[0];
        expect(verse).toBeInstanceOf(NodeVerse);
        expect(verse.children.length).toBe(3);

        let row = verse.children[0];
        expect(row).toBeInstanceOf(NodeRow);
        expect(row.children.length).toBe(1);
        let chord = row.children[0];
        expect(chord).toBeInstanceOf(NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('line1');

        row = verse.children[1];
        expect(row).toBeInstanceOf(NodeRow);
        expect(row.children.length).toBe(1);
        chord = row.children[0];
        expect(chord).toBeInstanceOf(NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('line2');

        row = verse.children[2];
        expect(row).toBeInstanceOf(NodeRow);
        expect(row.children.length).toBe(1);
        chord = row.children[0];
        expect(chord).toBeInstanceOf(NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('line3');
    });

    it('chorus without chords', function () {
        //let song = parse('');
        let tokens = tokenize('\n{soc}\nline1\nline2\n{eoc}\n');
        let song = parse(tokens);
        expect(song.body.length).toBe(1);
        let verse = song.body[0];
        expect(verse).toBeInstanceOf(NodeChorus);
        expect(verse.children.length).toBe(2);

        let row = verse.children[0];
        expect(row).toBeInstanceOf(NodeRow);
        expect(row.children.length).toBe(1);
        let chord = row.children[0];
        expect(chord).toBeInstanceOf(NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('line1');

        row = verse.children[1];
        expect(row).toBeInstanceOf(NodeRow);
        expect(row.children.length).toBe(1);
        chord = row.children[0];
        expect(chord).toBeInstanceOf(NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('line2');
    });

    it('simple song', function () {
        //let song = parse('');
        let songStr = '{title: Song title}\n' +
            '{subtitle: Song subtitle}\n\n' +
            'verse1 line1\n' +
            'verse1 line2\n\n' +
            '{soc}\n' +
            'chorus line1\n' +
            'chorus line2\n' +
            'chorus line3\n\n' +
            '{eoc}\n\n' +
            'verse2 line1';

        let tokens = tokenize(songStr);
        let song = parse(tokens);

        expect(song.title).toBe('Song title');
        expect(song.subTitle).toBe('Song subtitle');
        expect(song.body.length).toBe(3);

        let section = song.body[0];
        expect(section).toBeInstanceOf(NodeVerse);
        expect(section.children.length).toBe(2);

        section = song.body[1];
        expect(section).toBeInstanceOf(NodeChorus);
        expect(section.children.length).toBe(3);

        section = song.body[2];
        expect(section).toBeInstanceOf(NodeVerse);
        expect(section.children.length).toBe(1);
    });

    
});



