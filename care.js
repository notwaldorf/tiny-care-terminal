#!/usr/bin/env node
var config = require(__dirname + '/config.js');
var twitterbot = require(__dirname + '/twitterbot.js');
var gitbot = require(__dirname + '/gitbot.js');
var pomodoro = require(__dirname + '/pomodoro.js');
var ansiArt = require('ansi-art').default;

var notifier = require('node-notifier');
var spawn = require('child_process').spawn;
var blessed = require('blessed');
var contrib = require('blessed-contrib');
var chalk = require('chalk');
var bunnySay = require('sign-bunny');
var yosay = require('yosay');
var weather = require('weather-js');

var TODAY_BOX_LABEL = ' 📝  Today ';
var WEEK_BOX_LABEL = ' 📝  Week ';

var inPomodoroMode = false;

var screen = blessed.screen(
    {fullUnicode: true, // emoji or bust
     smartCSR: true,
     autoPadding: true,
     title: config.terminal_title
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
  if (!inPomodoroMode) {
    return;
  } else if (pomodoroObject.isStopped()) {
    pomodoroObject.start();
  } else if (pomodoroObject.isPaused()) {
    pomodoroObject.resume();
  } else {
    pomodoroObject.pause();
    pomodoroHandlers.onTick();
  }
});

screen.key(['e', 'C-e'], function(ch, key) {
  if (inPomodoroMode) {
    pomodoroObject.stop();
    pomodoroHandlers.onTick();
  }
});

screen.key(['u', 'C-u'], function(ch, key) {
  if (inPomodoroMode) {
    pomodoroObject.updateRunningDuration();
    pomodoroHandlers.onTick();
  }
});

screen.key(['b', 'C-b'], function(ch, key) {
  if (inPomodoroMode) {
    pomodoroObject.updateBreakDuration();
    pomodoroHandlers.onTick()
  }
});

