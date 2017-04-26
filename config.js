var config = {
  // Accounts to read the last tweet from. The first one in the list will be
  // spoken by the party parrot.
  twitter: (process.env.TTC_BOTS || 'tinycarebot,selfcare_bot,magicrealismbot').split(','),

  // Set this to false if you want to scrape twitter.com instead of using
  // API keys. The tweets may include RTs in this case :(
  apiKeys: (process.env.TTC_APIKEYS || 'true') === 'true',

  // Directories in which to run git-standup on for a list of your recent commits.
  repos: (process.env.TTC_REPOS || '~/Code').replace(/,/g, ' '),

  // Where to check the weather for.
  // It's using weather.service.msn.com behind the curtains.
  weather: process.env.TTC_WEATHER || 'San Francisco',

  // Set to false if you're an imperial savage. <3
  celsius: (process.env.TTC_CELSIUS || 'true') === 'true',
  
  joke: (process.env.TTC_JOKE === 'true'),

  updateInterval: parseFloat(process.env.TTC_UPDATE_INTERVAL) || 20,

  keys: {
    consumer_key:        process.env.TTC_CONSUMER_KEY || process.env.CONSUMER_KEY || 'none',
    consumer_secret:     process.env.TTC_CONSUMER_SECRET || process.env.CONSUMER_SECRET || 'none',
    access_token:        process.env.TTC_ACCESS_TOKEN || process.env.ACCESS_TOKEN || 'none',
    access_token_secret: process.env.TTC_ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET || 'none',
  }
};

module.exports = config;
