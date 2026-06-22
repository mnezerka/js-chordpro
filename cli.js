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
argParser.add_argument('--toc', {help: 'Generate table of contents from song titles (HTML output only)', action: 'store_true'});
argParser.add_argument('--theme', {choices: ['basic'], help: 'Apply a predefined CSS theme (HTML output only)'});
argParser.add_argument('--interactive', {help: 'Embed library and song data for in-browser transposition (HTML output only)', action: 'store_true'});
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
            process.exit(1);
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
        let output = args.interactive ? null : formatter.processSong(songDoc);
        results.push({title, output, songDoc: args.interactive ? songDoc : null});
    }
}

if (args.sort) {
    results.sort((a, b) => a.title.localeCompare(b.title));
}

const THEMES = {
    basic: `
  body {
    font-family: Georgia, serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    background: #fafafa;
    color: #222;
  }

  nav.toc {
    margin-bottom: 30px;
  }

  nav.toc h2 {
    margin: 0 0 10px 0;
    font-size: 1.1em;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #555;
  }

  nav.toc ul {
    margin: 0;
    padding-left: 0px;
    list-style: none;
  }

  nav.toc ul li a {
    color: #1a5276;
    text-decoration: none;
  }

  nav.toc ul li a:hover {
    text-decoration: underline;
  }

  .jschordpro-song {
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid #ddd;
  }

  .jschordpro-song:last-child {
    border-bottom: none;
  }

  .header {
    margin-bottom: 15px;
  }

  .header h1 {
    font-size: 1.2em;
    margin-bottom: 6px;
    color: #111;
  }

  .header h2 {
    font-size: 1em;
    font-weight: normal;
    color: #666;
    margin: 2px 0;
  }

  .chord {
    color: #1a5276;
    font-weight: bold;
  }
`
};

// write all output to file or console
let result = args.interactive ? '' : results.map(r => r.output).join('\n');
if (args.f === 'html') {
    const themeStyles = args.theme ? THEMES[args.theme] : '';

    // assign anchors for toc and/or interactive mode
    if (args.toc || args.interactive) {
        results.forEach((r, i) => {
            r.anchor = `song-${i + 1}`;
            if (!args.interactive) {
                r.output = r.output.replace(
                    '<div class="jschordpro-song">',
                    `<div class="jschordpro-song" id="${r.anchor}">`
                );
            }
        });
        if (!args.interactive) {
            result = results.map(r => r.output).join('\n');
        }
    }

    if (args.interactive) {
        result = results.map(r => `<div class="jschordpro-song" id="${r.anchor}"></div>`).join('\n');
    }

    let tocHtml = '';
    if (args.toc) {
        const tocItems = results
            .filter(r => r.title)
            .sort((a, b) => a.title.localeCompare(b.title))
            .map(r => `<li><a href="#${r.anchor}">${r.title}</a></li>`)
            .join('\n');
        if (tocItems) {
            tocHtml = `<nav class="toc">\n<ul>\n${tocItems}\n</ul>\n</nav>\n`;
        }
    }

    const CLIENT_UI_JS = `(function(){
  var offsets=[];
  var songs=JSON.parse(document.getElementById('jschordpro-data').textContent);
  songs.forEach(function(){offsets.push(0);});
  function formatOffset(n){return n===0?'0':(n>0?'+':'')+n;}
  function deepClone(o){return JSON.parse(JSON.stringify(o));}
  function rerenderSong(index){
    var entry=songs[index],offset=offsets[index];
    var cloned=deepClone(entry.ast);
    if(offset!==0)window.jschordpro.transpose(cloned,offset);
    var songEl=document.getElementById(entry.id);
    var tmp=document.createElement('div');
    tmp.innerHTML=window.jschordpro.to_html(cloned);
    var newSong=tmp.querySelector('.jschordpro-song');
    newSong.id=entry.id;
    var controls=document.createElement('div');
    controls.className='transpose-controls';
    controls.dataset.songIndex=index;
    controls.innerHTML='<button class="transpose-down">&#x25BC;</button><span class="transpose-offset">'+formatOffset(offset)+'</span><button class="transpose-up">&#x25B2;</button>';
    newSong.insertBefore(controls,newSong.querySelector('.content'));
    songEl.parentNode.replaceChild(newSong,songEl);
  }
  document.addEventListener('DOMContentLoaded',function(){
    songs.forEach(function(_,i){rerenderSong(i);});
  });
  document.addEventListener('click',function(e){
    var btn=e.target.closest('.transpose-up,.transpose-down');
    if(!btn)return;
    var controls=btn.closest('.transpose-controls');
    if(!controls)return;
    var index=parseInt(controls.dataset.songIndex,10);
    if(isNaN(index))return;
    var delta=btn.classList.contains('transpose-up')?1:-1;
    offsets[index]=(offsets[index]+delta+12)%12;
    if(offsets[index]>6)offsets[index]-=12;
    rerenderSong(index);
  });
})();`;

    let interactiveHtml = '';
    if (args.interactive) {
        const libSource = fs.readFileSync(path.join(__dirname, 'dist', 'js-chordpro.js'), 'utf8');
        const libScript = `<script>\n(function(){\nvar exports={};\n${libSource}\nwindow.jschordpro=exports.default;\n})();\n</script>`;
        const songsJson = JSON.stringify(
            results.map((r, i) => ({
                id: r.anchor || `song-${i + 1}`,
                title: r.title,
                ast: r.songDoc
            }))
        ).replace(/<\/script>/gi, '<\\/script>');
        const dataScript = `<script id="jschordpro-data" type="application/json">\n${songsJson}\n</script>`;
        const uiScript = `<script>\n${CLIENT_UI_JS}\n</script>`;
        interactiveHtml = `\n${libScript}\n${dataScript}\n${uiScript}\n`;
    }

    result = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ChordPro Song</title>
<style>
  table {
    border-collapse: collapse;
  }

  td {
    margin: 0;
    padding: 0;
    white-space: nowrap;
  }

  tr.line-chords {
    font-weight: bold;
  }

  .chord {
    padding-top: 3px;
    padding-right: 5px;
  }

  .verse, .chorus {
    margin-bottom: 20px;
  }

  .chorus {
    margin-left: 30px;
  }

  .transpose-controls {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 10px 0;
  }

  .transpose-controls button {
    width: 28px;
    height: 28px;
    cursor: pointer;
    font-size: 14px;
    border: 1px solid #aaa;
    border-radius: 4px;
    background: #f0f0f0;
  }

  .transpose-controls button:hover {
    background: #ddd;
  }

  .transpose-offset {
    min-width: 28px;
    text-align: center;
    font-family: monospace;
    font-size: 14px;
  }
${themeStyles}</style>
</head>
<body>
${tocHtml}${result}${interactiveHtml}
</body>
</html>`;
}
if (args.o) {
    fs.writeFileSync(args.o, result, "utf8");
} else {
    console.log(result);
}
