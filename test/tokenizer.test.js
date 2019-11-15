var tokenizer = require('../src/tokenizer');

describe('ChordPro Tokenizer', function() {

    it('empty song shall be tokenized', function () {
        let tokens = tokenizer.tokenize('');
        let expected = [ ['sof'], ['sol'], ['eol'], ['eof']];
        expect(expected).toEqual(tokens);
    });

    it('song title shall be tokenized', function () {
        let tokens = tokenizer.tokenize('{title: This is title}');
        let expected = [
            ['sof'],
            ['sol'],
            ['directive', 'title: This is title'],
            ['eol'],
            ['eof']
        ];
        expect(expected).toEqual(tokens);
    });

    it('artist shall be tokenized', function () {
        let tokens = tokenizer.tokenize('{artist: This is title}');
        let expected = [
            ['sof'],
            ['sol'],
            ['directive', 'artist: This is title'],
            ['eol'],
            ['eof']
        ];
        expect(expected).toEqual(tokens);
    });


    it('chords and lyrics shall be tokenized', function () {
        let tokens = tokenizer.tokenize('Before chords [C] between chords [Am] after chords');
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
        let tokens = tokenizer.tokenize('# This is comment');
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
        let tokens = tokenizer.tokenize('{title: something}\nsecond line [C]\nthird line.');
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
        let tokens = tokenizer.tokenize('first line\n\n\nlast line');
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
