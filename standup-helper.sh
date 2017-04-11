#!/usr/bin/env bash
set -e

# I couldn't figure out how to cd into a different working directory
# and run git-standup there directly from node (cwd did nothing), so
# here we are.

# I used `-m 2` because I have code in ~/Code and ~/Code/some-giant-subfolder
# and I want reports from both
for dir in "$@"
do
  (cd $dir; git-standup -d 2)
done
