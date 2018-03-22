var Storage = require('node-storage');
var moment = require('moment');
var store = new Storage(__dirname + '/storage/pomodoro.json');

var States = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  IN_BREAK: 'in_break',
  PAUSED: 'paused',
};


// options (object)
// options.onTick (function) -  Runs on every tick
// options.onBreakStarts (function) - Runs when break starts
// options.onBreakEnds (function) - Runs when break ends
var pomodoro = function(options) {
  var _setIntervalId = null;
  var _runningDuration = options.runningDuration; // Default pomodoro duration: 20 Min
  var _breakDuration = options.breakDuration;    // Default break duration: 5 Min
  var _runningDurationRemaining = 0; // In seconds
  var _breakDurationRemaining = 0;   // In seconds
  var _currentState = States.STOPPED;

  var _onTick = function() {
    switch (_currentState) {
      case States.RUNNING: _handleTickOnRunning(); break;
      case States.IN_BREAK: _handleTickOnBreak(); break;
      case States.STOPPED: _handleTickOnStopped(); break;
      case States.PAUSED: return;
    }
  }

  var _handleTickOnRunning = function() {
    if (_runningDurationRemaining < 1) {
      _runningDurationRemaining = 0;
      _breakDurationRemaining = _breakDuration * 60;
      _currentState = States.IN_BREAK
      options.onBreakStarts && options.onBreakStarts();
      pomodoroStorage.addNewPomodoro(moment().subtract(_runningDuration, 'minutes').toDate(), moment().toDate())

    } else {
      _runningDurationRemaining -= 1;
      if (options.onTick) options.onTick()
    }
  };

  var _handleTickOnBreak = function() {
    if (_breakDurationRemaining < 1) {
      _breakDurationRemaining = 0;
      _runningDurationRemaining = _runningDuration * 60;
      _currentState = States.RUNNING
      options.onBreakEnds && options.onBreakEnds();
    } else {
      _breakDurationRemaining -= 1;
      if (options.onTick) options.onTick()
    }
  };

  var _handleTickOnStopped = function() {
    clearInterval(_setIntervalId)
    _runningDurationRemaining = 0;
    _breakDurationRemaining = 0;
    _setIntervalId = null;
  };

  var exports = {
    start: function() {
      if (_setIntervalId !== null) clearInterval(_setIntervalId);
      _runningDurationRemaining = _runningDuration * 60;
      _setIntervalId = setInterval(_onTick, 1000);
      _currentState = States.RUNNING;
    },

    stop: function() {
      _currentState = States.STOPPED;
    },

    pause: function() {
      _currentState = States.PAUSED;
    },

    resume: function() {
      _currentState = _breakDurationRemaining ? States.IN_BREAK : States.RUNNING;
    },

    updateRunningDuration() {
      if (_runningDuration >= 60) _runningDuration = 1;
      else _runningDuration += 1;
    },

    updateBreakDuration() {
      if (_breakDuration >= 60) _breakDuration = 1;
      else _breakDuration += 1;
    },

    getRunningDuration() {
      return _runningDuration;
    },

    getBreakDuration() {
      return _breakDuration;
    },

    getRemainingTime() {
      var remainingTime;
      switch (_currentState) {
        case States.RUNNING: remainingTime =  _runningDurationRemaining; break;
        case States.IN_BREAK: remainingTime = _breakDurationRemaining; break;
        case States.STOPPED: remainingTime = _runningDuration * 60; break;
        case States.PAUSED: remainingTime = _runningDurationRemaining || _breakDurationRemaining;
      }
      return ('0' + Math.floor(remainingTime/60)).slice(-2) + ':' + ('0' + remainingTime % 60).slice(-2);
    },

    getHistory(type) {
      return pomodoroStorage.getHistory(type);
    },

    isRunning() {
      return _currentState === States.RUNNING;
    },

    isInBreak() {
      return _currentState === States.IN_BREAK;
    },

    isPaused() {
      return _currentState === States.PAUSED;
    },

    isStopped() {
      return _currentState === States.STOPPED;
    },
  }

  return exports;
}


module.exports = pomodoro;


var pomodoroStorage = {
  addNewPomodoro: function(startDate, endDate) {
    var pomodoros = store.get('pomodoros') || [];
    pomodoros.push({ startDate, endDate })
    store.put('pomodoros', pomodoros);
  },

  // type = day/week/month/year
  getHistory(type) {
    var pomodoros = store.get('pomodoros') || [];
    if (type) {
      pomodoros = pomodoros.filter(item => moment().isSame(item.endDate, type));
    }
    var duration = pomodoros.reduce((total, p) => total + moment(p.endDate).diff(p.startDate), 0);
    duration = moment.duration(duration);
    return {
      count: pomodoros.length,
      duration: `${Math.floor(duration.asHours())}h:${duration.minutes()}m`,
    };
  }
}
