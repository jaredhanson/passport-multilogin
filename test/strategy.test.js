/* global describe, it, expect, before */
/* jshint expr: true */

var expect = require('chai').expect;
var chai = require('chai');
var sinon = require('sinon');
var Strategy = require('../lib/strategy');


describe('Strategy', function() {
  var clock;
  
  beforeEach(function() {
    clock = sinon.useFakeTimers(1311280970000);
  });
  
  afterEach(function() {
    clock.restore();
  });
  
  
  it('should be named session', function() {
    var strategy = new Strategy();
    expect(strategy.name).to.equal('session');
  });
  
  it('should pass request with newly initialized session and not set user', function(done) {
    var strategy = new Strategy();
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.session = {};
      })
      .pass(function() {
        expect(this.user).to.be.undefined;
        expect(this.authInfo).to.be.undefined;
        done();
      })
      .authenticate();
  }); // should pass request with newly initialized session and not set user
  
  it('should pass request without login session and not set user', function(done) {
    var strategy = new Strategy();
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.session = {};
        req.session['passport'] = {};
      })
      .pass(function() {
        expect(this.user).to.be.undefined;
        expect(this.authInfo).to.be.undefined;
        done();
      })
      .authenticate();
  }); // should pass request without login session and not set user
  
  it('should pass request with login session and set user to default session using verify function that accepts user and callback', function(done) {
    var strategy = new Strategy(function(user, cb) {
      expect(user).to.deep.equal({ id: '248289761001', displayName: 'Jane Doe' });
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.session = {};
        req.session['passport'] = {
          default: 'a001',
          sessions: {
            'a001': {
              user: { id: '248289761001', displayName: 'Jane Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 7200000)
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
        expect(this.authInfo).to.deep.equal({
          methods: [ {
            type: 'password',
            timestamp: new Date('2011-07-21T18:42:50.000Z')
          } ],
          sessionSelector: 'a001'
        });
        expect(this.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T18:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
      .authenticate();
  }); // should pass request with login session and set user to default session using verify function that accepts user and callback
  
  it('should pass request with login session and set user to default session', function(done) {
    var strategy = new Strategy(function(req, user, cb) {
      expect(req.method).to.equal('GET');
      expect(req.url).to.equal('/');
      expect(user).to.deep.equal({ id: '248289761001', displayName: 'Jane Doe' });
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.session = {};
        req.session['passport'] = {
          default: 'a001',
          sessions: {
            'a001': {
              user: { id: '248289761001', displayName: 'Jane Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 7200000)
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
        expect(this.authInfo).to.deep.equal({
          methods: [ {
            type: 'password',
            timestamp: new Date('2011-07-21T18:42:50.000Z')
          } ],
          sessionSelector: 'a001'
        });
        expect(this.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T18:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
      .authenticate();
  }); // should pass request with login session and set user to default session
  
  it('should pass request with two login sessions and set user to default session', function(done) {
    var strategy = new Strategy(function(req, user, cb) {
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.session = {};
        req.session['passport'] = {
          default: 'a001',
          sessions: {
            'a001': {
              user: { id: '248289761001', displayName: 'Jane Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 7200000)
              } ]
            },
            'a002': {
              user: { id: '248289761002', displayName: 'John Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 3600000)
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
        expect(this.authInfo).to.deep.equal({
          methods: [ {
            type: 'password',
            timestamp: new Date('2011-07-21T18:42:50.000Z')
          } ],
          sessionSelector: 'a001'
        });
        expect(this.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T18:42:50.000Z')
                } ]
              },
              'a002': {
                user: { id: '248289761002', displayName: 'John Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T19:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
      .authenticate();
  }); // should pass request with two login sessions and set user to default session
  
  it('should pass request with two login sessions and set user to selector in query parameter', function(done) {
    var strategy = new Strategy(function(req, user, cb) {
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.query = { select_session: 'a002' };
        req.session = {};
        req.session['passport'] = {
          default: 'a001',
          sessions: {
            'a001': {
              user: { id: '248289761001', displayName: 'Jane Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 7200000)
              } ]
            },
            'a002': {
              user: { id: '248289761002', displayName: 'John Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 3600000)
              } ]
            }
          }
        };
      })
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '248289761002',
          displayName: 'John Doe'
        });
        expect(this.authInfo).to.deep.equal({
          methods: [ {
            type: 'password',
            timestamp: new Date('2011-07-21T19:42:50.000Z')
          } ],
          sessionSelector: 'a002'
        });
        expect(this.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T18:42:50.000Z')
                } ]
              },
              'a002': {
                user: { id: '248289761002', displayName: 'John Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T19:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
      .authenticate();
  }); // should pass request with two login sessions and set user to selector in query parameter
  
  it('should pass request without default login session and not set user', function(done) {
    var strategy = new Strategy(function(req, user, cb) {
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.session = {};
        req.session['passport'] = {
          sessions: {
            'a002': {
              user: { id: '248289761002', displayName: 'John Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 3600000)
              } ]
            }
          }
        };
      })
      .pass(function() {
        expect(this.user).to.be.undefined;
        expect(this.authInfo).to.be.undefined;
        expect(this.session).to.deep.equal({
          passport: {
            sessions: {
              'a002': {
                user: { id: '248289761002', displayName: 'John Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T19:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
      .authenticate();
  }); // should pass request without default login session and not set user
  
  it('should pass request without default login session and set user to selector in query parameter', function(done) {
    var strategy = new Strategy(function(req, user, cb) {
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.query = { select_session: 'a002' };
        req.session = {};
        req.session['passport'] = {
          sessions: {
            'a002': {
              user: { id: '248289761002', displayName: 'John Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 3600000)
              } ]
            }
          }
        };
      })
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '248289761002',
          displayName: 'John Doe'
        });
        expect(this.authInfo).to.deep.equal({
          methods: [ {
            type: 'password',
            timestamp: new Date('2011-07-21T19:42:50.000Z')
          } ],
          sessionSelector: 'a002'
        });
        expect(this.session).to.deep.equal({
          passport: {
            sessions: {
              'a002': {
                user: { id: '248289761002', displayName: 'John Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T19:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
      .authenticate();
  }); // should pass request without default login session and set user to selector in query parameter
  
  it('should pass request without login session using multi option and not set user', function(done) {
    var strategy = new Strategy();
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.session = {};
        req.session['passport'] = {};
      })
      .pass(function() {
        expect(this.user).to.be.undefined;
        expect(this.authInfo).to.be.undefined;
        done();
      })
      .authenticate({ multi: true });
  }); // should pass request without login session using multi option and not set user
  
  it('should pass request with one login session using multi option and set user to default session', function(done) {
    var strategy = new Strategy(function(req, user, cb) {
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.session = {};
        req.session['passport'] = {
          default: 'a001',
          sessions: {
            'a001': {
              user: { id: '248289761001', displayName: 'Jane Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 7200000)
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
        expect(this.authInfo).to.deep.equal({
          methods: [ {
            type: 'password',
            timestamp: new Date('2011-07-21T18:42:50.000Z')
          } ],
          sessionSelector: 'a001'
        });
        expect(this.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T18:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
      .authenticate({ multi: true });
  }); // should pass request with one login session using multi option and set user to default session
  
  it('should pass request with two login sessions using multi option and set user to array', function(done) {
    var strategy = new Strategy(function(req, user, cb) {
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.session = {};
        req.session['passport'] = {
          default: 'a001',
          sessions: {
            'a001': {
              user: { id: '248289761001', displayName: 'Jane Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 7200000)
              } ]
            },
            'a002': {
              user: { id: '248289761002', displayName: 'John Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 3600000)
              } ]
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
          methods: [ {
            type: 'password',
            timestamp: new Date('2011-07-21T18:42:50.000Z')
          } ],
          sessionSelector: 'a001'
        }, {
          methods: [ {
            type: 'password',
            timestamp: new Date('2011-07-21T19:42:50.000Z')
          } ],
          sessionSelector: 'a002'
        } ]);
        expect(this.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T18:42:50.000Z')
                } ]
              },
              'a002': {
                user: { id: '248289761002', displayName: 'John Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T19:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
      .authenticate({ multi: true });
  }); // should pass request with two login sessions using multi option and set user to array
  
  it('should pass request with two login sessions using multi option and set user to selector in query parameter', function(done) {
    var strategy = new Strategy(function(req, user, cb) {
      cb(null, user);
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.query = { select_session: 'a002' };
        req.session = {};
        req.session['passport'] = {
          default: 'a001',
          sessions: {
            'a001': {
              user: { id: '248289761001', displayName: 'Jane Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 7200000)
              } ]
            },
            'a002': {
              user: { id: '248289761002', displayName: 'John Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 3600000)
              } ]
            }
          }
        };
      })
      .pass(function() {
        expect(this.user).to.deep.equal({
          id: '248289761002',
          displayName: 'John Doe'
        });
        expect(this.authInfo).to.deep.equal({
          methods: [ {
            type: 'password',
            timestamp: new Date('2011-07-21T19:42:50.000Z')
          } ],
          sessionSelector: 'a002'
        });
        expect(this.session).to.deep.equal({
          passport: {
            default: 'a001',
            sessions: {
              'a001': {
                user: { id: '248289761001', displayName: 'Jane Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T18:42:50.000Z')
                } ]
              },
              'a002': {
                user: { id: '248289761002', displayName: 'John Doe' },
                methods: [ {
                  type: 'password',
                  timestamp: new Date('2011-07-21T19:42:50.000Z')
                } ]
              }
            }
          }
        });
        done();
      })
      .authenticate({ multi: true });
  }); // should pass request with two login sessions using multi option and set user to selector in query parameter
  
  it('should error when session is not available', function(done) {
    var strategy = new Strategy();
    
    chai.passport.use(strategy)
      .request(function(req) {
      })
      .error(function(err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Login sessions require session support. Did you forget to use `express-session` middleware?");
        done();
      })
      .authenticate();
  }); // should error when session is not available
  
  it('should error when verify function encounters an error', function(done) {
    var strategy = new Strategy(function(req, user, cb) {
      cb(new Error('something went wrong'));
    });
    
    chai.passport.use(strategy)
      .request(function(req) {
        req.session = {};
        req.session['passport'] = {
          default: 'a001',
          sessions: {
            'a001': {
              user: { id: '248289761001', displayName: 'Jane Doe' },
              methods: [ {
                type: 'password',
                timestamp: new Date(Date.now() - 7200000)
              } ]
            }
          }
        };
      })
      .error(function(err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("something went wrong");
        done();
      })
      .authenticate();
  }); // should error when verify function encounters an error
  
});
