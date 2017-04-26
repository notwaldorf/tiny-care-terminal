#!/usr/bin/env node
var config = require(__dirname + '/config.js');
var twitterbot = require(__dirname + '/twitterbot.js');
var pomodorolib = require(__dirname + '/pomodoro.js');

var spawn = require('child_process').spawn;
var blessed = require('blessed');
var contrib = require('blessed-contrib');
var chalk = require('chalk');
var parrotSay = require('parrotsay-api');
var bunnySay = require('sign-bunny');
var weather = require('weather-js');

var pomodoro_is_active = config.pomodoro.is_active;

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

// Refresh on r, or Control-R.
screen.key(['r', 'C-r'], function(ch, key) {
  tick();
});

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

// grid.set(row, col, rowSpan, colSpan, obj, opts)
var weatherBox = grid.set(0, 8, 2, 4, blessed.box, makeScrollBox(' 🌤 '));
var todayBox = grid.set(0, 0, 6, 6, blessed.box, makeScrollBox(' 📝  Today '));
var weekBox = grid.set(6, 0, 6, 6, blessed.box, makeScrollBox(' 📝  Week '));

var commits = grid.set(0, 6, 6, 2, contrib.bar, makeGraphBox('Commits', 10));
var parrotBox = grid.set(6, 6, 6, 6, blessed.box, makeScrollBox(''));

var tweetBoxes = {}
tweetBoxes[config.twitter[1]] = grid.set(2, 8, 2, 4, blessed.box, makeBox(' 💖 '));
tweetBoxes[config.twitter[2]] = grid.set(4, 8, 2, 4, blessed.box, makeBox(' 💬 '));

if (pomodoro_is_active) {
  var pomodoroBox = grid.set(6, 10, 2, 2, blessed.box, makeScrollBox(' 🍅 '));
  var pomodoroStatsBox = grid.set(8, 10, 4, 2, contrib.bar, makeGraphBox('Pomodoros', 4));

  var parrotBox = grid.set(6, 6, 6, 4, blessed.box, makeScrollBox(''));
} else {
  var parrotBox = grid.set(6, 6, 6, 6, blessed.box, makeScrollBox(''));
}

tick();
setInterval(tick, 1000 * 60 * config.updateInterval);

function tick() {
  doTheWeather();
  doTheTweets();
  doTheCodes();
}

if (pomodoro_is_active) {
  pomodoro = pomodorolib.init(pomodoroBox, screen, pomodoroStatsBox);

  // Start and stop pomodoro on s
  screen.key(['s'], function(ch, key) {
    if (pomodoro.isRunning()) {
      pomodoro.stop();
    } else {
      pomodoro.start();
    }
  });
}

function doTheWeather() {
  weather.find({search: config.weather, degreeType: config.celsius ? 'C' : 'F'}, function(err, result) {
    if (result && result[0] && result[0].current) {
      var json = result[0];
      // TODO: add emoji for this thing.
      var skytext = json.current.skytext.toLowerCase();
      var currentDay = json.current.day;
      var degreetype = json.location.degreetype;
      var forecastString = '';
      for (var i = 0; i < json.forecast.length; i++) {
        var forecast = json.forecast[i];
        if (forecast.day === currentDay) {
          var skytextforecast = forecast.skytextday.toLowerCase();
          forecastString = `Today, it will be ${skytextforecast} with a forecast high of ${forecast.high}°${degreetype} and a low of ${forecast.low}°${degreetype}.`;
        }
      }
      weatherBox.content = `In ${json.location.name} it's ${json.current.temperature}°${degreetype} and ${skytext} right now. ${forecastString}`;
    } else {
      weatherBox.content = 'Having trouble fetching the weather for you :(';
    }
  });
}

function doTheTweets() {
  for (var which in config.twitter) {
    // Gigantor hack: first twitter account gets spoken by the party parrot.
    if (which == 0) {
      twitterbot.getTweet(config.twitter[which]).then(function(tweet) {
        if (config.say === 'bunny') {
          parrotBox.content = bunnySay(tweet.text);
          screen.render();
        } else if (config.say === 'llama') {
          parrotBox.content = llamaSay(tweet.text);
          screen.render();
        } else if (config.say === 'cat') {
          parrotBox.content = catSay(tweet.text);
          screen.render();
        } else {
          parrotSay(tweet.text).then(function(text) {
            parrotBox.content = text;
            screen.render();
          });
        }
      },function(error) {
        // Just in case we don't have tweets.
        parrotSay('Hi! You\'re doing great!!!').then(function(text) {
          parrotBox.content = text;
          screen.render();
        });
      });
    } else {
      twitterbot.getTweet(config.twitter[which]).then(function(tweet) {
        tweetBoxes[tweet.bot.toLowerCase()].content = tweet.text;
        screen.render();
      },function(error) {
        tweetBoxes[config.twitter[1]].content =
        tweetBoxes[config.twitter[2]].content =
        'Can\'t read Twitter without some API keys  🐰. Maybe try the scraping version instead?';
      });
    }
  }
}

function doTheCodes() {
  var todayCommits = 0;
  var weekCommits = 0;

  var today = spawn('sh ' + __dirname + '/standup-helper.sh', ['-m ' + config.depth, config.repos], {shell:true});
  todayBox.content = '';
  today.stdout.on('data', data => {
    todayCommits = getCommits(`${data}`, todayBox);
    updateCommitsGraph(todayCommits, weekCommits);
    screen.render();
  });

  var week = spawn('sh ' + __dirname + '/standup-helper.sh', ['-m ' + config.depth + ' -d 7', config.repos], {shell:true});
  weekBox.content = '';
  week.stdout.on('data', data => {
    weekCommits = getCommits(`${data}`, weekBox);
    updateCommitsGraph(todayCommits, weekCommits);
    screen.render();
  });
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

function makeGraphBox(label, height) {
  var options = makeBox(label);
  options.barWidth= 5;
  options.xOffset= 4;
  options.maxHeight= height;
  return options;
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
  var nothingRegex = /Seems like .* did nothing/i;
  for (var i = 0; i < lines.length; i++) {
    // If it's a path
    if (lines[i][0] === '/') {
      lines[i] = formatRepoName(lines[i], '/')
    } else if(lines[i][0] === '\\') {
      lines[i] = formatRepoName(lines[i], '\\')
    } else {
      // It may be a mean "seems like .. did nothing!" message. Skip it
      var nothing = lines[i].match(nothingRegex);
      if (nothing) {
        lines[i] = '';
        continue;
      }

      // It's a commit.
      var matches = lines[i].match(regex);
      if (matches) {
        lines[i] = chalk.red(matches[1]) + ' ' + matches[2] + ' ' +
            chalk.green(matches[3])
      }
    }
  }
  return lines.join('\n');
}

function formatRepoName(line, divider) {
  var path = line.split(divider);
  return '\n' + chalk.yellow(path[path.length - 1]);
}

function llamaSay(text) {
  return `
    ${text}
    ∩∩
　（･ω･）
　　│ │
　　│ └─┐○
　  ヽ　　　丿
　　 　∥￣∥`;
}

function catSay(text) {
  return `
      ${text}

      ♪ ガンバレ! ♪
  ミ ゛ミ ∧＿∧ ミ゛ミ
  ミ ミ ( ・∀・ )ミ゛ミ
   ゛゛ ＼　　　／゛゛
   　　 　i⌒ヽ ｜
  　　 　 (＿) ノ
   　　　　　 ∪`
    ;
}
