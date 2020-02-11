const resolve = require('resolve-dir');
const subdirs = require('subdirs');
const isGit = require('is-git');
const gitlog = require('gitlog');
const async = require("async");
const getGitUsername = require('git-user-name');

function getGitUser() {
  try {
    return getGitUsername();
  } catch(err) {
    console.error(`ERROR reading git-config.
      Use e.g. 'git config --global user.name "Mona Lisa"'.
      See 'man git config' for further information.
    `);
    return process.exit(1);
  }
}

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
  let gitUser = getGitUser();
  async.each(repos, (repo, repoDone) => {
    try {
      gitlog({
        repo: repo,
        all: true,
        number: 100, //max commit count
        since: `${days} days ago`,
        fields: ['abbrevHash', 'subject', 'authorDateRel', 'authorName'],
        author: gitUser
      }, (err, logs) => {
        // Error
        if (err) {
          callback(`Oh noes😱\nThe repo ${repo} has failed:\n${err}`, null);
        }
        // Find user commits
        let commits = [];
        logs.forEach(c => {
          // filter simple merge commits
          if (c.status && c.status.length)
            commits.push(`${c.abbrevHash} - ${c.subject} (${c.authorDateRel}) <${c.authorName.replace('@end@\n','')}>`);
        });

        // Add repo name and commits
        if (commits.length >= 1) {
          // Repo name
          cmts.push(repo);
          cmts.push(...commits);
        }

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
