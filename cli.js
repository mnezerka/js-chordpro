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

let allOutputs = [];

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
        let fContent = fs.readFileSync(f, "utf8");

        // parse song from chordpro format
        let songDoc = Grammar.parse(fContent)

        // format document
        let output = formatter.processSong(songDoc);
        allOutputs.push(output);
    }
}

// write all output to file or console
let result = allOutputs.join('\n');
if (args.o) {
    fs.writeFileSync(args.o, result, "utf8");
} else {
    console.log(result);
}
