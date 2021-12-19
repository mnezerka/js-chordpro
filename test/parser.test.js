'use strict'
var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');
var chordpro = require('../src/chordpro');

function dumpSong(doc) {
    console.log('Title: ', doc.title);
    console.log('Subtitle: ', doc.subTitle);

    for (let i = 0; i < doc.body.length; i++) {
        let o = doc.body[i];
        if (o instanceof chordpro.NodeRow) {
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
        let tokens = tokenizer.tokenize('');
        let song = parser.parse(tokens);
        expect(song.title).toBe(null);
        expect(song.subTitle).toBe(null);
        expect(song.body.length).toBe(0);
    });

    it('title', function () {
        let tokens = tokenizer.tokenize('{title: This is title}');
        let song = parser.parse(tokens);
        expect(song.title).toBe('This is title');
    });

    it('subtitle', function () {
        let tokens = tokenizer.tokenize('{subtitle: This is subtitle}');
        let song = parser.parse(tokens);
        expect(song.subTitle).toBe('This is subtitle');
    });

    it('artist', function () {
        //let song = parse('');
        let tokens = tokenizer.tokenize('{artist: This is artist}');
        let song = parser.parse(tokens);
        expect(song.artist).toBe('This is artist');
    });

    it('single line verse without chords', function () {
        let tokens = tokenizer.tokenize('\nThis is verse line\n');
        let song = parser.parse(tokens);
        expect(song.body.length).toBe(1);
        let verse = song.body[0];
        expect(verse).toBeInstanceOf(chordpro.NodeVerse);
        expect(verse.children.length).toBe(1);
        let row = verse.children[0];
        expect(row).toBeInstanceOf(chordpro.NodeRow);
        //let verse = song.body[0];
        expect(row.children.length).toBe(1);
        let chord = row.children[0];
        expect(chord).toBeInstanceOf(chordpro.NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('This is verse line');
    });

    it('single line verse with chords', function () {
        let tokens = tokenizer.tokenize('\nBefore[C]after [Am]end\n');
        let song = parser.parse(tokens);
        expect(song.body.length).toBe(1);
        let verse = song.body[0];
        expect(verse).toBeInstanceOf(chordpro.NodeVerse);
        expect(verse.children.length).toBe(1);
        let row = verse.children[0];
        expect(row).toBeInstanceOf(chordpro.NodeRow);
        expect(row.children.length).toBe(3);
        let chord = row.children[0];
        expect(chord).toBeInstanceOf(chordpro.NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('Before');
        chord = row.children[1];
        expect(chord).toBeInstanceOf(chordpro.NodeChord);
        expect(chord.chord).toBe('C');
        expect(chord.text).toBe('after ');
        chord = row.children[2];
        expect(chord).toBeInstanceOf(chordpro.NodeChord);
        expect(chord.chord).toBe('Am');
        expect(chord.text).toBe('end');
    });

    it('single line verse with chords (truncated)', function () {
        let tokens = tokenizer.tokenize('[C]line');
        console.log(tokens)
        let song = parser.parse(tokens);
        expect(song.body.length).toBe(1);
        let verse = song.body[0];
        expect(verse).toBeInstanceOf(chordpro.NodeVerse);
        expect(verse.children.length).toBe(1);
        let row = verse.children[0];
        expect(row).toBeInstanceOf(chordpro.NodeRow);
        expect(row.children.length).toBe(1);
        let chord = row.children[0];
        expect(chord).toBeInstanceOf(chordpro.NodeChord);
        expect(chord.chord).toBe('C');
        expect(chord.text).toBe('line');
    });

    it('multiple line verse without chords', function () {
        let tokens = tokenizer.tokenize('\nline1\nline2\nline3\n');
        let song = parser.parse(tokens);
        expect(song.body.length).toBe(1);
        let verse = song.body[0];
        expect(verse).toBeInstanceOf(chordpro.NodeVerse);
        expect(verse.children.length).toBe(3);

        let row = verse.children[0];
        expect(row).toBeInstanceOf(chordpro.NodeRow);
        expect(row.children.length).toBe(1);
        let chord = row.children[0];
        expect(chord).toBeInstanceOf(chordpro.NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('line1');

        row = verse.children[1];
        expect(row).toBeInstanceOf(chordpro.NodeRow);
        expect(row.children.length).toBe(1);
        chord = row.children[0];
        expect(chord).toBeInstanceOf(chordpro.NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('line2');

        row = verse.children[2];
        expect(row).toBeInstanceOf(chordpro.NodeRow);
        expect(row.children.length).toBe(1);
        chord = row.children[0];
        expect(chord).toBeInstanceOf(chordpro.NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('line3');
    });

    it('chorus without chords', function () {
        let tokens = tokenizer.tokenize('\n{soc}\nline1\nline2\n{eoc}\n');
        let song = parser.parse(tokens);
        expect(song.body.length).toBe(1);
        let verse = song.body[0];
        expect(verse).toBeInstanceOf(chordpro.NodeChorus);
        expect(verse.children.length).toBe(2);

        let row = verse.children[0];
        expect(row).toBeInstanceOf(chordpro.NodeRow);
        expect(row.children.length).toBe(1);
        let chord = row.children[0];
        expect(chord).toBeInstanceOf(chordpro.NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('line1');

        row = verse.children[1];
        expect(row).toBeInstanceOf(chordpro.NodeRow);
        expect(row.children.length).toBe(1);
        chord = row.children[0];
        expect(chord).toBeInstanceOf(chordpro.NodeChord);
        expect(chord.chord).toBe('');
        expect(chord.text).toBe('line2');
    });

    it('song with comments', function () {
        let tokens = tokenizer.tokenize('{c: some comment}\nsome verse\n{comment: second comment}');
        let song = parser.parse(tokens);

        console.log(song);

        expect(song.body.length).toBe(3);

        let comment = song.body[0];
        expect(comment).toBeInstanceOf(chordpro.NodeComment);
        expect(comment.text).toBe('some comment');

        let comment2 = song.body[2];
        expect(comment2).toBeInstanceOf(chordpro.NodeComment);
        expect(comment2.text).toBe('second comment');
    });

    it('simple song', function () {
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

        let tokens = tokenizer.tokenize(songStr);
        let song = parser.parse(tokens);

        expect(song.title).toBe('Song title');
        expect(song.subTitle).toBe('Song subtitle');
        expect(song.body.length).toBe(3);

        let section = song.body[0];
        expect(section).toBeInstanceOf(chordpro.NodeVerse);
        expect(section.children.length).toBe(2);

        section = song.body[1];
        expect(section).toBeInstanceOf(chordpro.NodeChorus);
        expect(section.children.length).toBe(3);

        section = song.body[2];
        expect(section).toBeInstanceOf(chordpro.NodeVerse);
        expect(section.children.length).toBe(1);
    });

});
