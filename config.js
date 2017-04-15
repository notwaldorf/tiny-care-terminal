var env = require('node-env-file');
env(__dirname + '/.env');

var config = {};

// Accounts to read the last tweet from. The first one in the list will be
// spoken by the party parrot. The label is be used to label the tweet box.
config.twitter = [
    {user: 'tinycarebot', 'label': ' 💧 '},
    {user: 'selfcare_bot', 'label': ' 💖 '},
    {user: 'magicrealismbot', 'label': ' 💬 '}
  ];

// Set this to false if you want to scrape twitter.com instead of using
// API keys. The tweets may include RTs in this case :(
config.apiKeys = true;

// Directories in which to run git-standup on for a list of your recent commits.
config.repos = ['~/Code'];

// Zip code to check the weather for.
config.zipcode = ['94133'];

// Set to false if you're an imperial savage. <3
config.celsius = true;


// From the .env file
config.keys = {};
config.keys.consumer_key = process.env.CONSUMER_KEY;
config.keys.consumer_secret = process.env.CONSUMER_SECRET;
config.keys.access_token = process.env.ACCESS_TOKEN;
config.keys.access_token_secret = process.env.ACCESS_TOKEN_SECRET;

module.exports = config;
