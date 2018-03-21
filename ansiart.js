var ansiArt = require('ansi-art').default;
var cowsay = require("cowsay");
var bunnySay = require('sign-bunny');
var yosay = require('yosay');

var llamaSay = function(text) {
  return `
    ${text}

    ∩∩
　（･ω･）
　　│ │
　　│ └─┐○
　  ヽ　　　丿
　　 　∥￣∥`;
}

var catSay = function(text) {
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

function getAnsiArt(art, textToSay) {
  if (/.ansi$/.test(art)) {
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
    switch (art) {
      case 'bunny' : return bunnySay(textToSay);
      case 'llama' : return llamaSay(textToSay);
      case 'cat'   : return catSay(textToSay);
      case 'yeoman': return yosay(textToSay);
      default : return ansiArt.get({ artName: art, speechText: textToSay });
    }
  }
}

module.exports = getAnsiArt;
