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
  
  it('handling a request without a login session', function(done) {
    chai.passport.use(strategy)
      .pass(function() {
        expect(this.user).to.be.undefined;
        done();
      })
      .request(function(req) {
        req._passport = {};
        req.session = {};
        req.session['passport'] = {};
      })
      .authenticate();
  });
  
  it('handling a request with a login session', function(done) {
    var strategy = new MultiSessionStrategy(function(user, req, done) {
      done(null, user);
    });
    
    chai.passport.use(strategy)
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '123456',
          displayName: 'Alice'
        });
        
        expect(this.session['passport']).to.deep.equal({
          0: {
            user: { id: '123456', displayName: 'Alice' }
          }
        });
        
        done();
      })
      .request(function(req) {
        req._passport = {};
        req._passport.instance = {};
        req.session = {};
        req.session['passport'] = {};
        req.session['passport'][0] = {};
        req.session['passport'][0].user = { id: '123456', displayName: 'Alice' };
      })
      .authenticate();
  });
  
  it('handling a request with multiple login sessions', function(done) {
    var strategy = new MultiSessionStrategy(function(user, req, done) {
      done(null, user);
    });
    
    chai.passport.use(strategy)
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '123456',
          displayName: 'Alice'
        });
        expect(this.session['passport']).to.deep.equal({
          0: {
            user: { id: '123456', displayName: 'Alice' }
          },
          1: {
            user: { id: '123457', displayName: 'Bob' }
          }
        });
        done();
      })
      .request(function(req) {
        req._passport = {};
        req._passport.instance = {};
        req.session = {};
        req.session['passport'] = {};
        req.session['passport'][0] = {};
        req.session['passport'][0].user = { id: '123456', displayName: 'Alice' };
        req.session['passport'][1] = {};
        req.session['passport'][1].user = { id: '123457', displayName: 'Bob' };
      })
      .authenticate();
  });
  
  it('handling a request with multiple login sessions and select query parameter', function(done) {
    var strategy = new MultiSessionStrategy(function(user, req, done) {
      done(null, user);
    });
    
    chai.passport.use(strategy)
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '123457',
          displayName: 'Bob'
        });
        expect(this.session['passport']).to.deep.equal({
          0: {
            user: { id: '123456', displayName: 'Alice' }
          },
          1: {
            user: { id: '123457', displayName: 'Bob' }
          }
        });
        done();
      })
      .request(function(req) {
        req.query = { au: '1' };
        
        req._passport = {};
        req._passport.instance = {};
        req.session = {};
        req.session['passport'] = {};
        req.session['passport'][0] = {};
        req.session['passport'][0].user = { id: '123456', displayName: 'Alice' };
        req.session['passport'][1] = {};
        req.session['passport'][1].user = { id: '123457', displayName: 'Bob' };
      })
      .authenticate();
  });
  
  describe('handling a request with multiple login sessions and multi option', function() {
    var strategy = new MultiSessionStrategy(function(user, req, done) {
      done(null, user);
    });
    
    var request, pass = false;
  
    before(function(done) {
      chai.passport.use(strategy)
        .pass(function() {
          pass = true;
          done();
        })
        .request(function(req) {
          request = req;
          
          req._passport = {};
          req._passport.instance = {};
          req.session = {};
          req.session['passport'] = {};
          req.session['passport'][0] = {};
          req.session['passport'][0].user = { id: '123456', displayName: 'Alice' };
          req.session['passport'][1] = {};
          req.session['passport'][1].user = { id: '123457', displayName: 'Bob' };
        })
        .authenticate({ multi: true });
    });
  
    it('should pass', function() {
      expect(pass).to.be.true;
    });
    
    it('should set user on request', function() {
      expect(request.user).to.deep.equal([ {
        id: '123456',
        displayName: 'Alice'
      }, {
        id: '123457',
        displayName: 'Bob'
      } ]);
    });
    
    it('should set authInfo on request', function() {
      expect(request.authInfo).to.deep.equal([ {
        sessionSelector: '0'
      }, {
        sessionSelector: '1'
      } ]);
    });
    
    it('should maintain session', function() {
      expect(request.session['passport']).to.deep.equal({
        0: {
          user: { id: '123456', displayName: 'Alice' }
        },
        1: {
          user: { id: '123457', displayName: 'Bob' }
        }
      });
    });
  });
  
});
