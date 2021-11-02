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
    
    // TODO: Error if session isn't available here.
    if (!req.session) {
      req.session = {};
    }
    if (!req.session[self._key]) {
      req.session[self._key] = {};
    }
    if (!req.session['.' + self._key]) {
      req.session['.' + self._key] = {};
    }
    
    
    var method = {
      timestamp: new Date()
    }
    if (info.method) { method.method = info.method; }
    
    var handles = Object.keys(req.session[self._key])
      , suser, h, i, len;
    for (i = 0, len = handles.length; i < len; ++i) {
      h = handles[i];
      suser = req.session[self._key][h].user;
      
      if (suser && utils.equalsUser(suser, user)) {
        req.session[self._key][h].user = user;
        
        var methods = req.session[self._key][h].methods
          , j, jlen;
        for (j = 0, jlen = methods.length; i < len; ++i) {
          if (utils.equalsMethod(methods[j], method)) {
            req.session[self._key][h].methods[j] = method;
            return cb();
          }
        }
        req.session[self._key][h].methods.push(method);
        return cb();
      }
    }
    
    var h = self._generateHandle();
    req.session[self._key][h] = {
      user: user,
      methods: [ method ]
    };
    if (handles.length === 0) {
      req.session['.' + self._key].default = h;
    }
    cb();
  });
}

SessionManager.prototype.logOut = function(req, cb) {
  if (req.session && req.session[this._key]) {
    var handles = Object.keys(req.session[this._key])
      , h, i, len;
    for (i = 0, len = handles.length; i < len; ++i) {
      h = handles[i];
      delete req.session[this._key][h];
    }
  }
  
  delete req.session['.' + this._key].default;
  
  cb && cb();
}


module.exports = SessionManager;
