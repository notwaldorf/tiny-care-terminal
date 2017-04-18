var config = {};
// Accounts to read the last tweet from. The first one in the list will be
// spoken by the party parrot.
config.twitter = process.env.TTC_BOTS || 'tinycarebot,selfcare_bot,magicrealismbot';
config.twitter = config.twitter.split(',')

// Set this to false if you want to scrape twitter.com instead of using
// API keys. The tweets may include RTs in this case :(
config.apiKeys = process.env.TTC_APIKEYS || 'true';
config.apiKeys = config.apiKeys === 'true' ? true : false;

// Directories in which to run git-standup on for a list of your recent commits.
config.repos = process.env.TTC_REPOS || '~/Code';
config.repos = config.repos.split(',').join(' ');

// Where to check the weather for. This can be a zip code or a location name
// So both 90210 and "San Francisco, CA" should be ok.
// It's using weather.service.msn.com behind the curtains.
config.weather = process.env.TTC_WEATHER || 'San Francisco';

// Set to false if you're an imperial savage. <3
config.celsius = process.env.TTC_CELSIUS || 'true';
config.celsius = config.celsius === 'true' ? true : false;

config.updateInterval = parseFloat(process.env.TTC_UPDATE_INTERVAL) || 20;

config.keys = {};
config.keys.consumer_key = process.env.CONSUMER_KEY || 'none';
config.keys.consumer_secret = process.env.CONSUMER_SECRET || 'none';
config.keys.access_token = process.env.ACCESS_TOKEN || 'none';
config.keys.access_token_secret = process.env.ACCESS_TOKEN_SECRET || 'none';

module.exports = config;
