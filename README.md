# tiny-terminal-care
Contains some things to take care of you when you're using your terminal:
- `tinycarebot.js` -- prints the last tweet from [@tinycarebot](https://twitter.com/tinycarebot)

## Make it go

### Set up API keys

You need [Twitter API keys](https://apps.twitter.com/) for this to work.
After you've set them up, create an `.env` file in the root of this
folder, and add these variables to it (see the `sample.env` for an
example):

```
CONSUMER_KEY='...'
CONSUMER_SECRET='...'
ACCESS_TOKEN='...'
ACCESS_TOKEN_SECRET='...'
```

### Do the npm dance

```
npm install
npm start
```
