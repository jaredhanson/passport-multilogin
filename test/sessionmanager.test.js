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
        var timestamp = req.session['passport']['a001'].events[0].timestamp;
        delete req.session['passport']['a001'].events[0].timestamp;
        
        expect(req.session['passport']).to.deep.equal({
          'a001': {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            events: [ {
              method: 'password'
            } ]
          }
        });
        expect(timestamp).to.be.closeToTime(new Date(), 1);
        done();
      })
    }); // should establish initial session
    
    it('should establish second session', function(done) {
      var genh = sinon.stub().returns('a002');
      var manager = new SessionManager({ genh: genh }, function(user, req, cb) {
        cb(null, user);
      });
    
      var req = new Object();
      req.session = {};
      req.session['passport'] = {
        'a001': {
          user: { id: '248289761001', displayName: 'Jane Doe' },
          events: [ {
            method: 'password'
          } ]
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
        var timestamp = req.session['passport']['a002'].events[0].timestamp;
        delete req.session['passport']['a002'].events[0].timestamp;
        
        expect(req.session['passport']).to.deep.equal({
          'a001': {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            events: [ {
              method: 'password'
            } ]
          },
          'a002': {
            user: { id: '248289761002', displayName: 'John Doe' },
            events: [ {
              method: 'password'
            } ]
          }
        });
        expect(timestamp).to.be.closeToTime(new Date(), 1);
        done();
      })
    }); // should establish second session
    
  }); // #logIn
  
});
