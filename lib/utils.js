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
  
  // TODO: rename this to type???
  if (info.method) { method.method = info.method; }
  
  switch (info.type) {
  case 'federated':
    return {
      type: info.type,
      provider: info.provider,
      protocol: info.protocol,
      idToken: info.idToken
    }
  }
  
  return method;
};
