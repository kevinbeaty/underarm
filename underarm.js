"use strict";
var _r = require('underscore-transducer');
module.exports = _r;

_r.UNDERARM_VERSION = '0.1.0';

var _ = _r._;

// import libraries
_.each([
  require('./lib/async'),
  require('./lib/sample')],
  function(lib){
    // only import if included in build
    if(_.isFunction(lib)){
      lib(_r);
    }
  });
