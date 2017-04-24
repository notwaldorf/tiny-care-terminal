const config = require(__dirname + '/config.js');
const path = require('path');
const Timr = require('timrjs');
const notifier = require('node-notifier');
const store = require('piggy-bank')(
  path.join(require('os').homedir(), '.tinycarepomodoro.json')
);

function init(box, screen, statsBox) {
  const default_focus_time = config.pomodoro.default_focus_time;
  const default_break_time = config.pomodoro.default_break_time;
  let timer;

  box.content = defaultMsg();
  refreshPomodoroStats();

  function start() {
    timer = Timr(default_focus_time);
    timer.start();
    updateTimer('⏰', timer, 'Focus Session');

    timer.finish(function() {
      notifier.notify({
        title: '🍅  Pomodoro Timer',
        message: 'Take a break!',
        sound: true
      });

      timer = Timr(default_break_time);
      timer.start();
      updateTimer('☕️', timer, 'Take a Break');

      incrementTodaysCount();

      timer.finish(function() {
        notifier.notify({
          title: '🍅  Pomodoro Timer',
          message: 'Break is over. Ready for another session?',
          sound: true
        });
        box.content = defaultMsg();
        screen.render();
      });
    });
  }

  function updateTimer(emoji, timer, msg) {
    timer.ticker(function({formattedTime}) {
      box.content = ` ${emoji}  ${formattedTime} - ${msg}`;
      screen.render();
    });
  }

  function incrementTodaysCount() {
    const today = getToday();
    store.set(today, (store.get(today) || 0) + 1, {overwrite: true});
    refreshPomodoroStats();
  }

  function refreshPomodoroStats() {
    const today = getToday();
    statsBox.setData({
      titles: ['today', 'week'],
      data: [store.get(today) || 0, getWeekPomodoros()]
    });
    screen.render();
  }

  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  function getWeekPomodoros() {
    let weekPomodoros = 0;
    for (let i = 0; i < 7; i++) {
      let day = new Date();
      day.setDate(day.getDate()-i);
      let count = store.get(day.toISOString().slice(0, 10)) || 0;
      weekPomodoros += count;
    }
    return weekPomodoros;
  }

  function defaultMsg() {
    const today = getToday();
    let default_msg = 'Press s to start and stop a session.'
    if (store.get(today) > 0) {
      default_msg += `\nYou have completed ${store.get(today)} pomodoros today. Hooray!`
    }
    return default_msg;
  }

  function isRunning() {
    return timer && timer.isRunning();
  }

  function stop() {
    if (timer) {
      timer.stop();
      box.content = ` ⏰  Session stopped. \n${defaultMsg()}`;
      screen.render();
    }
  }

  return {
    start: start,
    isRunning: isRunning,
    stop: stop
  }
}

module.exports.init = init;
