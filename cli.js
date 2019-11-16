#!/usr/bin/env node

const fs = require('fs')
const ArgumentParser = require('argparse').ArgumentParser;
const parser = require('./src/parser');
const tokenizer = require('./src/tokenizer');
const FormatterAscii = require('./src/FormatterAscii');
const FormatterHtml = require('./src/FormatterHtml');

var argParser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Tool for processing song lyrics stored in ChordPro format'
});

argParser.addArgument('files', {help: 'chordpro files to be processed', nargs: '+'});
argParser.addArgument('-f', {choices: ['text', 'html'], help: 'Output format', defaultValue: 'text'});
argParser.addArgument('-o', {help: 'Output file name (without extension), default output is stdout'})

var args = argParser.parseArgs();
//console.dir(args);

for (let f of args.files) {
    if (fs.existsSync(f)) {
        console.log(`Reading ${f}`);
        let fContent = fs.readFileSync(f, "utf8");

        // parse song from chordpro format
        let songDoc = parser.parse(tokenizer.tokenize(fContent))

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
