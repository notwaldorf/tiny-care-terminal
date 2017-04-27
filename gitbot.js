const gitUsername = require('git-user-name')();
const resolve = require('resolve-dir');
const subdirs = require('subdirs');
const isGit = require('is-git');
const gitlog = require('gitlog');
const path = require('path');
const async = require("async");

/**
 * Go through all `repos` and look for subdirectories up to a given `depth`
 * and look for repositories.
 * Calls `callback` with array of repositories.
 */
function findGitRepos(repos, depth, callback) {
  let allRepos = [];
  async.each(repos, (repo, repoDone) => {
    repo = resolve(repo);
    subdirs(repo, depth, (err, dirs) => {
      if (err) {
        switch (err.code) {
          case 'ENOENT':
            return callback(`Could not open directory directory: ${err.path}\n`, null);
          case 'EACCES':
            return; //ignore if no access
          default:
            return callback(`Error "${err.code}" doing "${err.syscall}" on directory: ${err.path}\n`, null);
        }
      }
      if (dirs) dirs.push(repo);
      async.each(dirs, (dir, dirDone) => {
        isGit(dir, (err, isGit) => {
          if (err) {
            return callback(err, null);
          }
          if (!dir.includes('.git') && isGit) {
            allRepos.push(dir);
          }
          dirDone();
        });
      }, repoDone);
    });
  }, err => {
    callback(err, allRepos.sort().reverse());
  });
}

/**
 * returns all commits of the last given `days`.
 * Calls `callback` with line-seperated-strings of the formatted commits.
 */
function getCommitsFromRepos(repos, days, callback) {
  let cmts = [];
  async.each(repos, (repo, repoDone) => {
    try {
      gitlog({
        repo: repo,
        number: 100, //max commit count
        since: `${days} days ago`,
        fields: ['abbrevHash', 'subject', 'authorDateRel', 'authorName'],
        author: gitUsername
      }, (err, logs) => {
        // Error
        if (err)
          return callback(err, null);

        // Repo path
        if (logs.length >= 1)
          cmts.push(repo);

        // Commit
        logs.forEach(c => {
          if (c.status && c.status.length)
            cmts.push(`${c.abbrevHash} - ${c.subject} (${c.authorDateRel}) <${c.authorName.replace('@end@\n','')}>`);
        });
        repoDone();
      });
    } catch(err) {
      callback(err, null);
    }
  }, err => {
    callback(err, cmts.length > 0 ? cmts.join('\n') : "Nothing yet. Start small!");
  });
}

module.exports.findGitRepos = findGitRepos;
module.exports.getCommitsFromRepos = getCommitsFromRepos;
