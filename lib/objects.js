"use strict";
var funcs = require('./funcs')
  , has = funcs.has
  , breaker = {}

exports.forIn = forIn
function forIn(iterator, context){
  /*jshint validthis:true*/
  var key
  for(key in this){
    if(has(this, key)){
      if(iterator.call(context || this, this[key], key, this) === breaker){
        break
      }
    }
  }
}

