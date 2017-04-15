var env = require('node-env-file');
env(__dirname + '/.env');

var config = {};

// What you want to see
config.settings = {
  // Accounts to read the last tweet from. The first one in the list will be
  // spoken by the party parrot.
  twitter: ['tinycarebot', 'selfcare_bot', 'magicrealismbot'],

  // Set this to false if you want to scrape twitter.com instead of using
  // API keys. The tweets may include RTs in this case :(
  apiKeys: true,

  // Directories in which to run git-standup on for a list of your recent commits.
  repos: ['~/Code'],

  // Zip code to check the weather for.
  zipcode: ['94133'],

  // Set to false if you're an imperial savage. <3
  celsius: true
}

// From the .env file
config.twitter = {};
config.twitter.consumer_key = process.env.CONSUMER_KEY;
config.twitter.consumer_secret = process.env.CONSUMER_SECRET;
config.twitter.access_token = process.env.ACCESS_TOKEN;
config.twitter.access_token_secret = process.env.ACCESS_TOKEN_SECRET;

module.exports = config;
