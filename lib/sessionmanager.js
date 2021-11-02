var uid = require('uid2');
var utils = require('./utils');


function SessionManager(options, serializeUser) {
  if (typeof options == 'function') {
    serializeUser = options;
    options = undefined;
  }
  options = options || {};
  
  this._serializeUser = serializeUser;
  this._key = options.key || 'passport';
  this._generateHandle = options.genh || function() { return uid(4); }
}

SessionManager.prototype.logIn = function(req, user, info, cb) {
  var self = this;
  this._serializeUser(user, req, function(err, user) {
    if (err) { return cb(err); }
    if (!req.session) { return cb(new Error('Session manager requires session support')); }
    
    if (!req.session[self._key]) {
      req.session[self._key] = { sessions: {} };
    }
    
    var method = utils.serializeInfo(info);
    
    var handles = Object.keys(req.session[self._key].sessions)
      , suser, h, i, len;
    for (i = 0, len = handles.length; i < len; ++i) {
      h = handles[i];
      suser = req.session[self._key].sessions[h].user;
      
      if (suser && utils.equalsUser(suser, user)) {
        req.session[self._key].sessions[h].user = user;
        
        var methods = req.session[self._key].sessions[h].methods
          , j, jlen;
        for (j = 0, jlen = methods.length; j < jlen; ++j) {
          if (utils.equalsMethod(methods[j], method)) {
            req.session[self._key].sessions[h].methods[j] = method;
            return cb();
          }
        }
        req.session[self._key].sessions[h].methods.push(method);
        return cb();
      }
    }
    
    var h = self._generateHandle();
    req.session[self._key].sessions[h] = {
      user: user,
      methods: [ method ]
    };
    if (handles.length === 0) { req.session[self._key].default = h; }
    cb();
  });
}

SessionManager.prototype.logOut = function(req, cb) {
  if (req.session && req.session[this._key]) {
    var handles = Object.keys(req.session[this._key].sessions)
      , h, i, len;
    for (i = 0, len = handles.length; i < len; ++i) {
      h = handles[i];
      delete req.session[this._key].sessions[h];
    }
  }
  delete req.session[this._key].sessions;
  delete req.session[this._key].default;
  
  cb && cb();
}


module.exports = SessionManager;
