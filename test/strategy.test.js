/* global describe, it, expect, before */
/* jshint expr: true */

var expect = require('chai').expect;
var chai = require('chai');
var MultiSessionStrategy = require('../lib/strategy');


describe('MultiSessionStrategy', function() {
  
  var strategy = new MultiSessionStrategy();
  
  it('should be named session', function() {
    expect(strategy.name).to.equal('session');
  });
  
  it('should pass request without login session', function(done) {
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
    var strategy = new MultiSessionStrategy(function(user, req, cb) {
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req._passport = {};
        req._passport.instance = {};
        req.session = {};
        req.session['passport'] = {
          0: {
            user: { id: '248289761001', displayName: 'Jane Doe' }
          }
        };
      })
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '248289761001',
          displayName: 'Jane Doe'
        });
        expect(this.session['passport']).to.deep.equal({
          0: {
            user: { id: '248289761001', displayName: 'Jane Doe' }
          }
        });
        done();
      })
      .authenticate();
  });
  
  it('should pass request with two login sessions', function(done) {
    var strategy = new MultiSessionStrategy(function(user, req, done) {
      done(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req._passport = {};
        req._passport.instance = {};
        req.session = {};
        req.session['passport'] = {
          0: {
            user: { id: '248289761001', displayName: 'Jane Doe' }
          },
          1: {
            user: { id: '248289761002', displayName: 'John Doe' }
          }
        };
      })
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '248289761001',
          displayName: 'Jane Doe'
        });
        expect(this.session['passport']).to.deep.equal({
          0: {
            user: { id: '248289761001', displayName: 'Jane Doe' }
          },
          1: {
            user: { id: '248289761002', displayName: 'John Doe' }
          }
        });
        done();
      })
      .authenticate();
  });
  
  it('should pass request with two login sessions and selector query parameter', function(done) {
    var strategy = new MultiSessionStrategy(function(user, req, done) {
      done(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req._passport = {};
        req._passport.instance = {};
        req.query = { au: '1' };
        req.session = {};
        req.session['passport'] = {
          0: {
            user: { id: '248289761001', displayName: 'Jane Doe' }
          },
          1: {
            user: { id: '248289761002', displayName: 'John Doe' }
          }
        };
      })
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '248289761002',
          displayName: 'John Doe'
        });
        expect(this.session['passport']).to.deep.equal({
          0: {
            user: { id: '248289761001', displayName: 'Jane Doe' }
          },
          1: {
            user: { id: '248289761002', displayName: 'John Doe' }
          }
        });
        done();
      })
      .authenticate();
  });
  
  it('handling a request with multiple login sessions and multi option', function(done) {
    var strategy = new MultiSessionStrategy(function(user, req, done) {
      done(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req._passport = {};
        req._passport.instance = {};
        req.session = {};
        req.session['passport'] = {
          0: {
            user: { id: '248289761001', displayName: 'Jane Doe' }
          },
          1: {
            user: { id: '248289761002', displayName: 'John Doe' }
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
          sessionSelector: '0'
        }, {
          sessionSelector: '1'
        } ]);
        expect(this.session['passport']).to.deep.equal({
          0: {
            user: { id: '248289761001', displayName: 'Jane Doe' }
          },
          1: {
            user: { id: '248289761002', displayName: 'John Doe' }
          }
        });
        done();
      })
      .authenticate({ multi: true });
  });
  
});
