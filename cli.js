#!/usr/bin/env node

const fs = require('fs');

const ArgumentParser = require('argparse').ArgumentParser
const Grammar = require('./src/grammar.js')
const FormatterAscii = require('./src/formatter_ascii.js');
const FormatterHtml = require('./src/formatter_html.js');

var argParser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Tool for processing song lyrics stored in ChordPro format'
});

argParser.addArgument('files', {help: 'chordpro files to be processed', nargs: '+'});
argParser.addArgument('-f', {choices: ['text', 'html'], help: 'Output format', defaultValue: 'text'});
argParser.addArgument('-o', {help: 'Output file name (without extension), default output is stdout'})

var args = argParser.parseArgs();

for (let f of args.files) {
    if (fs.existsSync(f)) {
        console.log(`Reading ${f}`);
        let fContent = fs.readFileSync(f, "utf8");

        // parse song from chordpro format
        let songDoc = Grammar.parse(fContent)

        // configure formatter
        let formatter
        switch(args.f) {
            case 'html':
                formatter = FormatterHtml;
                break;
            case 'text':
            default:
                formatter = FormatterAscii;
        }

        // format document
        let output = formatter.processSong(songDoc);

        // write output to file or console
        if (args.o) {
            fs.writeFileSync(args.o, output, "utf8");
        } else {
            console.log(output);
        }

    } else {
        console.error(`File ${f} doesn't exist`);
    }
}
