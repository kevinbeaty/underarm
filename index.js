/* underarm v0.0.1 | http://kevinbeaty.net/projects/underarm | License: MIT */
"use strict";

var collections = require('./lib/collections')
  , arrays = require('./lib/arrays')
  , objects = require('./lib/objects')
  , functions = require('./lib/functions')
  , streams = require('./lib/streams')
  , Underarm = require('./lib/underarm')
  , when = require('when')
  , u = require('./lib/util')
  , identity = u.identity
  , errorHandler = u.errorHandler

var _r = Underarm._r
module.exports = _r

_r.VERSION = '0.0.2'

_r.mixin = Underarm.mixin
_r.mixin(collections)
_r.mixin(arrays)
_r.mixin(objects)
_r.mixin(functions)
_r.mixin(streams)

_r.when = when
_r.identity = identity

_r.defaultErrorHandler = defaultErrorHandler
function defaultErrorHandler(handler){
  errorHandler = handler
}

if(typeof window !== 'undefined'){
  (function(){
    var old_r
    /*global window*/
    old_r = window._r
    window._r = _r

    _r.noConflict = noConflict
    function noConflict(){
      window._r = old_r
      return _r
    }
  })()
}
