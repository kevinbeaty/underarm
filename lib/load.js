"use strict";
module.exports = function(){
  var _r = require('./base'),
      libs = arguments,
      i = 0, len = libs.length, lib;

  for(; i < len; i++){
    lib = libs[i];
    // only import if included in build
    if(typeof lib === 'function'){
      lib(_r);
    }
  }

  return _r;
};
