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
  this._jsCookie = options.jsCookie !== undefined
    ? { name: 'sst' }
    : false;
  this._generateHandle = options.genh || function() { return uid(4); }
}

SessionManager.prototype.logIn = function(req, user, info, cb) {
  var self = this;
  
  function serialized(err, user) {
    if (err) { return cb(err); }
    if (!req.session) { return cb(new Error('Session manager requires session support')); }
    
    if (!req.session[self._key]) {
      req.session[self._key] = { sessions: {} };
    } else if (!req.session[self._key].sessions) {
      req.session[self._key].sessions = {}
    }
    
    // set a JS state cookie
    if (this._jsCookie) {
      req.res.cookie('sst', uid(8));
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
            return cb(null, h);
          }
        }
        req.session[self._key].sessions[h].methods.push(method);
        return cb(null, h);
      }
    }
    
    h = self._generateHandle();
    req.session[self._key].sessions[h] = {
      user: user,
      methods: [ method ]
    };
    if (handles.length === 0) { req.session[self._key].default = h; }
    cb(null, h);
  }
  
  var arity = this._serializeUser.length;
  if (arity == 3) {
    this._serializeUser(req, user, serialized);
  } else {
    this._serializeUser(user, serialized);
  }
}

SessionManager.prototype.logOut = function(req, options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  cb = cb || function() {};
  
  if (this._jsCookie) {
    req.res.cookie('sst', uid(8));
  }
  
  if (!req.session || !req.session[this._key]) { return cb(); }
  
  var handles = Object.keys(req.session[this._key].sessions)
    , h, i, len;
  for (i = 0, len = handles.length; i < len; ++i) {
    h = handles[i];
    if (!options.sessionSelector || h === options.sessionSelector) {
      delete req.session[this._key].sessions[h];
    }
  }
  
  if (Object.keys(req.session[this._key].sessions).length === 0) {
    delete req.session[this._key].sessions;
  }
  if (!options.sessionSelector || req.session[this._key].default === options.sessionSelector) {
    delete req.session[this._key].default;
  }
  cb();
}


module.exports = SessionManager;
