ChordPro
========

Javscript implementation of parser for song lyrics writted in  `ChordPro
<https://www.chordpro.org/chordpro/ChordPro-File-Format-Specification.html>`_
format.

Current Status
--------------

Preamble directives

- [ ] ``new_song``, ``ns``

Meta-data directives

- [x] ``title``, ``t``
- [x] ``subtitle``, ``st``
- [x] ``artist``
- [ ] ``composer``
- [ ] ``lyricist``
- [ ] ``copyright``
- [ ] ``album``
- [ ] ``year``
- [ ] ``key``
- [ ] ``time``
- [ ] ``tempo``
- [ ] ``duration``
- [ ] ``capo``
- [ ] ``meta``

Formatting directives

- [x] ``comment``, ``c``
- [ ] ``comment_italic``, ``ci``
- [ ] ``comment_box``, ``cb``
- [ ] ``image``

Environment directives

- [x] ``start_of_chorus``, ``soc``
- [x] ``end_of_chorus``, ``eoc``
- [ ] ``chorus``
- [ ] ``start_of_verse``
- [ ] ``end_of_verse``
- [x] ``start_of_tab``, ``sot)``
- [x] ``end_of_tab``, ``eot)``
- [ ] ``start_of_grid``
- [ ] ``end_of_grid``

Chord diagrams

- [ ] ``define``
- [ ] ``chord``

Fonts, sizes and colours

- [ ] ``textfont``
- [ ] ``textsize``
- [ ] ``textcolour``
- [ ] ``chordfont``
- [ ] ``chordsize``
- [ ] ``chordcolour``
- [ ] ``tabfont``
- [ ] ``tabsize``
- [ ] ``tabcolour``

Output related directives

- [ ] ``new_page``, ``np``
- [ ] ``new_physical_page``, ``npp)``
- [ ] ``column_break``, ``cb``

- [ ] ``grid``, ``g``
- [ ] ``no_grid``, ``ng``
- [ ] ``titles``
- [ ] ``columns``, ``col``

Custom extensions

- [ ] ``x_``

Quick Start
-----------

::
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

Output (content of `song_ascii` variable) should look like::

    Title: Some Song

    G             C
    This is first verse
         G
    with chords

Use as cli tool
---------------

Package provides cli command `jschordpro`.

Following command will register package as cli command in case
you don't install it as npm package (e.g. in case of git clone)::

    npm link

Resources
---------

- https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e
