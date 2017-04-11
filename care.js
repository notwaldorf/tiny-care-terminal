var twitterbot = require('./twitterbot.js');

var blessed = require('blessed');
var screen = blessed.screen(
    {fullUnicode:true, // emoji or bust
     smartCSR: true
    });

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.title = '✨💖 tiny care terminal 💖✨';

twitterbot.getTweet('tinycarebot').then(function(message) {
  showTweet(message, ' 💖 ', true);
});
twitterbot.getTweet('magicRealismbot').then(function(message) {
  showTweet(message, ' 🐶 ', false);
});

function showTweet(message, label, left) {
  var box = blessed.box({
    top: '10px',
    left: left? '0' : '50%',
    width: '50%',
    height: '20%',
    content: message,
    tags: true,
    label: label,
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
