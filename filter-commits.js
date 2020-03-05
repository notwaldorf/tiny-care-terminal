// filter-commits.js
const ignorableCommits = [
    'Apply fixes from StyleCI'
];

function filterCommit(message) {
    if (message === '') {
        return false;
    }

    return contains(message);
}

function contains(message) {
    let value = 0;
    ignorableCommits.forEach(function(commit){
        value = value + message.includes(commit);
    });

    return value == 0;
}

module.exports.hasNotAllowedMessage = filterCommit;