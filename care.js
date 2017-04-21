#!/usr/bin/env node
const config     = require(__dirname + '/config.js');
const twitterbot = require(__dirname + '/twitterbot.js');

const spawn     = require('child_process').spawn;
const blessed   = require('blessed');
const contrib   = require('blessed-contrib');
const chalk     = require('chalk');
const parrotSay = require('parrotsay-api');
const weather   = require('weather-js');

const screen = blessed.screen(
  {
    fullUnicode: true, // emoji or bust
    smartCSR:    true,
    autoPadding: true,
    title:       '✨💖 tiny care terminal 💖✨'
  });

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0));

// Refresh on r, or Control-R.
screen.key(['r', 'C-r'], (ch, key) => tick());

const grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

// grid.set(row, col, rowSpan, colSpan, obj, opts)
const weatherBox = grid.set(0, 8, 2, 4, blessed.box, makeScrollBox(' 🌤 '));
const todayBox   = grid.set(0, 0, 6, 6, blessed.box, makeScrollBox(' 📝  Today '));
const weekBox    = grid.set(6, 0, 6, 6, blessed.box, makeScrollBox(' 📝  Week '));
const commits    = grid.set(0, 6, 6, 2, contrib.bar, {label: 'Commits', barWidth: 5, xOffset: 4, maxHeight: 10});
const parrotBox  = grid.set(6, 6, 6, 6, blessed.box, makeScrollBox(''));

const tweetBoxes              = {};
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
  weather.find({search: config.weather, degreeType: config.celsius ? 'C' : 'F'}, (err, result) => {
    if (result && result[0] && result[0].current) {
      const json            = result[0];
      // TODO: add emoji for this thing.
      const skytext         = json.current.skytext.toLowerCase();
      const currentDay      = json.current.day;
      const skytextForecast = json.find((forecast) => forecast.day === currentDay).skytextday.toLowerCase();
      const forecastString  = `Today, it will be ${skytextForecast} with the forecasted high of ${forecast.high}°${degreetype} and a low of ${forecast.low}°${degreetype}.`;
      const degreetype      = json.location.degreetype;
      weatherBox.content    = `In ${json.location.name} it's ${json.current.temperature}°${degreetype} and ${skytext} right now. ${forecastString}`;
    } else {
      weatherBox.content = 'Having trouble fetching the weather for you :(';
    }
  });
}

function doTheTweets() {
  for (const which in config.twitter) {
    // Gigantor hack: first twitter account gets spoken by the party parrot.
    if (which == 0) {
      twitterbot.getTweet(config.twitter[which]).then((tweet) => {
        parrotSay(tweet.text).then((text) => {
          parrotBox.content = text;
          screen.render();
        });
      }, (error) => {
        // Just in case we don't have tweets.
        parrotSay('Hi! You\'re doing great!!!').then((text) => {
          parrotBox.content = text;
          screen.render();
        });
      });
    } else {
      twitterbot.getTweet(config.twitter[which]).then((tweet) => {
        tweetBoxes[tweet.bot.toLowerCase()].content = tweet.text;
        screen.render();
      }, (error) => {
        tweetBoxes[config.twitter[1]].content =
          tweetBoxes[config.twitter[2]].content =
            'Can\'t read Twitter without some API keys  🐰. Maybe try the scraping version instead?';
      });
    }
  }
}

function doTheCodes() {
  let todayCommits = 0;
  let weekCommits  = 0;

  const today      = spawn('sh ' + __dirname + '/standup-helper.sh', [config.repos], {shell: true});
  todayBox.content = '';
  today.stdout.on('data', data => {
    todayCommits = getCommits(`${data}`, todayBox);
    updateCommitsGraph(todayCommits, weekCommits);
    screen.render();
  });

  const week      = spawn('sh ' + __dirname + '/standup-helper.sh', ['-d 7', config.repos], {shell: true});
  weekBox.content = '';
  week.stdout.on('data', data => {
    weekCommits = getCommits(`${data}`, weekBox);
    updateCommitsGraph(todayCommits, weekCommits);
    screen.render();
  });
}

function makeBox(label) {
  return {
    label:  label,
    tags:   true,
    border: {
      type: 'line'  // or bg
    },
    style:  {
      fg:     'white',
      border: {fg: 'cyan'},
      hover:  {border: {fg: 'green'},}
    }
  };
}

function makeScrollBox(label) {
  const options           = makeBox(label);
  options.scrollable      = true;
  options.scrollbar       = {ch: ' '};
  options.style.scrollbar = {bg: 'green', fg: 'white'};
  options.keys            = true;
  options.vi              = true;
  options.alwaysScroll    = true;
  options.mouse           = true;
  return options;
}

const commitRegex = /(.......) (- .*)/g;
function getCommits(data, box) {
  box.content += colorizeLog(data);
  return (box.content.match(commitRegex) || []).length;
}

function updateCommitsGraph(today, week) {
  commits.setData({titles: ['today', 'week'], data: [today, week]});
}

function colorizeLog(text) {
  const lines = text.split('\n');
  const regex = /(.......) (- .*) (\(.*\)) (<.*>)/i;
  return lines.map((line) => {
    // If it's a path
    if (line[0] === '/' || line[0] === '\\') {
      return `\n${chalk.red(line)}`;
    } else {
      // It's a commit.
      const matches = line.match(regex);
      if (matches) {
        return `${chalk.red(matches[1])} ${matches[2]} ${chalk.green(matches[3])}`;
      }
    }
  }).join('\n');
}
