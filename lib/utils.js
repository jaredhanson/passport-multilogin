exports.equalsUser = function(rhs, lhs) {
  if (typeof rhs == 'string' && typeof lhs == 'string' && rhs === lhs) { return true; }
  if (rhs.id === lhs.id) { return true; }
  return false;
};

exports.equalsMethod = function(rhs, lhs) {
  if (rhs.method === lhs.method) { return true; }
  return false;
};

exports.serializeInfo = function(info) {
  var method = {
    timestamp: new Date()
  };
  if (info.method) { method.method = info.method; }
  
  return method;
};
