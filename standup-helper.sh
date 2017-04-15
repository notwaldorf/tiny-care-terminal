#!/usr/bin/env bash
set -e

# I couldn't figure out how to cd into a different working directory
# and run git-standup there directly from node (cwd did nothing), so
# here we are.

progname=$0

# I love 2 shell.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
standup=$DIR"/node_modules/git-standup/git-standup"

function usage () {
   echo "Usage: "
   echo "  $progname [-d days] [-h] repo1 repo2 etc."
   echo "  -d \t - Specify the number of days back to include"
   echo "  -d \t - Display this help screen"
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
