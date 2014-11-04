"use strict";

// Import from browser or Common-JS
// Save the previous value of the `_r` variable.
var _r;
if(typeof window !== 'undefined'){
  /*global window*/
  _r = window._r;
} else {
  _r = require('underscore-transducer');
}
module.exports = _r;

// Current version.
_r.VERSION_R = '0.1.0';

var _ = _r._;

// import libraries
_.each([
  require('./lib/async'),
  require('./lib/ratelimit')],
  function(lib){
    // only import if included in build
    if(_.isFunction(lib)){
      lib(_r);
    }
  });