screen.key(['p', 'C-p'], function(ch, key) {
  if (inPomodoroMode) {
    pomodoroObject.stop();
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
var boxes = buildBoxes(config.commitsGraph);
var weatherBox =  boxes.weather;
var todayBox = boxes.today;
var weekBox = boxes.week;
var commits = boxes.commits;
var parrotBox = boxes.parrot;
var tweetBoxes = boxes.tweets;

tick();
setInterval(tick, 1000 * 60 * config.updateInterval);

function tick() {
  doTheWeather();
  doTheTweets();
  doTheCodes();
}

function buildBoxes(showCommitsGraph) {
  var firstQuadrant = buildFirstQuadrantBoxes(showCommitsGraph);

  return {
    today: buildTodayBox(),
    week: buildWeekBox(),
    tweets: firstQuadrant.tweets,
    weather: firstQuadrant.weather,
    commits: firstQuadrant.commits,
    parrot: buildParrotBox()
  };
}

function buildFirstQuadrantBoxes(showCommitsGraph) {
  var col = 6, colSpan = 6;

  if (showCommitsGraph) {
    col += 2;
    colSpan -= 2;
  }

  return {
    tweets: buildTweetBoxes(col, colSpan),
    weather: buildWeatherBox(col, colSpan),
    commits: (showCommitsGraph) ? buildCommitsGraphBox() : null
  };
}

// grid.set(row, col, rowSpan, colSpan, obj, opts)
function buildTweetBoxes(col, colSpan) {
  var boxes = {};
  boxes[config.twitter[1]] = grid.set(2, col, 2, colSpan, blessed.box, makeBox(' 💖 '));
  boxes[config.twitter[2]] = grid.set(4, col, 2, colSpan, blessed.box, makeBox(' 💬 '));
  return boxes;
}

function buildWeatherBox(col, colSpan) {
  return grid.set(0, col, 2, colSpan, blessed.box, makeScrollBox(' 🌤 '));
}

function buildCommitsGraphBox() {
  return grid.set(0, 6, 6, 2, contrib.bar, makeGraphBox('Commits'));
}

function buildTodayBox() {
  return grid.set(0, 0, 6, 6, blessed.box, makeScrollBox(TODAY_BOX_LABEL));
}

function buildWeekBox() {
  return grid.set(6, 0, 6, 6, blessed.box, makeScrollBox(WEEK_BOX_LABEL));
}

function buildParrotBox() {
  return grid.set(6, 6, 6, 6, blessed.box, makeScrollBox(''));
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
      if (inPomodoroMode) {
        return;
      }
      twitterbot.getTweet(config.twitter[which]).then(function(tweet) {
        parrotBox.content = getAnsiArt(tweet.text)
        screen.render();
      },function(error) {
        // Just in case we don't have tweets.
        parrotBox.content = getAnsiArt('Hi! You\'re doing great!!!')
        screen.render();
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

  function getNumCommits(commits) {
    var commitRegex = /(.......) (- .*)/g;
    return (commits) ? (commits.match(commitRegex) || []).length : '0';
  }

  function updateBoxContent(box, content, numCommits) {
    var colorContent = colorizeLog(content || '');
    box.content += colorContent;

    if (!config.commitsGraph) {
      var label = (box === todayBox) ? TODAY_BOX_LABEL : WEEK_BOX_LABEL;
      box.setLabel(`${label} (${numCommits})`);
    }

    return box;
  }

  function updateWeekCommits(commits) {
    weekCommits += getNumCommits(commits);

    updateBoxContent(weekBox, commits, weekCommits);
    updateCommitsGraph(todayCommits, weekCommits);

    screen.render();
  }

  function updateTodayCommits(commits) {
    todayCommits += getNumCommits(commits);

    updateBoxContent(todayBox, commits, todayCommits);
    updateCommitsGraph(todayCommits, weekCommits);

    screen.render();
  }

  if (config.gitbot.toLowerCase() === 'gitstandup') {
    var today = spawn('sh ' + __dirname + '/standup-helper.sh', ['-m ' + config.depth, config.repos], {shell:true});
    todayBox.content = '';
    today.stdout.on('data', data => { updateTodayCommits(`${data}`); });

    var week = spawn('sh ' + __dirname + '/standup-helper.sh', ['-m ' + config.depth + ' -d 7', config.repos], {shell:true});
    weekBox.content = '';
    week.stdout.on('data', data => { updateWeekCommits(`${data}`); });
  } else {
    gitbot.findGitRepos(config.repos, config.depth-1, (err, allRepos) => {
      if (err) {
        return todayBox.content = err;
        screen.render();
      }
      gitbot.getCommitsFromRepos(allRepos, 1, (err, data) => {
        if (err) {
          return todayBox.content = err;
          screen.render();
        }
        todayBox.content = '';
        updateTodayCommits(`${data}`);
      });
      gitbot.getCommitsFromRepos(allRepos, 7, (err, data) => {
        if (err) {
          return weekBox.content = err;
          screen.render();
        }
        weekBox.content = '';
        updateWeekCommits(`${data}`);
      });
    });
  }
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

function updateCommitsGraph(today, week) {
  if (commits) {
    commits.setData({titles: ['today', 'week'], data: [today, week]})
  }
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

function getAnsiArt(textToSay) {
  var artFileRegex = /.ansi$/;

  // If config.say is custom art file path, then return custom art
  if (artFileRegex.test(config.say)) {
    return ansiArt.get({ filePath: config.say, speechText: textToSay });
  }

  switch (config.say) {
    case 'bunny' : return bunnySay(textToSay);
    case 'llama' : return llamaSay(textToSay);
    case 'cat'   : return catSay(textToSay);
    case 'yeoman': return yosay(textToSay);
    default : return ansiArt.get({ artName: config.say, speechText: textToSay });
  }
}

var pomodoroHandlers = {
  onTick: function() {
    if (!inPomodoroMode) return;
    var remainingTime = pomodoroObject.getRemainingTime();

    var statusText = '';
    if (pomodoroObject.isInBreak()) {
      statusText = ' (Break Started) ';
    } else if (pomodoroObject.isStopped()) {
      statusText = ' (Press "s" to start) ';
    } else if (pomodoroObject.isPaused()) {
      statusText = ' (Press "s" to resume) ';
    }

    var content = `In Pomodoro Mode: ${remainingTime} ${statusText}`;
    var metaData = `Duration: ${pomodoroObject.getRunningDuration()} Minutes,  Break Time: ${pomodoroObject.getBreakDuration()} Minutes\n`;
    metaData += 'commands: \n s - start/pause/resume \n e - stop \n u - update duration \n b - update break time';
    parrotBox.content = getAnsiArt(content) + metaData;
    screen.render();
  },

  onBreakStarts: function() {
    if (inPomodoroMode) {
      notifier.notify({
        title: 'Pomodoro Alert',
        message: 'Break Time!',
        sound: true,
        timeout: 30,
      });
    }
  },

  onBreakEnds: function() {
    if (inPomodoroMode) {
      notifier.notify({
        title: 'Pomodoro Alert',
        message: 'Break Time Ends!',
        sound: true,
        timeout: 30,
      });
    }
  },
}

var pomodoroObject = pomodoro(pomodoroHandlers);
