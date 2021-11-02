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
  this._key = options.key || 'passport';
  this._deserializeUser = deserializeUser;
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
  if (!req._passport) { return this.error(new Error('passport.initialize() middleware not in use')); }
  options = options || {};

  if (!req.session[this._key]) { return this.pass(); }


  var self = this
    , s = (req.query && req.query.s) // TODO: select from body, params and state as well
    , suser;
    
  if (s === undefined && options.multi) {
    var handles = Object.keys(req.session[this._key].sessions)
      , users = []
      , infos = [];
    
    (function iter(i) {
      var h = handles[i]
        , obj;
        
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
      
      obj = req.session[self._key].sessions[h];
      self._deserializeUser(obj.user, req, function(err, user) {
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
        
        // TODO: Add auth context here
        var info = { sessionSelector: h };
        infos.push(info);
        
        users.push(user);
        iter(i + 1);
      });
    })(0);
    
    
    return;
  }
  
  s = s || req.session[this._key].default;
  if (req.session[this._key] && req.session[this._key].sessions && req.session[this._key].sessions[s]) {
    suser = req.session[this._key].sessions[s].user;
  }
  

  if (suser || suser === 0) {
    // NOTE: Stream pausing is desirable in the case where later middleware is
    //       listening for events emitted from request.  For discussion on the
    //       matter, refer to: https://github.com/jaredhanson/passport/pull/106
    
    var paused = options.pauseStream ? pause(req) : null;
    this._deserializeUser(suser, req, function(err, user) {
      if (err) { return self.error(err); }
      if (!user) {
        delete req.session[self._key].user;
      } else {
        var property = req._userProperty || 'user';
        req[property] = user;
      }
      self.pass();
      if (paused) {
        paused.resume();
      }
    });
  } else {
    self.pass();
  }
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
