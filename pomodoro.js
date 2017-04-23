
// options (object)
// options.onTick (function) -  Runs on every tick
// options.onComplete (function) - Runs when pomodoro completed

var Pomodoro = function(options) {
  var _setIntervalId = null;
  var _defaultDuration = 20; // Default duration: 20 Min
  var _durationRemaining = 0; // In seconds


  var _onTick = function() {
    if (_durationRemaining < 1) {
      clearInterval(_setIntervalId);
      _durationRemaining = 0;
      _setIntervalId = null;
      return options.onComplete && options.onComplete();
    }
    _durationRemaining -=  1;
    if (options.onTick) {
      var remainingTime = ('0' + Math.floor(_durationRemaining/60)).slice(-2) + ':' + ('0' + _durationRemaining % 60).slice(-2);
      options.onTick(remainingTime);
    }
  }

  var exports = {
    start: function() {
      if (_setIntervalId !== null) clearInterval(_setIntervalId);
      _durationRemaining = _defaultDuration * 60 ;
      _setIntervalId = setInterval(_onTick, 1000)
    },

    stop: function() {
      clearInterval(_setIntervalId)
      _durationRemaining = 0;
      _setIntervalId = null;
    },

    updateDuration() {
      if (_defaultDuration === 60) _defaultDuration = 5;
      else _defaultDuration += 5;
    },

    getDefaultDuration() {
      return _defaultDuration;
    },
  }

  return exports;
}



module.exports = Pomodoro;
