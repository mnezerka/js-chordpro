const nearley = require("nearley");
const grammar = require("./grammar.js");

// Create a Parser object from our grammar.
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

// Parse something!
//parser.feed("8 * 5");
//parser.feed("[D]In my time of dying\nI'm the man");
//parser.feed("In my [D]time of dying\nHello\n");

let song1 = `{title: One song}


[C]One simple [G]line
This is second line

Second verse with [D]chords

{soc}
This is chorus
{eoc}

`
//parser.feed("[C]One simple [G]line\nThis is second line\n\nSecond verse\n\n");
parser.feed(song1)

// parser.results is an array of possible parsings.
//console.log(parser.results); // [[[[ "foo" ],"\n" ]]]

console.warn("number of results", parser.results.length)

r1 = parser.results[0]

console.log(JSON.stringify(r1, null, "  "))