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
var config = require('./config.js');

var T = new Twit({
  consumer_key:config.twitter.consumer_key,
  consumer_secret:config.twitter.consumer_secret,
  access_token:config.twitter.access_token,
  access_token_secret:config.twitter.access_token_secret,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

var options = {exclude_replies:true, include_rts:false, count: 1 };

function getTweet(who) {
  options.screen_name = who || 'tinycarebot';
  return new Promise(function (resolve, reject) {
    T.get('statuses/user_timeline', options, function(err, data) {
      if (err) {
        reject('This didn\'t work. Maybe you didn\'t set up the twitter API keys?');
      } else {
        resolve({text:data[0].text, bot: data[0].user.screen_name});
      }
    });
  });
}

module.exports.getTweet = getTweet;
