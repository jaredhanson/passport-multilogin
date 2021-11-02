/* global describe, it, expect, before */
/* jshint expr: true */

var expect = require('chai').expect;
var chai = require('chai');
var SessionManager = require('../lib/sessionmanager');


describe('Strategy', function() {
  
  describe('#logIn', function() {
    
    it('should establish initial session', function(done) {
      var manager = new SessionManager(function(user, req, cb) {
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
        var timestamp = req.session['passport'][0].events[0].timestamp;
        delete req.session['passport'][0].events[0].timestamp; 
        
        expect(req.session['passport']).to.deep.equal({
          0: {
            user: { id: '248289761001', displayName: 'Jane Doe' },
            events: [ {
              method: 'password'
            } ]
          }
        });
        expect(timestamp).to.be.closeToTime(new Date(), 1);
        done();
      })
    });
  });
  
});
