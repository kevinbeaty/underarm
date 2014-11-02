var _r = require('underscore-transducer');
module.exports = _r;

var _ = _r._;

// import libraries
_.each([
  require('./lib/async')],
  function(lib){
    // only import if included in build
    if(_.isFunction(lib)){
      lib(_r);
    }
  });
