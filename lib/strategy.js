/**
 * Module dependencies.
 */
var pause = require('pause')
  , util = require('util')
  , passport = require('passport-strategy');


/**
 * `Strategy` constructor.
 *
 * @api public
 */
function Strategy(options, deserializeUser) {
  if (typeof options == 'function') {
    deserializeUser = options;
    options = undefined;
  }
  options = options || {};
  
  passport.Strategy.call(this);
  this.name = 'session';
  this._deserializeUser = deserializeUser;
  this._key = options.key || 'passport';
  this._jsCookie = options.jsCookie !== undefined
    ? { name: 'sst' }
    : false;
}

/**
 * Inherit from `Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the current session state.
 *
 * The session authentication strategy uses the session to restore any login
 * state across requests.  If a login session has been established, `req.user`
 * will be populated with the current user.
 *
 * This strategy is registered automatically by Passport.
 *
 * @param {Object} req
 * @param {Object} options
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
  if (!req.session) { return this.error(new Error('Login sessions require session support. Did you forget to use `express-session` middleware?')); }
  options = options || {};

  if (!req.session[this._key]) { return this.pass(); }
  if (!req.session[this._key].sessions) { return this.pass(); }


  var self = this
    , s = (req.state && req.state.selectSession) || (req.query && req.query.select_session) // TODO: select from body, params and state as well
    , suser, smethods;
    
  if (s === undefined && options.multi) {
    var handles = Object.keys(req.session[this._key].sessions)
      , users = []
      , infos = [];
    
    (function iter(i) {
      var h = handles[i];
      if (!h) {
        var property = req._userProperty || 'user';
        req[property] = users;
        req.authInfo = infos;
        
        if (users.length == 1) {
          req[property] = users[0];
          req.authInfo = infos[0];
        }
        return self.pass();
      }
      
      suser = req.session[self._key].sessions[h].user;
      smethods = req.session[self._key].sessions[h].methods;
      
      function deserialized(err, user) {
        if (err) { return self.error(err); }
        
        // TODO: Delete user if this doesnt return here
        // TODO: Handle expiration
        /*
        if (!user) {
          delete req.session[self._key].user;
        } else {
          var property = req._userProperty || 'user';
          req[property] = user;
        }
        */
        
        users.push(user);
        
        // TODO: Add auth context here
        var info = { sessionSelector: h };
        if (this._jsCookie && req.cookies && req.cookies['sst']) {
          info.sessionState = req.cookies['sst'];
        }
        
        if (smethods) { info.methods = smethods; }
        infos.push(info);
        iter(i + 1);
      }
      
      var arity = self._deserializeUser.length;
      if (arity == 3) {
        self._deserializeUser(req, suser, deserialized);
      } else {
        self._deserializeUser(suser, deserialized);
      }
    })(0);
    
    
    return;
  }
  
  s = s || req.session[this._key].default;
  if (req.session[this._key] && req.session[this._key].sessions && req.session[this._key].sessions[s]) {
    suser = req.session[this._key].sessions[s].user;
    smethods = req.session[this._key].sessions[s].methods;
  }
  

  if (suser || suser === 0) {
    // NOTE: Stream pausing is desirable in the case where later middleware is
    //       listening for events emitted from request.  For discussion on the
    //       matter, refer to: https://github.com/jaredhanson/passport/pull/106
    
    var paused = options.pauseStream ? pause(req) : null;
    
    function deserialized(err, user) {
      if (err) { return self.error(err); }
      if (!user) {
        delete req.session[self._key].user;
      } else {
        var property = req._userProperty || 'user';
        req[property] = user;
        req.authInfo = {
          sessionSelector: s
        };
        if (smethods) { req.authInfo.methods = smethods; }
      }
      self.pass();
      if (paused) {
        paused.resume();
      }
    }
    
    var arity = this._deserializeUser.length;
    if (arity == 3) {
      this._deserializeUser(req, suser, deserialized);
    } else {
      this._deserializeUser(suser, deserialized);
    }
  } else {
    self.pass();
  }
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
