var twitterbot = require('./twitterbot.js');
var spawn = require( 'child_process' ).spawn;

var blessed = require('blessed');
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

var standup = spawn('git-standup');
standup.stdout.on( 'data', data => {
  showStandup(`${data}`, '.');
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

function showStandup(message, project) {
  var box = blessed.box({
    scrollable: true,
    label: '💻 👀 ',
    content: message,
    top: '25%',
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
}
