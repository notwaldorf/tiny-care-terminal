/*
 * Utility function that returns a promise with the last tweet
 * from a user
 *
 * Usage:
 * getTweet().then(function(message) {
 *   console.log(message)
 * });
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

var options = {exclude_replies:true, count: 1 };

function getTweet(who) {
  options.screen_name = who || 'tinycarebot';
  return new Promise(function (resolve, reject) {
    T.get('statuses/user_timeline', options, function(err, data) {
      if (err) {
        reject(reason);
      } else {
        resolve({text:data[0].text, bot: data[0].user.screen_name});
      }
    });
  });
}

module.exports.getTweet = getTweet;
