# ChordPro

Javscript implementation of parser for song lyrics writted in  [ChordPro](https://www.chordpro.org/chordpro/ChordPro-File-Format-Specification.html)
format.


## Quick Start

```javascript
var cp = require('js-chordpro');
var {FormatterAscii} = require('js-chordpro/dist/FormatterAscii');

// Song to be parsed
const song_chordpro = `
{title: Some Song}

[G]This is first [C]verse
with [G]chords
`;

// tokenize and parse song into in-memory song document structure
const song_doc = cp.parse(cp.tokenize(song_chordpro))

// create instance of ascii formatter
var formatterAscii = new FormatterAscii();

// write ascii representation to console
const song_ascii = formatterAscii.processSong(song_doc);
console.log(song_ascii);
```

Output (content of `song_ascii` variable) should look like:
```
Title: Some Song

G             C
This is first verse
     G
with chords
```
