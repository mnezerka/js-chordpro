# ChordPro

Javscript implementation of parser for song lyrics writted in  [ChordPro](https://www.chordpro.org/) format.

## How to build and deploy

Install dependences:
```bash
npm install
```
Compile grammar to js: 
```
npm run grammar
```
Start development mode (package is built on each change in source code):
```bash
npm run dev
```
Build package for deploymet:
```bash
npm run build
```

## ChordPro Format Coverage 

Preamble directives

- [ ] `new_song`, `ns`

Meta-data directives

- [x] `title`, `t`
- [x] `subtitle`, `st`
- [x] `artist`
- [ ] `composer`
- [ ] `lyricist`
- [ ] `copyright`
- [ ] `album`
- [ ] `year`
- [ ] `key`
- [ ] `time`
- [ ] `tempo`
- [ ] `duration`
- [ ] `capo`
- [ ] `meta`

Formatting directives

- [x] `comment`, `c`
- [ ] `comment_italic`, `ci`
- [ ] `comment_box`, `cb`
- [ ] `image`

Environment directives

- [x] `start_of_chorus`, `soc`
- [x] `end_of_chorus`, `eoc`
- [ ] `chorus`
- [ ] `start_of_verse`
- [ ] `end_of_verse`
- [ ] `start_of_tab`, `sot)`
- [ ] `end_of_tab`, `eot)`
- [ ] `start_of_grid`
- [ ] `end_of_grid`

Chord diagrams

- [ ] `define`
- [ ] `chord`

Fonts, sizes and colours

- [ ] `textfont`
- [ ] `textsize`
- [ ] `textcolour`
- [ ] `chordfont`
- [ ] `chordsize`
- [ ] `chordcolour`
- [ ] `tabfont`
- [ ] `tabsize`
- [ ] `tabcolour`

Output related directives

- [ ] `new_page`, `np`
- [ ] `new_physical_page`, `npp)`
- [ ] `column_break`, `cb`

- [ ] `grid`, `g`
- [ ] `no_grid`, `ng`
- [ ] `titles`
- [ ] `columns`, `col`

Custom extensions

- [ ] `x_`

## Quick Start

```javascript
var chordpro = require('js-chordpro');

// Song to be parsed
const song_chordpro = `
{title: Some Song}

[G]This is first [C]verse
with [G]chords
`;

// tokenize and parse song into in-memory song document structure
let parsed = jschordpro.parse(song_chordpro)

// render in-memory song document to html
let html = jschordpro.to_html(doc);

console.log(html);
```
## Use as cli tool

Package provides cli command `jschordpro`.

Following command will register package as cli command in case
you don't install it as npm package (e.g. in case of git clone)

npm link

## Resources

- https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e
