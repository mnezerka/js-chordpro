// ChordPro Grammar
//
// https://peggyjs.org/
// https://peggyjs.org/online.html
// ----------------

All = header:Header? content:(Content / (!. { return '';})) { return { header, content}}

Header = items:(HeaderItem)+ { return items }

HeaderItem = Title / SubTitle / Artist / Composer / Lyricist / Copyright / Album / Year / Key / Capo / Time / Tempo / Duration

////////////////// basic tokens

_ "whitespace" = [ \t]*

nl = [\n\r]

dirend = (nl+ / !.)

////////////////// header one line directives

Title = "{" TitlePrefix " "? t:$[^}]+ "}" dirend { return { type: 'title', value: t }; }
TitlePrefix = "title:" / "t:" / "meta: title"

SubTitle = "{" SubTitlePrefix " "? t:$[^}]+ "}" dirend { return { type: 'subtitle', value: t}; }
SubTitlePrefix = "subtitle:" / "st:" / "meta: subtitle"

Artist = "{" ArtistPrefix " "? t:$[^}]+ "}" dirend { return { type: 'artist', value: t}; }
ArtistPrefix = "artist:" / "meta: artist"

Composer = "{" ComposerPrefix " "? t:$[^}]+ "}" dirend { return { type: 'composer', value: t}; }
ComposerPrefix = "composer:" / "meta: composer"

Lyricist = "{" LyricistPrefix " "? t:$[^}]+ "}" dirend { return { type: 'lyricist', value: t}; }
LyricistPrefix = "lyricist:" / "meta: lyricist"

Copyright = "{" CopyrightPrefix " "? t:$[^}]+ "}" dirend { return { type: 'copyright', value: t}; }
CopyrightPrefix = "copyright:" / "meta: copyright"

Album = "{" AlbumPrefix " "? t:$[^}]+ "}" dirend { return { type: 'album', value: t}; }
AlbumPrefix = "album:" / "meta: album"

Year = "{" YearPrefix " "? t:$[^}]+ "}" dirend { return { type: 'year', value: t}; }
YearPrefix = "year:" / "meta: year"

Key = "{" KeyPrefix " "? t:$[^}]+ "}" dirend { return { type: 'key', value: t}; }
KeyPrefix = "key:" / "meta: key"

Capo = "{" CapoPrefix " "? t:$[^}]+ "}" dirend { return { type: 'capo', value: t}; }
CapoPrefix = "capo:" / "meta: capo"

Time = "{" TimePrefix " "? t:$[^}]+ "}" dirend { return { type: 'time', value: t}; }
TimePrefix = "time:" / "meta: time"

Tempo = "{" TempoPrefix " "? t:$[^}]+ "}" dirend { return { type: 'tempo', value: t}; }
TempoPrefix = "tempo:" / "meta: tempo"

Duration = "{" DurationPrefix " "? t:$[^}]+ "}" dirend { return { type: 'duration', value: t}; }
DurationPrefix = "duration:" / "meta: duration"

////////////////// onther one line directives (not terminated by newline)

Comment = ("{c:" / "{comment:") " "? t:$[^}]+ "}" { return { type: 'comment', value: t };}

////////////////// block directives

Content = first:Block other:(nl nl+ b:Block { return b })* ws:(!. / (nl+ / !.)) { return [first].concat(other) }

Block = Verse / Chorus / Comment / Tab

Verse = items:ChordLines { return { type: "verse", items }; }

Chorus = "{" ("soc" / "start_of_chorus") "}" nl items:ChordLines nl "{" ("eoc" / "end_of_chorus") "}" { return { type: "chorus", items: items }; }

// lines seperated by newline, final newline is not consumed
ChordLines = first:ChordLine other:(nl l:ChordLine { return l })* { return [first].concat(other); }

// any sequence of plain text fragments and chords
ChordLine = items:(Chord / ChordLineText)+ { return { type: "line", items }; }

// any text except end of line
ChordLineText = t:$[^{[\n\r]+ { return { type: "text", value: t }; }

// chord must start with capital letter and continue with anything except closing bracket
Chord = "[" ch:$([A-Z]+ [^\]]*) "]" { return { type: "chord", value: ch}; }

Tab = "{" ("sot" / "start_of_tab") "}" nl items:RawLines nl "{" ("eot" / "end_of_tab") "}" { return { type: "tab", items: items }; }
RawLines = first:RawLine other:(nl l:RawLine { return l })* { return [first].concat(other); }
RawLine = $[^{\n\r]+
