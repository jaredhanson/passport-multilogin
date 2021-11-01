var expect = require('chai').expect;
var pkg = require('..');

describe('passport-multilogin', function() {
    
  it('should export Strategy constructor as module', function() {
    expect(pkg).to.be.a('function');
    expect(pkg).to.equal(pkg.Strategy);
  });
  
  it('should export Strategy constructor', function() {
    expect(pkg.Strategy).to.be.a('function');
    expect(pkg.SessionStrategy).to.be.a('function');
    expect(pkg.Strategy).to.equal(pkg.SessionStrategy);
  });
  
  it('should export SessionMananger constructor', function() {
    expect(pkg.SessionManager).to.be.a('function');
  });
  
});
