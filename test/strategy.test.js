/* global describe, it, expect, before */
/* jshint expr: true */

var expect = require('chai').expect;
var chai = require('chai');
var Strategy = require('../lib/strategy');


describe('Strategy', function() {
  
  it('should be named session', function() {
    var strategy = new Strategy();
    expect(strategy.name).to.equal('session');
  });
  
  it('should pass request without login session', function(done) {
    var strategy = new Strategy();
    
    chai.passport.use(strategy)
      .request(function(req) {
        req._passport = {};
        req.session = {};
        req.session['passport'] = {};
      })
      .pass(function() {
        expect(this.user).to.be.undefined;
        done();
      })
      .authenticate();
  });
  
  it('should pass request with login session', function(done) {
    var strategy = new Strategy(function(user, req, cb) {
      cb(null, user);
    });
    
    var now = Date.now();
    
    chai.passport.use(strategy)
      .request(function(req) {
        req._passport = {};
        req._passport.instance = {};
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
      })
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '248289761001',
          displayName: 'Jane Doe'
        });
        expect(this.session).to.deep.equal({
          passport: {
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
          }
        });
        done();
      })
      .authenticate();
  });
  
  it('should pass request with two login sessions', function(done) {
    var strategy = new Strategy(function(user, req, cb) {
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req._passport = {};
        req._passport.instance = {};
        req.session = {};
        req.session['passport'] = {
          default: 'a001',
          sessions: {
            'a001': {
              user: { id: '248289761001', displayName: 'Jane Doe' }
            },
            'a002': {
              user: { id: '248289761002', displayName: 'John Doe' }
            }
          }
        };
      })
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '248289761001',
          displayName: 'Jane Doe'
        });
        expect(this.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' }
              },
              'a002': {
                user: { id: '248289761002', displayName: 'John Doe' }
              }
            }
          }
        });
        done();
      })
      .authenticate();
  });
  
  it('should pass request with two login sessions and selector query parameter', function(done) {
    var strategy = new Strategy(function(user, req, cb) {
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req._passport = {};
        req._passport.instance = {};
        req.query = { s: 'a002' };
        req.session = {};
        req.session['passport'] = {
          default: 'a001',
          sessions: {
            'a001': {
              user: { id: '248289761001', displayName: 'Jane Doe' }
            },
            'a002': {
              user: { id: '248289761002', displayName: 'John Doe' }
            }
          }
        };
      })
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '248289761002',
          displayName: 'John Doe'
        });
        expect(this.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' }
              },
              'a002': {
                user: { id: '248289761002', displayName: 'John Doe' }
              }
            }
          }
        });
        done();
      })
      .authenticate();
  });
  
  // TODO: Test case with single, non default and multi
  
  it('should pass request with one login session using multi option', function(done) {
    var strategy = new Strategy(function(user, req, cb) {
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req._passport = {};
        req._passport.instance = {};
        req.session = {};
        req.session['passport'] = {
          default: 'a001',
          sessions: {
            'a001': {
              user: { id: '248289761001', displayName: 'Jane Doe' }
            }
          }
        };
      })
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '248289761001',
          displayName: 'Jane Doe'
        });
        expect(this.authInfo).to.deep.equal({
          sessionSelector: 'a001'
        });
        expect(this.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' }
              }
            }
          }
        });
        done();
      })
      .authenticate({ multi: true });
  }); // should pass request with one login session using multi option
  
  it('should pass request with two login sessions using multi option', function(done) {
    var strategy = new Strategy(function(user, req, cb) {
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req._passport = {};
        req._passport.instance = {};
        req.session = {};
        req.session['passport'] = {
          default: 'a001',
          sessions: {
            'a001': {
              user: { id: '248289761001', displayName: 'Jane Doe' }
            },
            'a002': {
              user: { id: '248289761002', displayName: 'John Doe' }
            }
          }
        };
      })
      .pass(function() {
        expect(this.user).to.deep.equal([ {
          id: '248289761001',
          displayName: 'Jane Doe'
        }, {
          id: '248289761002',
          displayName: 'John Doe'
        } ]);
        expect(this.authInfo).to.deep.equal([ {
          sessionSelector: 'a001'
        }, {
          sessionSelector: 'a002'
        } ]);
        expect(this.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' }
              },
              'a002': {
                user: { id: '248289761002', displayName: 'John Doe' }
              }
            }
          }
        });
        done();
      })
      .authenticate({ multi: true });
  });
  
});
