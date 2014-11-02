"use strict";
var undef;

// Create a safe reference to the Underscore object for use below.
var _r = function(obj, transform) {
  if (_r.as(obj)){
    if(transform === undef){
      return obj;
    }
    var wrappedFns = _.clone(obj._wrappedFns);
    wrappedFns.push(transform);
    var copy = new _r(obj._wrapped, wrappedFns);
    copy._resolveSingleValue = obj._resolveSingleValue;
    return copy;
  }

  if (!(_r.as(this))) return new _r(obj, transform);

  if(_r.as(transform)){
    this._resolveSingleValue = transform._resolveSingleValue;
    transform = transform._wrappedFns;
  }

  if(_.isFunction(transform)){
    this._wrappedFns = [transform];
  } else if(_.isArray(transform)){
    this._wrappedFns = _.filter(transform, _.isFunction);
  } else {
    this._wrappedFns = [];
  }

  this._wrapped = _r.wrap.call(this, obj);
};

// Current version.
_r.VERSION = '0.1.1';

// sentinel to ignore wrapped objects (maintain only last item)
var IGNORE = _r.IGNORE = {};

var _ = require('underscore');

// Export for browser or Common-JS
// Save the previous value of the `_r` variable.
var previous_r, root;
if(typeof window !== 'undefined'){
  /*global window*/
  var root = window;
  previous_r = root._r;
  root._r = _r;
  _ = root._;
} else {
  root = {};
  module.exports = _r;
}

// access to browser or imported underscore object.
_r._ = _;

// Returns the value if it is a chained transformation, else null
_r.as = function(value){
  return value instanceof _r ? value : null;
};

// Run Underscore.js in *noConflict* mode, returning the `_` variable to its
// previous owner. Returns a reference to the Underscore object.
_r.noConflict = function() {
  root._r = previous_r;
  return this;
};

// Returns a new chained instance using current transformation, but
// wrapping the given source
_r.prototype.withSource = function(obj){
  return _r(obj, this);
};

// Composes and returns the underlying wrapped functions
_r.prototype.transducer = _r.prototype.compose = function() {
  var fns = this._wrappedFns;
  return fns.length ? _.compose.apply(null, fns) : _.identity;
};


// OOP
// ---------------

// If Underscore is called as a function, it returns a wrapped object that
// can be used OO-style. This wrapper holds altered versions of all the
// underscore functions. Wrapped objects may be chained.

// Add your own custom transducers to the Underscore.transducer object.
_r.mixin = function(obj) {
  _.each(_.functions(obj), function(name) {
    var func = _r[name] = obj[name];
    _r.prototype[name] = function() {
      var method = func.apply(this, arguments);
      return _r(this, method);
    };
  });
};

// Helper to mark transducer to expect single value when
// resolving. Only valid when chaining, but this should be passed
// when called as a function
_r.resolveSingleValue = function(self){
  resolveSingleValue(self, true);
};

// Helper to mark transducer to expect multiple values when
// resolving. Only valid when chaining, but this should be passed
// when called as a function.
_r.resolveMultipleValues = function(self){
  resolveSingleValue(self, false);
};

function resolveSingleValue(self, single){
  if(_r.as(self)){
    self._resolveSingleValue = single;
  }
}

// Resolves the value of the wrapped object, similar to underscore.
// Returns an array, or single value (to match underscore API)
// depending on whether the chained transformation resolves to single value.
_r.prototype.value = function(){
  if(!this._resolveSingleValue){
    return this.into();
  }

  var ret =  this.into(IGNORE);
  return ret === IGNORE ? undef : ret;
};

// import libraries
_.each([
  require('./lib/dispatch'),
  require('./lib/transduce'),
  require('./lib/base'),
  require('./lib/array'),
  require('./lib/push'),
  require('./lib/iterator'),
  require('./lib/math'),
  require('./lib/string')],
  function(lib){
    // only import if included in build
    if(_.isFunction(lib)){
      lib(_r);
    }
  });
