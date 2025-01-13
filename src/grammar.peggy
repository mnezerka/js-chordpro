// ChordPro Grammar
//
// https://peggyjs.org/
// https://peggyjs.org/online.html
// ----------------

All = header:Header content:Content { return { header, content}}

Header = t:Title? st:SubTitle? a: Artist? { return { title: t, subtitle: st, artist: a }; }

////////////////// basic tokens

_ "whitespace" = [ \t]*

nl = [\n\r]

////////////////// one line directives

Title = "{title:" " "? t:$[ a-zA-Z0-9]+ "}" nl+ { return t }

SubTitle = "{subtitle:" " "? t:$[ a-zA-Z0-9]+ "}" nl+ { t }

Artist = "{artist:" " "? t:$[ a-zA-Z0-9]+ "}" nl+ { t }

////////////////// block directives

Content = first:Block other:(nl nl+ b:Block { return b })* ws:(!. / (nl+ / !.)) { return [first].concat(other) }

Block = Verse / Chorus

Verse = items:ChordLines { return { type: "verse", items }; }

Chorus = "{soc}" nl items:ChordLines nl "{eoc}" { return { type: "chorus", items: items }; }

// lines seperated by newline, final newline is not consumed
ChordLines = first:ChordLine other:(nl l:ChordLine { return l })* { return [first].concat(other); }

// any sequence of plain text fragments and chords
ChordLine = items:(Chord / ChordLineText)+ { return { type: "line", items }; }

// any text except end of line
ChordLineText = t:$[^{[\n\r]+ { return { type: "text", value: t }; }

// chord must start with capital letter and continue with any letter, number of special symbol
Chord = "[" ch:$([A-Z]+ [ A-Za-z1-9#b/\-]*) "]" { return { type: "chord", value: ch}; }
