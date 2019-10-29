var path = require('path');
var ansiArt = require('ansi-art').default;
var cowsay = require('cowsay');
var getCustomArt = require('./arts');

function getAnsiArt(art, textToSay) {
  
  if (art && (art.toUpperCase() === 'RANDOM')) {
    // show a random art
    var rand = Math.random() * 100;
    if (rand >= 50) { // 50%
      return cowsay.say({
        r: true,
        text: textToSay
      });
    } else if (rand >= 25) { // 25%
      return ansiArt.get({
        speechText: textToSay
      });
    } else { // 25%
      return getCustomArt(art, textToSay) || ansiArt.get({
        speechText: textToSay
      });
    }
  } 
  
  else if (/.ansi$/.test(art)) {
    // if SAY ends with ".ansi" use the 'ansi-art' library
    if (art === path.basename(art)) {
      return ansiArt.get({
        artName: art.slice(0,-5),
        speechText: textToSay
      });
    } else {
      return ansiArt.get({
        filePath: art,
        speechText: textToSay
      });
    }
  }

  else if (/.cow$/.test(art)) {
    // if SAY ends with ".cow" use the 'cowsay' library
    return cowsay.say({
      f: art.slice(0,-4),
      text: textToSay
    });
  }

  else {
    return getCustomArt(art, textToSay) || ansiArt.get({
      artName: art,
      speechText: textToSay
    });
  }
}

module.exports = getAnsiArt;
