# tiny-care-terminal
This is a little dashboard that tries to take care of you when you're using your terminal.
It tells you cute, self care things, and tries not to stress you out. It shows:
- the last tweets from [@tinycarebot](https://twitter.com/tinycarebot),
[@selfcare_bot](https://twitter.com/selfcare_bot) and
[@magicrealismbot](https://twitter.com/magicrealismbot). The first two tend
to tweet reminders about taking breaks, drinking water and looking outside, and the latter
tells you strange, whimsical stories. If you don't like these bots,
they're configurable!
- your `git` commits from today and the last 7 days. When I get stressed out
because I think I haven't done anything, it turns out that I only think about
big and serious commits, and forget about all the tiny amounts of work I've
actually done throughout. Hopefully this will help you too <3
- the weather, because you might get rained on.

It looks like this, and updates every 20 minutes.

<img width="1000" alt="tiny terminal care screenshot" src="https://cloud.githubusercontent.com/assets/1369170/25066240/adc3b1ac-21d5-11e7-9811-508b6bcfcc89.png">

## Make it go

### 1. Do the npm dance

```
npm install -g tiny-care-terminal
npm install -g git-standup
```
(Note: this currently doesn't work with `yarn` because of path shenanigans I wrote, so while I'm fixing that, pls use `npm` 🙏)

### 2. Setting the environment variables

After installing the npm package, you need to set up the configuration in your Terminal.

Every OS and shell is different so I probably won't hit all of them, but the bottom line is that
you should copy those environment variables wherever the rest of your system's variables live.
For example,
- if you're using `zsh`, that's probably in your home directory's `.zshrc` file
- if you're using `bash`, that could be your `bash_profile` file
- if you're using `fish`, use `set -gx key value` in your `~/.config/fish/config.fish` file

Note that the `export` bit is pretty key, to make sure that they are globally available. To check that the
variables have been set correctly, you can print them in the terminal -- for example, `echo $TTC_WEATHER`.

#### Configure the dashboard

All the settings the dashboard looks at are in the sample file `sample.env`. This file isn't used by the dashboard, it just
lists the environment variables that you can copy in your `rc` files:
  - `TTC_BOTS` are the 3 twitter bots to check, comma separated. The first entry
  in this list will be displayed in the big party parrot box.
  - `TTC_SAY_BOX = parrot | bunny | llama | cat`, to party with a different parrot (or,
    more specifically: to have a different animal say a message in the big box)
  - `TTC_REPOS`, a comma separated list of repos to look at for `git` commits.
  This is using [`git-standup`](https://github.com/kamranahmedse/git-standup) under
  the hood, and looks one subdirectory deep (so if you have all your code
  directories in a `~/Code`, you only need to list that one)
  - `TTC_REPOS_DEPTH` is the max directory-depth to look for git repositories in
  the directories defined with `TTC_REPOS` (by default 1). Note that the deeper
  the directory depth, the slower the results will be fetched.
  - `TTC_WEATHER`, the location to check the weather for. A zipcode doesn't
    always work, so if you can, use a location first (so prefer `Paris` over
    `90210`)
  - `TTC_CELSIUS` (by default true)
  - `TTC_APIKEYS` -- set this to false if you don't want to use Twitter API
  keys and want to scrape the tweets instead.
  - `TTC_UPDATE_INTERVAL`, set this to change the update frequency in minutes, default is 20 minutes.

#### Set up Twitter API keys

The dashboard has two alternatives for reading tweets: using your API keys
or scraping. API keys is preferred (because lol scraping), but if you're
really not into that, then skip the next section and read the bit about
setting `TTC_APIKEYS`

You need [Twitter API keys](https://apps.twitter.com/) for the tweets to work.
It should be pretty easy to create a new app, and get these 4 values.
After you've set them up, set these env variables (see the `sample.env` for an
example):

```
TTC_CONSUMER_KEY='...'
TTC_CONSUMER_SECRET='...'
TTC_ACCESS_TOKEN='...'
TTC_ACCESS_TOKEN_SECRET='...'
```

## 3. Start!
```
tiny-care-terminal
```
You can exit the dashboard by pressing `esc` or `q`. You can refresh it
manually by pressing `r`.


## 🍅 Pomodoro Mode

You can press 'p' to switch parrot box to pomodoro mode.

Other commands while in pomodoro mode:

```
 s - start/pause/resume pomodoro
 e - stop pomodoro
 u - update pomodoro duration
 b - update break time

```


## 🆘 Halp I don't see my commits

There's a couple of reasons why this might happen:
- did you run `npm install -g git-standup` after installing `tiny-care-terminal`? If you didn't, that's the most likely culprit
- did you forget to export your `TTC_REPOS` environment variable? Open a new tab, and type `echo $TTC_REPOS` to make sure it's not empty. Note that spaces inside the repo names are not supported right now :(
- are you on Windows? Not super sure it works on Windows because of the `bash` scripts, but working on it
- did you use `yarn`? I know `yarn` is cool, and I've seen it work with this, but can you double check that it still doesn't work with a basic `npm` installation instead?

**Take care of yourself, ok? 💖**
