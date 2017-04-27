#!/usr/bin/env node
var config = require(__dirname + '/config.js');
var twitterbot = require(__dirname + '/twitterbot.js');
var notifier = require('node-notifier');
var Pomodoro = require(__dirname + '/pomodoro.js');

var spawn = require('child_process').spawn;
var blessed = require('blessed');
var contrib = require('blessed-contrib');
var chalk = require('chalk');
var parrotSay = require('parrotsay-api');
var bunnySay = require('sign-bunny');
var weather = require('weather-js');

var inPomodoroMode = false;

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

screen.key(['s', 'C-s'], function(ch, key) {
  if (!inPomodoroMode) return;
  if (pomodoro.isStopped()) return pomodoro.start();
  if (pomodoro.isPaused()) return pomodoro.resume();
  pomodoro.pause();
  pomodoroHandlers.onTick()
});
screen.key(['e', 'C-e'], function(ch, key) {
  if (!inPomodoroMode) return;
  pomodoro.stop();
  pomodoroHandlers.onTick()
});

screen.key(['u', 'C-u'], function(ch, key) {
  if (!inPomodoroMode) return;
  pomodoro.updateRunningDuration();
  pomodoroHandlers.onTick()
});

screen.key(['b', 'C-b'], function(ch, key) {
  if (!inPomodoroMode) return;
  pomodoro.updateBreakDuration();
  pomodoroHandlers.onTick()
});

screen.key(['p', 'C-p'], function(ch, key) {
  if (inPomodoroMode) {
    pomodoro.stop();
    inPomodoroMode = false;
    doTheTweets();
    parrotBox.removeLabel('');
  } else {
    parrotBox.setLabel(' 🍅 ');
    inPomodoroMode = true;
    pomodoroHandlers.onTick()
  }
});

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

// grid.set(row, col, rowSpan, colSpan, obj, opts)
var weatherBox = grid.set(0, 8, 2, 4, blessed.box, makeScrollBox(' 🌤 '));
var todayBox = grid.set(0, 0, 6, 6, blessed.box, makeScrollBox(' 📝  Today '));
var weekBox = grid.set(6, 0, 6, 6, blessed.box, makeScrollBox(' 📝  Week '));
var commits = grid.set(0, 6, 6, 2, contrib.bar, makeGraphBox('Commits'));
var parrotBox = grid.set(6, 6, 6, 6, blessed.box, makeScrollBox(''));

var tweetBoxes = {}
tweetBoxes[config.twitter[1]] = grid.set(2, 8, 2, 4, blessed.box, makeBox(' 💖 '));
tweetBoxes[config.twitter[2]] = grid.set(4, 8, 2, 4, blessed.box, makeBox(' 💬 '));

tick();
setInterval(tick, 1000 * 60 * config.updateInterval);

function tick() {
  doTheWeather();
  doTheTweets();
  doTheCodes();
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
      if (inPomodoroMode) return;
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

function makeGraphBox(label) {
  var options = makeBox(label);
  options.barWidth= 5;
  options.xOffset= 4;
  options.maxHeight= 10;
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


var pomodoroHandlers = {
  onTick: function() {
    if (!inPomodoroMode) return;
    var remainingTime = pomodoro.getRemainingTime();
    var statusText = ''
    if (pomodoro.isInBreak()) statusText = ' (Break Started) ';
    if (pomodoro.isStopped()) statusText = ' (Press "s" to start) ';
    if (pomodoro.isRunning()) statusText = '';
    if (pomodoro.isPaused())  statusText = ' (Press "s" to resume) ';

    var content = `In Pomodoro Mode: ${remainingTime} ${statusText}`;
    var metaData = `Duration: ${pomodoro.getRunningDuration()} Minutes,  Break Time: ${pomodoro.getBreakDuration()} Minutes\n`;
    metaData += 'commands: \n s - start/pause/resume \n e - stop \n u - update duration \n b - update break time';

    parrotSay(content).then(function(text) {
      parrotBox.content = text + metaData;
      screen.render();
    });
  },

  onBreakStarts: function() {
    if (!inPomodoroMode) return;
    notifier.notify({
      title: 'Pomodoro Alert',
      message: 'Break Time!',
      sound: true,
      timeout: 30,
    });
  },

  onBreakEnds: function() {
    if (!inPomodoroMode) return;
    notifier.notify({
      title: 'Pomodoro Alert',
      message: 'Break Time Ends!',
      sound: true,
      timeout: 30,
    });
  },
}

var pomodoro = Pomodoro(pomodoroHandlers);
