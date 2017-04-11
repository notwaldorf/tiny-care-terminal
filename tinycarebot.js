/*
 * Prints the last tweet from @tinycarebot.
 *
 * Usage: `node tinycarebot.js`
 */
var Twit = require('twit');
var env = require('node-env-file');

env(__dirname + '/.env');

var T = new Twit({
  consumer_key:process.env.CONSUMER_KEY,
  consumer_secret:process.env.CONSUMER_SECRET,
  access_token:process.env.ACCESS_TOKEN,
  access_token_secret:process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

var options = { screen_name: 'tinycarebot', exclude_replies:true, count: 1 };

getTweet().then(updateScreen);

function getTweet() {
  return new Promise(function (resolve, reject) {
    T.get('statuses/user_timeline', options , function(err, data) {
      if (err) {
        reject(reason);
      } else {
        resolve(data[0].text);
      }
    });
  });
}

function updateScreen(message) {
  console.log(message);
}
