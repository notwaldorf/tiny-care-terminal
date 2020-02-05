# List of accounts to read the last tweet from, comma separated
# The first in the list is read by the party parrot.
export TTC_BOTS='nihilist_arbys, tinycarebot, selfcare_bot'

# Use this to have a different animal say a message in the big box.
export TTC_SAY_BOX='RANDOM'

# List of folders to look into for `git` commits, comma separated.
export TTC_REPOS='/media/delphin/Data1/workspaces/workspace/'

# The max directory-depth to look for git repositories in
# the directories defined with `TTC_REPOS`. Note that the deeper
# the directory depth, the slower the results will be fetched.
export TTC_REPOS_DEPTH=2

# Which method is to be used to read the git commits ('gitstandup' | 'gitlog').
# If you're having problems seeing your commits in the dahsboard, set
# this value to gitlog.
export TTC_GITBOT='gitlog'

# Location/zip code to check the weather for. Both 90210 and "San Francisco, CA"
# should be ok. It's using weather.service.msn.com behind the curtains.
export TTC_WEATHER='Fürth,Bavaria,Germany'

# Set to false if you're an imperial savage. <3
export TTC_CELSIUS=true

# Unset this if you _don't_ want to use Twitter keys and want to
# use web scraping instead.
export TTC_APIKEYS=true

# Refresh the dashboard every 20 minutes.
export TTC_UPDATE_INTERVAL=20

# Twitter api keys
#export CONSUMER_KEY='jaVbgVWtnNnfzV5u89ye8581t'
#export CONSUMER_SECRET='3zSONKyy0uCFC4iQj36suLjYsK7zTd8yhahcrw62BmNywLXSh8'
#export ACCESS_TOKEN='AVLiPCiZiVq6dkMWDGwMdYFfe2g29vtCbxrqhlQOt'
#export ACCESS_TOKEN_SECRET='7wLiikESnRgGYbqedcmotd2Q8q9lItLlOOXoMSnTrQ7nc'#
export TTC_APIKEYS=false

npm start
#node --nolazy --inspect-brk=9229 care.js
