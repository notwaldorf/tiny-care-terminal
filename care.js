var twitterbot = require('./twitterbot.js');
var spawn = require( 'child_process' ).spawn;

var blessed = require('blessed');
var chalk = require('chalk');
var screen = blessed.screen(
    {fullUnicode:true, // emoji or bust
     smartCSR: true,
     autoPadding: true,
     title: '✨💖 tiny care terminal 💖✨'
    });

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

twitterbot.getTweet('tinycarebot').then(function(message) {
  showTweet(message, ' 💖 ', true);
});
twitterbot.getTweet('magicRealismbot').then(function(message) {
  showTweet(message, ' 🐶 ', false);
});

var project = ['~/Code', '~/Code/polymer'];
var standupBox = showStandup();

var standup = spawn('sh ' + __dirname + '/standup-helper.sh', [project.join(' ')], {shell:true});
standup.stdout.on('data', data => {
  standupBox.content += colorizeLog(`${data}`);
  screen.render();
});

function showTweet(message, label, left) {
  var box = blessed.text({
    content: '\n\t' + message,
    label: label,
    top: '10px',
    left: left? '0' : '50%',
    width: '50%',
    height: '20%',
    tags: true,
    draggable: true,
    border: {
      type: 'line'  // or bg
    },
    style: {
      fg: 'white',
      border: { fg: 'magenta' },
      hover: { border: { fg: 'green' }, }
    }
  });
  screen.append(box);
  box.focus();
  // Render the screen.
  screen.render();
}

function showStandup() {
  var box = blessed.box({
    scrollable: true,
    label: ' 👀 Week 💻 ',
    top: '20%',
    left: '0',
    width: '50%',
    height: '40%',
    border: 'line',
    scrollbar:{ ch:' ' },
    style: {
      hover: { border: { fg: 'green' }, },
      focus: { border: { fg: 'green' }, },
      scrollbar: {
        bg: 'green',
        fg: 'white'
      },
    },
    keys: true,
    vi: true,
    alwaysScroll: true
  });
  screen.append(box);
  screen.render();
  return box;
}

function colorizeLog(text) {
  var lines = text.split('\n');
  var regex = /(.......) (- .*) (\(.*\)) (<.*>)/i;
  for (var i = 0; i < lines.length; i++) {
    // If it's a path
    if (lines[i][0] === '/' || lines[i][0] === '\\') {
      lines[i] = '\n' + chalk.red(lines[i]);
    } else {
      var matches = lines[i].match(regex);
      if (matches ) {
        lines[i] = chalk.red(matches[1]) + ' ' + matches[2] + ' ' +
            chalk.green(matches[3]) + ' ' + chalk.blue(matches[4]);
      }
    }
  }
  return lines.join('\n');
}
