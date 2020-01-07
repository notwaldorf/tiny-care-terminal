# tiny-care-terminal

This is a little dashboard that tries to take care of you when you're using your terminal. It tells you cute, self care things, and tries not to stress you out. It shows:

- the last tweets from [@tinycarebot](https://twitter.com/tinycarebot), [@selfcare_bot](https://twitter.com/selfcare_bot) and [@magicrealismbot](https://twitter.com/magicrealismbot). The first two tend to tweet reminders about taking breaks, drinking water and looking outside, and the latter tells you strange, whimsical stories. If you don't like these bots, they're configurable!
- your `git` commits from today and the last 7 days. When I get stressed out because I think I haven't done anything, it turns out that I only think about big and serious commits, and forget about all the tiny amounts of work I've actually done throughout. Hopefully this will help you too <3
- the weather, because you might get rained on.

It looks like this, and updates every 20 minutes.

![tiny terminal care screenshot](https://cloud.githubusercontent.com/assets/1369170/25066240/adc3b1ac-21d5-11e7-9811-508b6bcfcc89.png)

## Make it go

### 1\. Installation

```sh
npm install -g tiny-care-terminal
```

(`yarn` also works fine.)

### 2\. Setting the environment variables

After installing the npm package, you need to set up the configuration in your Terminal.

Every OS and shell is different so I probably won't hit all of them, but the bottom line is that you should copy those environment variables wherever the rest of your system's variables live. For example,

- if you're using `zsh`, that's probably in your home directory's `.zshrc` file
- if you're using `bash`, that could be your `bash_profile` file
- if you're using `fish`, use `set -gx key value` in your `~/.config/fish/config.fish` file

Note that the `export` bit is pretty key, to make sure that they are globally available. To check that the variables have been set correctly, you can print them in the terminal -- for example, `echo $TTC_WEATHER`.

#### Configure the dashboard

All the settings the dashboard looks at are in the sample file `sample.env`. This file isn't used by the dashboard, it just lists the environment variables that you can copy in your `rc` files:

- `TTC_BOTS` are the 3 twitter bots to check, comma separated. The first entry in this list will be displayed in the big party parrot box.
- `TTC_SAY_BOX` defines the ASCII-Art to show. e.g. `parrot` | `bunny` | `llama` | `cat` | `yeoman` | `mario` | `ironman.ansi` | `stegosaurus.cow` See section below for all the different options.
- `TTC_REPOS`, a comma separated list of repos to look at for `git` commits.
- `TTC_REPOS_DEPTH` is the max directory-depth to look for git repositories in the directories defined with `TTC_REPOS` (by default 1). Note that the deeper the directory depth, the slower the results will be fetched. seeing your commits in `tiny-terminal-care`, set this to `gitlog`
- `TTC_WEATHER`, the location to check the weather for. A zipcode doesn't always work, so if you can, use a location first (so prefer `Paris` over `90210`)
- `TTC_CELSIUS` (by default true)
- `TTC_APIKEYS` -- set this to false if you don't want to use Twitter API keys and want to scrape the tweets instead.
- `TTC_UPDATE_INTERVAL`, set this to change the update frequency in minutes, default is 20 minutes.
- `TTC_TERMINAL_TITLE` -- set this to false if you don't want the terminal title to be changed on startup.

##### Configure the Say-box

There are almost endless variation of ASCII art images supported. You can select an existing image from the [cowsay library](https://github.com/piuccio/cowsay/tree/master/cows) just by defining a filename ending with ".cow". So e.g. `vader.cow` or `bunny.cow` would be two possible options. Also the [ansi-art](https://github.com/gauravchl/ansi-art) library is supported. In addition to the [existing](https://github.com/gauravchl/ansi-art/tree/master/src/arts) colorful images you can create your own image by using the [webapp](https://gauravchl.github.io/ansi-art/webapp/) and download the result. After downloading the ANSI-File you can just supply its absolute path to render it within the box. (eg: `TTC_SAY_BOX='/Users/om/desktop/cat.ansi'`). If you want the art to be selected by random use the magic word `RANDOM`.

In addition to this libraries the following types are supported: `bunny`, `llama`, `cat`, `yeoman`

#### Set up Twitter API keys

The dashboard has two alternatives for reading tweets: using your API keys or scraping. API keys is preferred (because lol scraping), but if you're really not into that, then skip the next section and read the bit about setting `TTC_APIKEYS`

You need [Twitter API keys](https://apps.twitter.com/) for the tweets to work. It should be pretty easy to create a new app, and get these 4 values. After you've set them up, set these env variables (see the [`sample.env`](sample.env) for an example):

```sh
TTC_CONSUMER_KEY='...'
TTC_CONSUMER_SECRET='...'
TTC_ACCESS_TOKEN='...'
TTC_ACCESS_TOKEN_SECRET='...'
```

## 3\. Start

```sh
tiny-care-terminal
```

You can exit the dashboard by pressing `esc` or `q`. You can refresh it manually by pressing `r`.

## 🍅 Pomodoro Mode

You can press `p` to switch parrot box to pomodoro mode.

Other commands while in pomodoro mode:

```sh
s - start/pause/resume pomodoro
e - stop pomodoro
u - update pomodoro duration
b - update break time
```

To change default pomodoro and break durations set following variables in minutes (these should be numbers):

```sh
TTC_POMODORO=...
TTC_BREAK=...
```

## 🆘 Halp I don't see my commits

- did you forget to export your `TTC_REPOS` environment variable? Open a new tab, and type `echo $TTC_REPOS` to make sure it's not empty. Note that spaces inside the repo names are not supported right now 😥
- also there seem to be problems sometimes if the paths you're using are not fully qualified -- that is, use `/Users/notwaldorf/Code` rather than `~/Code` and see if that helps.
- did you use `yarn`? I know `yarn` is cool, and I've seen it work with this, but can you double check that it still doesn't work with a basic `npm` installation instead?

  **Take care of yourself, ok? 💖**
