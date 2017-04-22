#!/usr/bin/env bash
set -e

# I couldn't figure out how to cd into a different working directory
# and run git-standup there directly from node (cwd did nothing), so
# here we are.

if ! type "git-standup" > /dev/null; then
  echo "Seems like you haven't installed git-standup yet."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Installing git-standup with homebrew..."
    brew install git-standup
  fi
fi

progname=$0
standup=$(npm bin -g)"/git-standup"

usage () {
   echo "Usage: "
   echo "  $progname [-d days] [-h] repo1 repo2 etc."
   echo "  -d \t - Specify the number of days back to include"
   echo "  -h \t - Display this help screen"
}

# get the optional days
days=1
while getopts "d:h" opt; do
   case $opt in
   d ) days=$OPTARG;;
   h )  usage ;;
   \?)  usage ;;
   esac
done
shift $(($OPTIND - 1))

# the repo names
for dir in "$@"
do
  (cd $dir; $standup -d $days)
done
