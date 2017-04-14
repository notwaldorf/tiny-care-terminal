var twitterbot = require('./twitterbot.js');
var spawn = require( 'child_process' ).spawn;
var blessed = require('blessed');
var contrib = require('blessed-contrib');
var chalk = require('chalk');

var screen = blessed.screen(
    {fullUnicode: true, // emoji or bust
     smartCSR: true,
     autoPadding: true,
     title: '✨💖 tiny care terminal 💖✨'
    });

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

var options = {
  twitter: ['tinycarebot', 'magicrealismbot', 'aloebud'],
  repos: ['~/Code', '~/Code/polymer']
}

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

// grid.set(row, col, rowSpan, colSpan, obj, opts)
var todayBox = grid.set(0, 0, 6, 6, blessed.box, makeScrollBox(' 📝  Today '));
var weekBox = grid.set(6, 0, 6, 6, blessed.box, makeScrollBox(' 📝  Week '));
var commits = grid.set(0, 6, 4, 2, contrib.bar, {label: 'Commits', barWidth: 6, maxHeight: 10});
var tweetBoxes = {}
tweetBoxes[options.twitter[0]] = grid.set(0, 8, 2, 4, blessed.box, makeBox(' 💖 '));
tweetBoxes[options.twitter[1]] = grid.set(2, 8, 2, 4, blessed.box, makeBox(' 🐶 '));
tweetBoxes[options.twitter[2]] = grid.set(4, 8, 2.5, 4, blessed.box, makeBox(' 💧 '));

tick();

function tick() {
  // Do the tweets.
  for (var which in options.twitter) {
    twitterbot.getTweet(options.twitter[which]).then(function(tweet) {
      tweetBoxes[tweet.bot.toLowerCase()].content = tweet.text;
      screen.render();
    });
  }

  // Do the codes.
  var repos = options.repos.join(' ');
  var todayCommits = 0;
  var weekCommits = 0;

  var today = spawn('sh ' + __dirname + '/standup-helper.sh', [repos], {shell:true});
  today.stdout.on('data', data => {
    todayCommits = getCommits(`${data}`, todayBox);
    updateCommitsGraph(todayCommits, weekCommits);
    screen.render();
  });

  var week = spawn('sh ' + __dirname + '/standup-helper.sh', ['-d 7', repos], {shell:true});
  week.stdout.on('data', data => {
    weekCommits = getCommits(`${data}`, weekBox);
    updateCommitsGraph(todayCommits, weekCommits);
    screen.render();
  });
}

function makeScrollBox(label) {
  var options = makeBox(label);
  options.scrollable = true;
  options.scrollbar = { ch:' ' };
  options.style.scrollbar = { bg: 'green', fg: 'white' }
  options.keys = true;
  options.vi = true;
  options.alwaysScroll = true;
  return options;
}

function makeBox(label) {
  return {
    label: label,
    tags: true,
    // draggable: true,
    border: {
      type: 'line'  // or bg
    },
    style: {
      fg: 'white',
      border: { fg: 'cyan' },
      hover: { border: { fg: 'green' }, }
    }
  };
}

var commitRegex = /(.......) (- .*)/g;
function getCommits(data, box) {
  var content = colorizeLog(data);
  box.content += content;
  return (box.content.match(commitRegex) || []).length;
}

function updateCommitsGraph(today, week) {
  commits.setData({titles: ['today', 'week'], data: [today, week]})
}

function colorizeLog(text) {
  var lines = text.split('\n');
  var regex = /(.......) (- .*) (\(.*\)) (<.*>)/i;
  for (var i = 0; i < lines.length; i++) {
    // If it's a path
    if (lines[i][0] === '/' || lines[i][0] === '\\') {
      lines[i] = '\n' + chalk.red(lines[i]);
    } else {
      // It's a commit.
      var matches = lines[i].match(regex);
      if (matches ) {
        lines[i] = chalk.red(matches[1]) + ' ' + matches[2] + ' ' +
            chalk.green(matches[3])
      }
    }
  }
  return lines.join('\n');
}
