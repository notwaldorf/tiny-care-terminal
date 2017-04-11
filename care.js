var twitterbot = require('./twitterbot.js');

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

function showTweet(message, label, left) {
  var box = blessed.text({
    content: '\n' + message,
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
