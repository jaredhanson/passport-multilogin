/* global describe, it, expect, before */
/* jshint expr: true */

var expect = require('chai').expect;
var chai = require('chai');
var sinon = require('sinon');
var SessionManager = require('../lib/sessionmanager');


describe('Strategy', function() {
  
  describe('#logIn', function() {
    
    it('should establish initial session', function(done) {
      var genh = sinon.stub().returns('a001');
      var manager = new SessionManager({ genh: genh }, function(user, req, cb) {
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
        
        var timestamp = req.session['passport'].sessions['a001'].methods[0].timestamp;
        delete req.session['passport'].sessions['a001'].methods[0].timestamp;
        
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
        expect(timestamp).to.be.closeToTime(new Date(), 1);
        done();
      })
    }); // should establish initial session
    
    it('should update existing session on reauthentication with password', function(done) {
      var manager = new SessionManager(function(user, req, cb) {
        cb(null, user);
      });
    
      var now = Date.now();
      var req = new Object();
      req.session = {};
      req.session['passport'] = {
        default: 'a001',
        sessions: {
          'a001': {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            methods: [ {
              method: 'password',
              timestamp: new Date(now - 43200000)
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
        
        var timestamp = req.session['passport'].sessions['a001'].methods[0].timestamp;
        delete req.session['passport'].sessions['a001'].methods[0].timestamp;
        
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
        expect(timestamp).to.be.closeToTime(new Date(), 1);
        done();
      })
    }); // should update existing session on reauthentication with password
    
    it('should update existing session on authentication with one-time password', function(done) {
      var manager = new SessionManager(function(user, req, cb) {
        cb(null, user);
      });
    
      var now = Date.now();
      var req = new Object();
      req.session = {};
      req.session['passport'] = {
        default: 'a001',
        sessions: {
          'a001': {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            methods: [ {
              method: 'password',
              timestamp: new Date(now - 5000)
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
        
        var timestamp = req.session['passport'].sessions['a001'].methods[1].timestamp;
        delete req.session['passport'].sessions['a001'].methods[1].timestamp;
        
        expect(req.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  method: 'password',
                  timestamp: new Date(now - 5000)
                }, {
                  method: 'otp'
                } ]
              }
            }
          }
        });
        expect(timestamp).to.be.closeToTime(new Date(), 1);
        done();
      })
    }); // should update existing session on authentication with one-time password
    
    it('should establish second session', function(done) {
      var genh = sinon.stub().returns('a002');
      var manager = new SessionManager({ genh: genh }, function(user, req, cb) {
        cb(null, user);
      });
    
      var now = Date.now();
      var req = new Object();
      req.session = {};
      req.session['passport'] = {
        default: 'a001',
        sessions: {
          'a001': {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            methods: [ {
              method: 'password',
              timestamp: new Date(now - 7200000)
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
        
        var timestamp = req.session['passport'].sessions['a002'].methods[0].timestamp;
        delete req.session['passport'].sessions['a002'].methods[0].timestamp;
        
        expect(req.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  method: 'password',
                  timestamp: new Date(now - 7200000)
                } ]
              },
              'a002': {
                user: { id: '248289761002', displayName: 'John Doe' },
                methods: [ {
                  method: 'password'
                } ]
              }
            }
          }
        });
        expect(timestamp).to.be.closeToTime(new Date(), 1);
        done();
      })
    }); // should establish second session
    
  }); // #logIn
  
  describe('#logOut', function() {
    
    it('should terminate single session', function(done) {
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
    }); // should terminate single session
    
    it('should terminate two sessions', function(done) {
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
    }); // should terminate two sessions
    
  });
  
});
