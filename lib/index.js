// Load modules.
var Strategy = require('./strategy')
  , SessionManager = require('./sessionmanager')


// Expose Strategy.
exports = module.exports = Strategy;

// Exports.
exports.Strategy =
exports.SessionStrategy = Strategy;
exports.SessionManager = SessionManager;
