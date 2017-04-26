var Twit = require('twit');
var config = require(__dirname + '/config.js');
var scraperjs = require('scraperjs');

var T = new Twit({
  consumer_key:        config.keys.consumer_key,
  consumer_secret:     config.keys.consumer_secret,
  access_token:        config.keys.access_token,
  access_token_secret: config.keys.access_token_secret,
  timeout_ms:          60*1000,  // optional HTTP request timeout to apply to all requests.
});

var options = {exclude_replies:true, include_rts:false, count: 1 };

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
        resolve({text:data[0].text, bot: data[0].user.screen_name});
      }
    });
  });
}

function scrapeTweet(who) {
  return new Promise(function (resolve, reject) {
    scraperjs.StaticScraper.create('https://twitter.com/' + who)
        .scrape(function($) {
            return $(".js-tweet-text.tweet-text").map(function() {
                return $(this).text();
            }).get();
        })
        .then(function(tweets) {
          var tweetNumber = Math.floor(Math.random() * tweets.length);
          resolve({text:tweets[tweetNumber], bot: who});
        },function(error) {
          reject('Can\'t scrape tweets. Maybe the user is private or doesn\'t exist?');
        });
  });
}

module.exports.getTweet = getTweet;
