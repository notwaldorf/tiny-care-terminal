var Twit = require('twit');
var config = require(__dirname + '/config.js');
var request = require('request');
var cheerio = require('cheerio');

var T = new Twit({
  consumer_key:        config.keys.consumer_key,
  consumer_secret:     config.keys.consumer_secret,
  access_token:        config.keys.access_token,
  access_token_secret: config.keys.access_token_secret,
  timeout_ms:          60*1000,  // optional HTTP request timeout to apply to all requests.
});

var options = {exclude_replies:true, include_rts:false, count: 1, 'tweet_mode': 'extended' };

function getTweet(who) {
  who = who || 'tinycarebot';
  return config.apiKeys ? apiTweet(who) : scrapeTweet(who);
}

function apiTweet(who) {
  options.screen_name = who;
  return new Promise(function (resolve, reject) {
    T.get('statuses/user_timeline', options, function(err, data) {
      if (err) {
        reject('This didn\'t work. Maybe you didn\'t set up the twitter API keys?');
      } else {
        resolve({text:data[0].full_text, bot: data[0].user.screen_name});
      }
    });
  });
}

function scrapeTweet(who) {
  return new Promise(function (resolve, reject) {
    request({
      method: 'GET',
      url: 'https://twitter.com/' + who
    }, (err, res, body) => {
      if (err) {
        reject("Can't scrape tweets. Maybe the user is private or doesn't exist?\n" + err);
      }
      let $ = cheerio.load(body);
      let tweets = $('.js-tweet-text.tweet-text');

      randomTweetNumber = Math.round(Math.random() * tweets.length-1);
      let tweet = tweets.filter(function (i, el) {
        return i == randomTweetNumber
      });

      resolve({
        text: tweet.text(),
        bot: who
      });
    });
  });
}

module.exports.getTweet = getTweet;
