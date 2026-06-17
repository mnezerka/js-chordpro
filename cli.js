#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { version } = require('./package.json');
const ArgumentParser = require('argparse').ArgumentParser
const Grammar = require('./src/grammar.js')
const FormatterAscii = require('./src/formatterAscii.js');
const FormatterHtml = require('./src/formatterHtml.js');

var argParser = new ArgumentParser({
    add_help: true,
    description: 'Tool for processing song lyrics stored in ChordPro format'
});

argParser.add_argument('files', {help: 'chordpro files or directories to be processed', nargs: '+'});
argParser.add_argument('-f', {choices: ['text', 'html'], help: 'Output format', default: 'text'});
argParser.add_argument('-o', {help: 'Output file name (without extension), default output is stdout'})
argParser.add_argument('--sort', {help: 'Sort songs by title', action: 'store_true'});
argParser.add_argument('--version', { action: 'version', version });

var args = argParser.parse_args();

// configure formatter once
let formatter
switch(args.f) {
    case 'html':
        formatter = FormatterHtml;
        break;
    case 'text':
    default:
        formatter = FormatterAscii;
}

let results = [];

for (let arg of args.files) {
    if (!fs.existsSync(arg)) {
        console.error(`File ${arg} doesn't exist`);
        continue;
    }

    let filesToProcess = [];

    if (fs.statSync(arg).isDirectory()) {
        let dirFiles = fs.readdirSync(arg);
        for (let f of dirFiles) {
            let filePath = path.join(arg, f);
            if (fs.statSync(filePath).isFile()) {
                filesToProcess.push(filePath);
            }
        }
    } else {
        filesToProcess.push(arg);
    }

    for (let f of filesToProcess) {
        console.log(`Reading ${f}`);
        let fContent = fs.readFileSync(f, "utf8").replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // parse song from chordpro format
        let songDoc;
        try {
            songDoc = Grammar.parse(fContent);
        } catch (err) {
            if (err.name === 'SyntaxError' && err.location) {
                const loc = err.location.start;
                const lines = fContent.split('\n');
                const contextLine = lines[loc.line - 1] || '';
                console.error(`Error parsing ${f}:`);
                console.error(`  Line ${loc.line}, column ${loc.column}: ${err.message}`);
                console.error(`  ${contextLine}`);
                console.error(`  ${' '.repeat(Math.max(0, loc.column - 1))}^`);
            } else {
                console.error(`Error parsing ${f}: ${err.message}`);
            }
            continue;
        }

        // extract title for sorting
        let title = '';
        if (songDoc.header) {
            for (let item of songDoc.header) {
                if (item.type === 'title') {
                    title = item.value;
                    break;
                }
            }
        }

        // format document
        let output = formatter.processSong(songDoc);
        results.push({title, output});
    }
}

if (args.sort) {
    results.sort((a, b) => a.title.localeCompare(b.title));
}

// write all output to file or console
let result = results.map(r => r.output).join('\n');
if (args.o) {
    fs.writeFileSync(args.o, result, "utf8");
} else {
    console.log(result);
}
