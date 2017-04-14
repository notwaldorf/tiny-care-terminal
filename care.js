var twitterbot = require('./twitterbot.js');
var spawn = require( 'child_process' ).spawn;
var blessed = require('blessed');
var contrib = require('blessed-contrib');
var chalk = require('chalk');
var parrotSay = require('parrotsay-api');
var weather = require('weather-js');

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

var config = {
  twitter: ['tinycarebot', 'magicrealismbot', 'aloebud'],
  repos: ['~/Code', '~/Code/polymer'],
  zipcode: ['94133'],
  celsius: true
}

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

// grid.set(row, col, rowSpan, colSpan, obj, opts)
var weatherBox = grid.set(0, 8, 2, 4, blessed.box, makeScrollBox(' 🌤 '));
var todayBox = grid.set(0, 0, 6, 6, blessed.box, makeScrollBox(' 📝  Today '));
var weekBox = grid.set(6, 0, 6, 6, blessed.box, makeScrollBox(' 📝  Week '));
var commits = grid.set(0, 6, 6, 2, contrib.bar, {label: 'Commits', barWidth: 6, maxHeight: 10});
var parrotBox = grid.set(6, 6, 6, 6, blessed.box, makeBox(''));

var tweetBoxes = {}
tweetBoxes[config.twitter[1]] = grid.set(2, 8, 2, 4, blessed.box, makeBox(' 🐶 '));
tweetBoxes[config.twitter[2]] = grid.set(4, 8, 2.5, 4, blessed.box, makeBox(' 💧 '));

tick();
//setInterval(tick, 1000 * 60 * 20); // 20 minutes

function tick() {
  // Do the weather.
  weather.find({search: config.zipcode, degreeType: config.celsius ? 'C' : 'F'}, function(err, result) {
    var json = result[0];
    var skytext = json.current.skytext.toLowerCase();
    var currentDay = json.current.day;
    var forecastString = '';
    for (var i = 0; i < json.forecast.length; i++) {
      if (json.forecast[i].day === currentDay) {
        var skytextforecast = json.forecast[i].skytextday.toLowerCase();
        forecastString = `Today, it will be ${skytextforecast} with the forecasted high of ${json.forecast[i].high} and a low of ${json.forecast[i].low}.`;
      }
    }
    weatherBox.content = `In ${json.location.name} it's ${json.current.temperature}${json.location.degreetype} and ${skytext} right now. ${forecastString}`;
  });

  // Do the tweets.
  for (var which in config.twitter) {
    if (which == 0) {
      twitterbot.getTweet(config.twitter[which]).then(function(tweet) {
        parrotSay(tweet.text).then(function(text) {
            parrotBox.content = text;
          })
        screen.render();
      });
    } else {
      twitterbot.getTweet(config.twitter[which]).then(function(tweet) {
        tweetBoxes[tweet.bot.toLowerCase()].content = tweet.text;
        screen.render();
      });
    }
  }

  // Do the codes.
  var repos = config.repos.join(' ');
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
  options.mouse = true;
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
