import nearley from "nearley";
import grammar from "./grammar.js";

export function parse(text) {

    // create a Parser object from our grammar.
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    
    parser.feed(text + "\n");

    return parser.results[0];
}