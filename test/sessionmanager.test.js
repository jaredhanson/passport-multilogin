/* global describe, it, expect, before */
/* jshint expr: true */

var expect = require('chai').expect;
var chai = require('chai');
var sinon = require('sinon');
var SessionManager = require('../lib/sessionmanager');


describe('SessionManager', function() {
  
  describe('#logIn', function() {
    var clock;
  
    beforeEach(function() {
      clock = sinon.useFakeTimers(1311280970000);
    });
  
    afterEach(function() {
      clock.restore();
    });
    
    
    it('should establish initial session', function(done) {
      var genh = sinon.stub().returns('a001');
      var manager = new SessionManager({ genh: genh }, function(req, user, cb) {
        cb(null, user);
      });
    
      var req = new Object();
      req.session = {};
      
      var user = {
        id: '248289761001',
        displayName: 'Jane Doe'
      };
      var info = {
        method: 'password'
      };
    
      manager.logIn(req, user, info, function(err) {
        if (err) { return done(err); }
        
        expect(req.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  method: 'password',
                  timestamp: new Date('2011-07-21T20:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
    }); // should establish initial session
    
    it('should establish initial session with empty key', function(done) {
      var genh = sinon.stub().returns('a001');
      var manager = new SessionManager({ genh: genh }, function(req, user, cb) {
        cb(null, user);
      });
    
      var req = new Object();
      req.session = {};
      req.session['passport'] = {};
      
      var user = {
        id: '248289761001',
        displayName: 'Jane Doe'
      };
      var info = {
        method: 'password'
      };
    
      manager.logIn(req, user, info, function(err) {
        if (err) { return done(err); }
        
        expect(req.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  method: 'password',
                  timestamp: new Date('2011-07-21T20:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
    }); // should establish initial session with empty key
    
    it('should update initial session on reauthentication with password', function(done) {
      var manager = new SessionManager(function(req, user, cb) {
        cb(null, user);
      });
      
      var req = new Object();
      req.session = {};
      req.session['passport'] = {
        default: 'a001',
        sessions: {
          'a001': {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            methods: [ {
              method: 'password',
              timestamp: new Date(Date.now() - 43200000)
            } ]
          }
        }
      };
      
      var user = {
        id: '248289761001',
        displayName: 'Jane Doe'
      };
      var info = {
        method: 'password'
      };
    
      manager.logIn(req, user, info, function(err) {
        if (err) { return done(err); }
        
        expect(req.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  method: 'password',
                  timestamp: new Date('2011-07-21T20:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
    }); // should update initial session on reauthentication with password
    
    it('should update initial session on authentication with one-time password', function(done) {
      var manager = new SessionManager(function(req, user, cb) {
        cb(null, user);
      });
      
      var req = new Object();
      req.session = {};
      req.session['passport'] = {
        default: 'a001',
        sessions: {
          'a001': {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            methods: [ {
              method: 'password',
              timestamp: new Date(Date.now() - 5000)
            } ]
          }
        }
      };
      
      var user = {
        id: '248289761001',
        displayName: 'Jane Doe'
      };
      var info = {
        method: 'otp'
      };
    
      manager.logIn(req, user, info, function(err) {
        if (err) { return done(err); }
        
        expect(req.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  method: 'password',
                  timestamp: new Date('2011-07-21T20:42:45.000Z')
                }, {
                  method: 'otp',
                  timestamp: new Date('2011-07-21T20:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
    }); // should update initial session on authentication with one-time password
    
    it('should establish secondary session', function(done) {
      var genh = sinon.stub().returns('a002');
      var manager = new SessionManager({ genh: genh }, function(req, user, cb) {
        cb(null, user);
      });
    
      var req = new Object();
      req.session = {};
      req.session['passport'] = {
        default: 'a001',
        sessions: {
          'a001': {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            methods: [ {
              method: 'password',
              timestamp: new Date(Date.now() - 7200000)
            } ]
          }
        }
      };
      
      var user = {
        id: '248289761002',
        displayName: 'John Doe'
      };
      var info = {
        method: 'password'
      };
    
      manager.logIn(req, user, info, function(err) {
        if (err) { return done(err); }
        
        expect(req.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  method: 'password',
                  timestamp: new Date('2011-07-21T18:42:50.000Z')
                } ]
              },
              'a002': {
                user: { id: '248289761002', displayName: 'John Doe' },
                methods: [ {
                  method: 'password',
                  timestamp: new Date('2011-07-21T20:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
    }); // should establish secondary session
    
  }); // #logIn
  
  describe('#logOut', function() {
    
    it('should terminate login session', function(done) {
      var manager = new SessionManager(function(user, req, cb) {
        cb(null, user);
      });
    
      var req = new Object();
      req.session = {};
      req.session['passport'] = {
        default: 'a001',
        sessions: {
          'a001': {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            methods: [ {
              method: 'password'
            } ]
          }
        }
      };
    
      manager.logOut(req, function(err) {
        if (err) { return done(err); }
        
        expect(req.session).to.deep.equal({
          passport: {}
        });
        done();
      })
    }); // should terminate login session
    
    it('should terminate two login sessions', function(done) {
      var manager = new SessionManager(function(user, req, cb) {
        cb(null, user);
      });
    
      var req = new Object();
      req.session = {};
      req.session['passport'] = {
        default: 'a001',
        sessions: {
          'a001': {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            methods: [ {
              method: 'password'
            } ]
          },
          'a002': {
            user: { id: '248289761002', displayName: 'John Doe' },
            methods: [ {
              method: 'password'
            } ]
          }
        }
      };
    
      manager.logOut(req, function(err) {
        if (err) { return done(err); }
        
        expect(req.session).to.deep.equal({
          passport: {}
        });
        done();
      })
    }); // should terminate two login sessions
    
    it('should terminate selected default login session', function(done) {
      var manager = new SessionManager(function(user, req, cb) {
        cb(null, user);
      });
    
      var req = new Object();
      req.session = {};
      req.session['passport'] = {
        default: 'a001',
        sessions: {
          'a001': {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            methods: [ {
              method: 'password'
            } ]
          },
          'a002': {
            user: { id: '248289761002', displayName: 'John Doe' },
            methods: [ {
              method: 'password'
            } ]
          }
        }
      };
    
      manager.logOut(req, { sessionSelector: 'a001' }, function(err) {
        if (err) { return done(err); }
        
        expect(req.session).to.deep.equal({
          passport: {
            sessions: {
              'a002': {
                user: { id: '248289761002', displayName: 'John Doe' },
                methods: [ {
                  method: 'password'
                } ]
              }
            }
          }
        });
        done();
      })
    }); // should terminate selected default login session
    
    it('should terminate selected non-default login session', function(done) {
      var manager = new SessionManager(function(user, req, cb) {
        cb(null, user);
      });
    
      var req = new Object();
      req.session = {};
      req.session['passport'] = {
        default: 'a001',
        sessions: {
          'a001': {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            methods: [ {
              method: 'password'
            } ]
          },
          'a002': {
            user: { id: '248289761002', displayName: 'John Doe' },
            methods: [ {
              method: 'password'
            } ]
          }
        }
      };
    
      manager.logOut(req, { sessionSelector: 'a002' }, function(err) {
        if (err) { return done(err); }
        
        expect(req.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  method: 'password'
                } ]
              }
            }
          }
        });
        done();
      })
    }); // should terminate selected non-default login session
    
  }); // #logOut
  
});
