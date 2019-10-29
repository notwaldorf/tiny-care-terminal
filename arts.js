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

function getCustomArt(art, textToSay) {
  if (art === 'RANDOM') {
    const arts = ['bunny', 'llama', 'cat', 'yeoman'];
    const random = [Math.round(Math.random*arts.length)];
    art = arts[random];
  }

	switch (art) {
		case 'bunny' : return bunnySay(textToSay);
		case 'llama' : return llamaSay(textToSay);
		case 'cat'   : return catSay(textToSay);
		case 'yeoman': return yosay(textToSay);
		default : return null;
	}
}

module.exports = getCustomArt;