(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'
var util = require(5),
    merge = util.objectMerge,
    isArray = util.isArray,
    isFunction = util.isFunction

var _r = function(obj, transform) {
  if (_r.as(obj)){
    if(transform === void 0){
      return obj
    }
    var wrappedFns = obj._wrappedFns.slice()
    wrappedFns.push(transform)
    var copy = new _r(obj._wrapped, wrappedFns)
    copy._opts = merge({}, obj._opts)
    return copy
  }

  if (!(_r.as(this))) return new _r(obj, transform)

  if(_r.as(transform)){
    this._opts = merge({}, transform._opts)
    transform = transform._wrappedFns
  } else {
    this._opts = {}
  }

  if(isFunction(transform)){
    this._wrappedFns = [transform]
  } else if(isArray(transform)){
    this._wrappedFns = transform
  } else {
    this._wrappedFns = []
  }

  this._wrapped = _r.wrap.call(this, obj)
}

_r.VERSION = '0.8.0'

// Export for browser or Common-JS
// Save the previous value of the `_r` variable.
var previous_r, root
if(typeof window !== 'undefined'){
  /*global window*/
  var root = window
  previous_r = root._r
  root._r = _r
  _r._ = root._
} else {
  root = {}
}
module.exports = _r

// Returns the value if it is a chained transformation, else null
_r.as = function(value){
  return value instanceof _r ? value : null
}

// Run Underscore.js in *noConflict* mode, returning the `_` variable to its
// previous owner. Returns a reference to the Underscore object.
_r.noConflict = function() {
  root._r = previous_r
  return this
}

// Returns a new chained instance using current transformation, but
// wrapping the given source
_r.prototype.withSource = function(obj){
  return _r(obj, this)
}

// Add your own custom transducers to the Underscore.transducer object.
_r.mixin = function(obj) {
  var name, fn
  for(name in obj){
    fn = obj[name]
    if(typeof fn === 'function'){
      _r[name] = fn
      _r.prototype[name] = _method(fn)
    }
  }
}

function _method(func){
  return function() {
    var method = func.apply(this, arguments)
    return _r(this, method)
  }
}

},{"5":5}],2:[function(require,module,exports){
'use strict'
var dispatcher = require(7)

module.exports = function(_r){
  var _ = _r._,
      as = _r.as,
      // sentinel to ignore wrapped objects (maintain only last item)
      IGNORE = _r.IGNORE = {}

  // Transducer Functions
  // --------------------
  var core = require(8),
      value = _r.value = dispatcher(),
      wrap = _r.wrap = dispatcher(),
      unwrap = _r.unwrap = dispatcher(),
      empty = _r.empty = dispatcher(),
      append = _r.append = dispatcher(),
      reduce = _r.reduce = dispatcher(),
      _reduce = core.reduce,
      _unreduced = core.unreduced,
      transduce = _r.transduce = dispatcher(),
      _transduce = core.transduce,
      into = _r.into = dispatcher(),
      transducer = _r.transducer = dispatcher(),
      iterator = _r.iterator = dispatcher(),
      _iterable = core.iterable,
      _protocols = core.protocols,
      toArray = _r.toArray = dispatcher(),
      _toArray = core.into([]),
      _util = require(5),
      iteratee = _r.iteratee = dispatcher()
  _r.resolveSingleValue = resolveSingleValue
  _r.resolveMultipleValues = resolveMultipleValues
  _r.reduced = core.reduced
  _r.isReduced = core.isReduced
  _r.foldl = reduce
  _r.inject = reduce
  _r.deref = unwrap
  _r.conj = append
  _r.conjoin = append
  _r.dispatch = dispatch

  var compose = _r.compose = core.compose
  _r.transformer = core.transformer
  _r.iterable = _iterable
  _r.protocols = _protocols
  _r.isFunction = _util.isFunction
  var isArray = _r.isArray = _util.isArray
  var isString = _r.isString = _util.isString
  _r.isRegExp = _util.isRegExp
  _r.isNumber = _util.isNumber
  _r.isUndefined = _util.isUndefined
  _r.arrayPush = _util.arrayPush
  _r.objectMerge = _util.objectMerge
  _r.stringAppend = _util.stringAppend
  var identity = _r.identity = _util.identity


  // Dispatchers
  // -----------

  // Resolves the value of the wrapped object, similar to underscore.
  // Returns an array, or single value (to match underscore API)
  // depending on whether the chained transformation resolves to single value.
  value.register(function(self){
    if(!self._opts.resolveSingleValue){
      return self.into()
    }

    var ret =  self.into(IGNORE)
    return ret === IGNORE ? void 0 : ret
  })

  _r.prototype.value = function(){
    return value(this)
  }

  // Helper to mark transducer to expect single value when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function
  function resolveSingleValue(self){
    _resolveSingleValue(self, true)
  }

  // Helper to mark transducer to expect multiple values when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function.
  function resolveMultipleValues(self){
    _resolveSingleValue(self, false)
  }

  function _resolveSingleValue(self, single){
    if(as(self)){
      self._opts.resolveSingleValue = single
    }
  }

  // Composes and returns the underlying wrapped functions for give chained object
  transducer.register(function(self){
    var fns = self._wrappedFns
    return fns.length ? compose.apply(null, fns) : identity
  })

  _r.prototype.transducer = _r.prototype.compose = function() {
    return transducer(this)
  }

  reduce.register(function(xf, init, coll) {
    if(as(xf)){
      xf = transducer(xf)
    }

    if (coll === null || coll === void 0) coll = empty(coll)
    return _reduce(xf, init, coll)
  })

  // Calls transduce using the chained transformation if function not passed
  _r.prototype.reduce = function(init, coll){
    if(coll === void 0){
      coll = this._wrapped
    }
    return reduce(this, init, coll)
  }

  transduce.register(function(xf, f, init, coll){
    if(as(xf)){
      xf = transducer(xf)
    }

    return unwrap(_transduce(xf, f, init, coll))
  })

  // Calls transduce using the chained transformation
  _r.prototype.transduce = function(f, init, coll){
    if(coll === void 0){
      coll = this._wrapped
    }
    return transduce(this, f, init, coll)
  }


  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  into.register(function(to, xf, from){
    if(from === void 0){
      from = xf
      xf = void 0
    }

    if(from === void 0){
      from = empty()
    }

    if(as(xf)){
      xf = transducer(xf)
    }

    if(to === void 0){
      to = empty(from)
    }

    if(xf === void 0){
      return reduce(append, to, from)
    }

    return transduce(xf, append, to, from)
  })

  // Calls into using the chained transformation
  _r.prototype.into = function(to, from){
    if(from === void 0){
      from = this._wrapped
    }
    return into(to, this, from)
  }

  // Returns a new collection of the empty value of the from collection
  toArray.register(function(xf, from){
    if(as(xf)){
      xf = transducer(xf)
    }
    if(arguments.length === 1){
      return _toArray(xf)
    }
    return _toArray(xf, from)
  })

  // calls toArray with chained transformation and optional wrapped object
  _r.prototype.toArray = function(from){
    if(from === void 0){
      from = this._wrapped
    }
    return toArray(this, from)
  }

  // Wraps a value used as source for use during chained transformation.
  //
  // Default returns value, or _r.empty() if undefined.
  //
  // Dispatch function. To support different types,
  // call _r.unwrap.register
  wrap.register(function(value){
    if(isString(value)){
      value = [value]
    } else if(value === null || value === void 0){
      value = empty()
    }
    return value
  })

  // Unwraps (deref) a possibly wrapped value
  // Default unwraps values created with _r.reduced,
  // or calls value() on chained _r transformations,
  // otherwise returns parameter.
  //
  // Dispatch function. To support different types,
  // call _r.unwrap.register
  unwrap.register(function(value){
    if(as(value)){
      return value.value()
    }
    return _unreduced(value)
  })

  // Returns an iterator that has next function
  // and returns {value, done}. Default looks for
  // object with iterator Symbol (or '@@iterator').
  // This is available with _r.iterator.Symbol
  //
  // Dispatch function. To support different types
  // call _r.iterator.register and supply function that returns
  // an iterator after checking the input using appropriate
  // predicates. Return undefined if not supported, so other
  // dispatched functions can be checked
  iterator.register(function(value){
    return _iterable(value)[_protocols.iterator]()
  })

  // Mostly internal function that generates a callback from the given value.
  // For use with generating callbacks for map, filter, find, etc.
  //
  // Default returns _.iteratee.
  //
  // Dispatch function. To support different types
  // call _r.iteratee.register and supply function that returns
  // a callback after checking the input using appropriate
  // predicates. Return undefined if not supported, so other
  // dispatched functions can be checked
  iteratee.register(function(value){
    if(as(value)){
      return _riteratee(value)
    }
    return _.iteratee(value)
  })

  function _riteratee(value){
    return function(item){
      return value.withSource(item).value()
    }
  }

  // Returns empty object of the same type as argument.
  // Default returns [] if isArray or undefined, {} if _.isObject
  // and an internal sentinel to ignore otherwise
  //
  // Dispatch function. To support different types
  // call _r.empty.register and supply function that returns
  // an empty object after checking the input using appropriate
  // predicates. Return undefined if not supported, so other
  // dispatched functions can be checked
  empty.register(function(obj){
    if(obj === void 0 || isArray(obj) || iterator(obj)){
      return [] // array if not specified or from array
    } else if(_.isObject(obj)){
      return {} // object if from object
    }

    // ignore by default. Default append just maintains last item.
    return IGNORE
  })

  // Appends (conjoins) the item to the collection, and returns collection
  //
  // Dispatch function. To support different types
  // call _r.append.register and supply function that append to the object
  // (first param) with the item and optional key after checking the input
  // using appropriate predicates.
  //
  // Return undefined if not supported, so other dispatched functions can be checked
  append.register(function(obj, item){
    if(isArray(obj)){
      obj.push(item)
      return obj
    }

    // just maintain last item
    return item
  })

  // Reducer that dispatches to empty, unwrap and append
  function Dispatch(){}
  Dispatch.prototype.init = empty
  Dispatch.prototype.result = unwrap
  Dispatch.prototype.step = append

  function dispatch(){
    return new Dispatch()
  }
}

},{"5":5,"7":7,"8":8}],3:[function(require,module,exports){
'use strict'
module.exports = function(libs, _r){
  var i = 0, len = libs.length, lib
  if(_r === void 0){
    _r = require(1)
  }

  for(; i < len; i++){
    lib = libs[i]
    // only import if included in build
    if(typeof lib === 'function'){
      lib(_r)
    }
  }

  return _r
}

},{"1":1}],4:[function(require,module,exports){
'use strict'
var slice = Array.prototype.slice

module.exports = function(_r){
  // Base Transducers
  // ----------------
  _r.mixin({
    map: map,
    collect: map,
    filter: filter,
    select: filter,
    remove: remove,
    reject: remove,
    take: take,
    first: take,
    head: take,
    takeWhile: takeWhile,
    drop: drop,
    rest: drop,
    tail: drop,
    dropWhile: dropWhile,
    cat: cat,
    mapcat: mapcat,
    partitionAll: partitionAll,
    chunkAll: partitionAll,
    partitionBy: partitionBy,
    compact: compact,
    invoke: invoke,
    pluck: pluck,
    where: where
  })

  var iteratee = _r.iteratee,
      _ = _r._,
      util = require(5),
      transducers = require(13),
      isFunction = util.isFunction,
      identity = util.identity

  // Return the results of applying the iteratee to each element.
  function map(f) {
    return transducers.map(iteratee(f))
  }

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  function filter(predicate) {
    return transducers.filter(iteratee(predicate))
  }

  // Return all the elements for which a truth test fails.
  function remove(predicate) {
    return transducers.remove(iteratee(predicate))
  }

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`.
  function take(n) {
     if(n === void 0){
       /*jshint validthis:true*/
       _r.resolveSingleValue(this)
       n = 1
     } else {
       n = (n > 0) ? n : 0
     }
     return transducers.take(n)
  }

  // takes items until predicate returns false
  function takeWhile(predicate) {
     return transducers.takeWhile(iteratee(predicate))
  }

  // Returns everything but the first entry. Aliased as `tail` and `drop`.
  // Passing an **n** will return the rest N values.
  function drop(n) {
    n = (n === void 0) ? 1 : (n > 0) ? n : 0
    return transducers.drop(n)
  }

  // Drops items while the predicate returns true
  function dropWhile(predicate) {
     return transducers.dropWhile(iteratee(predicate))
  }

  // Concatenating transducer.
  // NOTE: unlike libraries, cat should be called as a function to use.
  // _r.cat() not _r.cat
  function cat(){
    return transducers.cat
  }

  // mapcat.
  // Composition of _r.map(f) and _r.cat()
  function mapcat(f){
    return transducers.mapcat(iteratee(f))
  }

  // Partitions the source into arrays of size n
  // When transformer completes, the array will be stepped with any remaining items.
  // Alias chunkAll
  function partitionAll(n){
    return transducers.partitionAll(n)
  }

  // Partitions the source into sub arrays while the value of the function
  // changes equality.
  function partitionBy(f){
    return transducers.partitionBy(iteratee(f))
  }
  

  // Trim out all falsy values from an array.
  function compact() {
    return filter(identity)
  }

  // Invoke a method (with arguments) on every item in a collection.
  function invoke(method) {
    var args = slice.call(arguments, 2),
        isFunc = isFunction(method)
    return map(function(value) {
      return (isFunc ? method : value[method]).apply(value, args)
    })
  }

  // Convenience version of a common use case of `map`: fetching a property.
  function pluck(key) {
    return map(_.property(key))
  }

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  function where(attrs) {
    return filter(_.matches(attrs))
  }
}

},{"13":13,"5":5}],5:[function(require,module,exports){
'use strict'
var toString = Object.prototype.toString,
    isArray = (Array.isArray || predicateToString('Array')),
    has = {}.hasOwnProperty

module.exports = {
  isArray: isArray,
  isFunction: isFunction,
  isNumber: predicateToString('Number'),
  isRegExp: predicateToString('RegExp'),
  isString: predicateToString('String'),
  isUndefined: isUndefined,
  identity: identity,
  arrayPush: arrayPush,
  stringAppend: stringAppend,
  objectMerge: objectMerge
}

function isFunction(value){
  return typeof value === 'function'
}

function isUndefined(value){
  return value === void 0
}

function predicateToString(type){
  var str = '[object '+type+']'
  return function(value){
    return toString.call(value) === str
  }
}

function identity(result){
  return result
}

function arrayPush(result, input){
  result.push(input)
  return result
}

function stringAppend(result, input){
  return result + input
}

function objectMerge(result, input){
  if(isArray(input) && input.length === 2){
    result[input[0]] = input[1]
  } else {
    var prop
    for(prop in input){
      if(has.call(input, prop)){
        result[prop] = input[prop]
      }
    }
  }
  return result
}

},{}],6:[function(require,module,exports){
'use strict'
// Based on Underscore.js 1.7.0
// http://underscorejs.org
//
// Which is distributed under MIT License:
// Underscore.js > (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Underscore.js > Underscore may be freely distributed under the MIT license.

var util = require(5),
    isFunction = util.isFunction,
    isArray = util.isArray,
    isString = util.isString,
    isNumber = util.isNumber,
    identity = util.identity

module.exports = function(_r){
  var _ = _r._ || {}
  _r._ = _
  _.iteratee = iteratee
  _.matches = matches
  _.property = property
}

function iteratee(value){
  var f
  if(isNull(value)){
    f = identity
  } else if(isFunction(value)){
    f = value
  } else if(isKey(value)){
    f = property(value)
  } else {
    f = matches(value)
  }
  return f
}

function property(key){
  return function(value){
    return value[key]
  }
}

function matches(attrs){
  var ps = pairs(attrs),
      len = ps.length
  return function(value){
    if(isNull(value)){
      return len === 0
    }
    var i = 0, p, k, v
    for(; i < len; i++){
      p = ps[i]
      k = p[0]
      v = p[1]
      if(v !== value[k] || !(k in value)){
        return false
      }
    }
    return true
  }
}

function isNull(value){
  return value === void 0 || value === null
}

function isKey(value){
  return isString(value) || isNumber(value)
}

function pairs(value){
  var key, ps = []
  for(key in value){
    if(value.hasOwnProperty(key)){
      ps.push([key, value[key]])
    }
  }
  return ps
}

},{"5":5}],7:[function(require,module,exports){
"use strict";
var undef;

module.exports = redispatch;

function redispatch(ctx){
  var fns = [],
      d = dispatch(fns, ctx);

  d.register = register(fns);
  d.unregister = unregister(fns);

  return d;
}

function register(fns){
  return function(fn){
    fns.push(fn);
  };
}

function unregister(fns){
  return function(fn){
    var idx = fns.indexOf(fn);
    if(idx > -1){
      fns.splice(idx, 1);
    }
  };
}

function dispatch(fns, ctx){
  return function(){
    var args = arguments,
        self = ctx !== undef ? ctx : this,
        i = fns.length,
        result;
    for(; i-- ;){
      result = fns[i].apply(self, args);
      if(result !== undef){
        return result;
      }
    }
  };
}

},{}],8:[function(require,module,exports){
module.exports = require(10)

},{"10":10}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _lastValue;

exports.transduceImpl = transduceImpl;
exports.reduceImpl = reduceImpl;
exports.intoImpl = intoImpl;
exports.iterator = iterator;
exports.iterable = iterable;
exports.transformer = transformer;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _util = require(12);

var _protocols$transducer = _util.protocols.transducer;
var tInit = _protocols$transducer.init;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;

var symIter = _util.protocols.iterator;

// given a reduce implementation, returns a transduce implementation
// that delegates to the implementation after handling multiple arity
// and dynamic argument types

function transduceImpl(reduce) {
  return function transduce(t, xf, init, coll) {
    if (_util.isFunction(xf)) {
      xf = completing(xf);
    }
    xf = t(xf);
    if (arguments.length === 3) {
      coll = init;
      init = xf[tInit]();
    }
    return reduce(xf, init, coll);
  };
}

// given a reduce implementation, returns a reduce implementation
// that delegates to reduce after handling multiple arity
// and dynamic argument types

function reduceImpl(_reduce) {
  return function reduce(xf, init, coll) {
    if (_util.isFunction(xf)) {
      xf = completing(xf);
    }
    if (arguments.length === 2) {
      coll = init;
      init = xf[tInit]();
    }
    return _reduce(xf, init, coll);
  };
}

// given a reduce implementation, returns an into implementation
// that delegates to reduce after handling currying, multiple arity
// and dynamic argument types

function intoImpl(reduce) {
  return function into(init, t, coll) {
    var xf = transformer(init),
        len = arguments.length;

    if (len === 1) {
      return intoCurryXf(xf);
    }

    if (len === 2) {
      if (_util.isFunction(t)) {
        return intoCurryXfT(xf, t);
      }
      coll = t;
      return reduce(xf, init, coll);
    }
    return reduce(t(xf), init, coll);
  };

  function intoCurryXf(xf) {
    return function intoXf(t, coll) {
      if (arguments.length === 1) {
        if (_util.isFunction(t)) {
          return intoCurryXfT(xf, t);
        }
        coll = t;
        return reduce(xf, xf[tInit](), coll);
      }
      return reduce(t(xf), xf[tInit](), coll);
    };
  }

  function intoCurryXfT(xf, t) {
    return function intoXfT(coll) {
      return reduce(t(xf), xf[tInit](), coll);
    };
  }
}

// Turns a step function into a transfomer with init, step, result
// If init not provided, calls `step()`.  If result not provided, calls `idenity`
var completing = function completing(rf, result) {
  return new Completing(rf, result);
};
exports.completing = completing;
function Completing(rf, result) {
  this[tInit] = rf;
  this[tStep] = rf;
  this[tResult] = result || _util.identity;
}

// Convert a value to an iterable
var has = ({}).hasOwnProperty;

function iterator(value) {
  return iterable(value)[symIter]();
}

function iterable(value) {
  var it;
  if (value[symIter] !== void 0) {
    it = value;
  } else if (_util.isArray(value) || _util.isString(value)) {
    it = new ArrayIterable(value);
  } else if (_util.isFunction(value)) {
    it = new FunctionIterable(function () {
      return { done: false, value: value() };
    });
  } else if (_util.isFunction(value.next)) {
    it = new FunctionIterable(function () {
      return value.next();
    });
  } else {
    it = new ObjectIterable(value);
  }
  return it;
}

var ArrayIterable = (function () {
  function ArrayIterable(arr) {
    _classCallCheck(this, ArrayIterable);

    this.arr = arr;
  }

  ArrayIterable.prototype[symIter] = function () {
    var _this = this;

    var idx = 0;
    return {
      next: function next() {
        if (idx >= _this.arr.length) {
          return { done: true };
        }
        return { done: false, value: _this.arr[idx++] };
      }
    };
  };

  return ArrayIterable;
})();

exports.ArrayIterable = ArrayIterable;

var FunctionIterable = (function () {
  function FunctionIterable(fn) {
    _classCallCheck(this, FunctionIterable);

    this.fn = fn;
  }

  FunctionIterable.prototype[symIter] = function () {
    return { next: this.fn };
  };

  return FunctionIterable;
})();

exports.FunctionIterable = FunctionIterable;

var ObjectIterable = (function () {
  function ObjectIterable(obj) {
    _classCallCheck(this, ObjectIterable);

    this.obj = obj;
    this.keys = Object.keys(obj);
  }

  // converts a value to a transformer

  ObjectIterable.prototype[symIter] = function () {
    var _this2 = this;

    var idx = 0;
    return {
      next: function next() {
        if (idx >= _this2.keys.length) {
          return { done: true };
        }
        var key = _this2.keys[idx++];
        return { done: false, value: [key, _this2.obj[key]] };
      }
    };
  };

  return ObjectIterable;
})();

exports.ObjectIterable = ObjectIterable;
var slice = Array.prototype.slice;

var lastValue = (_lastValue = {}, _lastValue[tInit] = function () {}, _lastValue[tStep] = function (result, input) {
  return input;
}, _lastValue[tResult] = _util.identity, _lastValue);

function transformer(value) {
  var xf;
  if (value === void 0 || value === null) {
    xf = lastValue;
  } else if (_util.isFunction(value[tStep])) {
    xf = value;
  } else if (_util.isFunction(value)) {
    xf = completing(value);
  } else if (_util.isArray(value)) {
    xf = new ArrayTransformer(value);
  } else if (_util.isString(value)) {
    xf = new StringTransformer(value);
  } else {
    xf = new ObjectTransformer(value);
  }
  return xf;
}

// Pushes value on array, using optional constructor arg as default, or [] if not provided
// init will clone the default
// step will push input onto array and return result
// result is identity

var ArrayTransformer = (function () {
  function ArrayTransformer(defaultValue) {
    _classCallCheck(this, ArrayTransformer);

    this.defaultValue = defaultValue === void 0 ? [] : defaultValue;
  }

  // Appends value onto string, using optional constructor arg as default, or '' if not provided
  // init will return the default
  // step will append input onto string and return result
  // result is identity

  ArrayTransformer.prototype[tInit] = function () {
    return slice.call(this.defaultValue);
  };

  ArrayTransformer.prototype[tStep] = function (result, input) {
    result.push(input);
    return result;
  };

  ArrayTransformer.prototype[tResult] = function (value) {
    return value;
  };

  return ArrayTransformer;
})();

exports.ArrayTransformer = ArrayTransformer;

var StringTransformer = (function () {
  function StringTransformer(str) {
    _classCallCheck(this, StringTransformer);

    this.strDefault = str === void 0 ? '' : str;
  }

  // Merges value into object, using optional constructor arg as default, or {} if undefined
  // init will clone the default
  // step will merge input into object and return result
  // result is identity

  StringTransformer.prototype[tInit] = function () {
    return this.strDefault;
  };

  StringTransformer.prototype[tStep] = function (result, input) {
    return result + input;
  };

  StringTransformer.prototype[tResult] = function (value) {
    return value;
  };

  return StringTransformer;
})();

exports.StringTransformer = StringTransformer;

var ObjectTransformer = (function () {
  function ObjectTransformer(obj) {
    _classCallCheck(this, ObjectTransformer);

    this.objDefault = obj === void 0 ? {} : objectMerge({}, obj);
  }

  ObjectTransformer.prototype[tInit] = function () {
    return objectMerge({}, this.objDefault);
  };

  ObjectTransformer.prototype[tResult] = function (value) {
    return value;
  };

  return ObjectTransformer;
})();

exports.ObjectTransformer = ObjectTransformer;

ObjectTransformer.prototype[tStep] = objectMerge;
function objectMerge(result, input) {
  if (_util.isArray(input) && input.length === 2) {
    result[input[0]] = input[1];
  } else {
    var prop;
    for (prop in input) {
      if (has.call(input, prop)) {
        result[prop] = input[prop];
      }
    }
  }
  return result;
}
//# sourceMappingURL=_internal.js.map

},{"12":12}],10:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _stepTransformer;

exports.sequence = sequence;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _util = require(12);

// Transformer, iterable, completing

var _internal = require(9);

var _protocols$transducer = _util.protocols.transducer;
var tInit = _protocols$transducer.init;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;
var tReduce = _protocols$transducer.reduce;

var symIter = _util.protocols.iterator;exports.transformer = _internal.transformer;
exports.iterable = _internal.iterable;
exports.iterator = _internal.iterator;
exports.completing = _internal.completing;
exports.compose = _util.compose;
exports.identity = _util.identity;
exports.protocols = _util.protocols;
exports.isReduced = _util.isReduced;
exports.reduced = _util.reduced;
exports.unreduced = _util.unreduced;
exports.Transducer = _util.Transducer;
exports.isIterable = _util.isIterable;
exports.isIterator = _util.isIterator;
exports.ArrayIterable = _internal.ArrayIterable;
exports.FunctionIterable = _internal.FunctionIterable;
exports.ObjectIterable = _internal.ObjectIterable;
exports.ArrayTransformer = _internal.ArrayTransformer;
exports.StringTransformer = _internal.StringTransformer;
exports.ObjectTransformer = _internal.ObjectTransformer;

// Transduce, reduce, into
var reduce = _internal.reduceImpl(_reduce);
exports.reduce = reduce;
var transduce = _internal.transduceImpl(_reduce);
exports.transduce = transduce;
var into = _internal.intoImpl(_reduce);

exports.into = into;
function _reduce(xf, init, coll) {
  if (_util.isArray(coll)) {
    return arrayReduce(xf, init, coll);
  }
  if (_util.isFunction(coll[tReduce])) {
    return methodReduce(xf, init, coll);
  }
  return iteratorReduce(xf, init, coll);
}

function arrayReduce(xf, init, arr) {
  var value = init,
      i = 0,
      len = arr.length;
  for (; i < len; i++) {
    value = xf[tStep](value, arr[i]);
    if (_util.isReduced(value)) {
      value = _util.unreduced(value);
      break;
    }
  }
  return xf[tResult](value);
}

function methodReduce(xf, init, coll) {
  var value = coll[tReduce](xf[tStep].bind(xf), init);
  return xf[tResult](value);
}

function iteratorReduce(xf, init, iter) {
  var value = init,
      next;
  iter = _internal.iterator(iter);
  while (true) {
    next = iter.next();
    if (next.done) {
      break;
    }

    value = xf[tStep](value, next.value);
    if (_util.isReduced(value)) {
      value = _util.unreduced(value);
      break;
    }
  }
  return xf[tResult](value);
}

// transducer
var transducer = function transducer(step, result, init) {
  return function (xf) {
    return new FnTransducer(xf, step, result, init);
  };
};
exports.transducer = transducer;

var FnTransducer = (function (_Transducer) {
  _inherits(FnTransducer, _Transducer);

  function FnTransducer(xf, step, result, init) {
    _classCallCheck(this, FnTransducer);

    _Transducer.call(this, xf);

    this._init = init;
    this._step = step;
    this._result = result;

    this.xfInit = this.xfInit.bind(this);
    this.xfStep = this.xfStep.bind(this);
    this.xfResult = this.xfResult.bind(this);
  }

  // eduction

  FnTransducer.prototype[tInit] = function () {
    return this._init ? this._init(this.xfInit) : this.xfInit();
  };

  FnTransducer.prototype[tStep] = function (value, input) {
    return this._step ? this._step(this.xfStep, value, input) : this.xfStep(value, input);
  };

  FnTransducer.prototype[tResult] = function (value) {
    return this._result ? this._result(this.xfResult, value) : this.xfResult(value);
  };

  return FnTransducer;
})(_util.Transducer);

var eduction = function eduction(t, coll) {
  return new Eduction(t, coll);
};
exports.eduction = eduction;

var Eduction = (function () {
  function Eduction(t, coll) {
    _classCallCheck(this, Eduction);

    this.t = t;
    this.coll = coll;
  }

  // sequence

  Eduction.prototype[symIter] = function () {
    return _internal.iterator(sequence(this.t, this.coll));
  };

  Eduction.prototype[tReduce] = function (rf, init) {
    return transduce(this.t, rf, init, this.coll);
  };

  return Eduction;
})();

function sequence(t, coll) {
  return new LazyIterable(t, coll);
}

var LazyIterable = (function () {
  function LazyIterable(t, coll) {
    _classCallCheck(this, LazyIterable);

    this.t = t;
    this.coll = coll;
  }

  LazyIterable.prototype[symIter] = function () {
    return new LazyIterator(new Stepper(this.t, _internal.iterator(this.coll)));
  };

  return LazyIterable;
})();

var LazyIterator = (function () {
  function LazyIterator(stepper) {
    _classCallCheck(this, LazyIterator);

    this.stepper = stepper;
    this.values = [];
  }

  LazyIterator.prototype.next = function next() {
    if (this.stepper && this.values.length === 0) {
      this.stepper.step(this);
    }
    return this.values.length ? { done: false, value: this.values.shift() } : { done: true };
  };

  return LazyIterator;
})();

var stepTransformer = (_stepTransformer = {}, _stepTransformer[tInit] = function () {}, _stepTransformer[tStep] = function (lt, input) {
  lt.values.push(input);
  return lt;
}, _stepTransformer[tResult] = function (lt) {
  lt.stepper = null;
  return lt;
}, _stepTransformer);

var Stepper = (function () {
  function Stepper(t, iter) {
    _classCallCheck(this, Stepper);

    this.xf = t(stepTransformer);
    this.iter = iter;
  }

  Stepper.prototype.step = function step(lt) {
    var next,
        result,
        values = lt.values,
        prevLen = values.length;
    while (prevLen === values.length) {
      next = this.iter.next();
      if (next.done) {
        this.xf[tResult](lt);
        break;
      }

      result = this.xf[tStep](lt, next.value);
      if (_util.isReduced(result)) {
        this.xf[tResult](lt);
        break;
      }
    }
  };

  return Stepper;
})();
//# sourceMappingURL=core.js.map

},{"12":12,"9":9}],11:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _util = require(12);

var _core = require(10);

var _protocols$transducer = _util.protocols.transducer;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;
var map = function map(f) {
  return function (xf) {
    return new Map(f, xf);
  };
};
exports.map = map;

var Map = (function (_Transducer) {
  _inherits(Map, _Transducer);

  function Map(f, xf) {
    _classCallCheck(this, Map);

    _Transducer.call(this, xf);
    this.f = f;
  }

  Map.prototype[tStep] = function (value, input) {
    return this.xfStep(value, this.f(input));
  };

  return Map;
})(_util.Transducer);

var filter = function filter(p) {
  return function (xf) {
    return new Filter(p, xf);
  };
};
exports.filter = filter;

var Filter = (function (_Transducer2) {
  _inherits(Filter, _Transducer2);

  function Filter(p, xf) {
    _classCallCheck(this, Filter);

    _Transducer2.call(this, xf);
    this.p = p;
  }

  Filter.prototype[tStep] = function (value, input) {
    return this.p(input) ? this.xfStep(value, input) : value;
  };

  return Filter;
})(_util.Transducer);

var remove = function remove(p) {
  return filter(function (x) {
    return !p(x);
  });
};

exports.remove = remove;
var take = function take(n) {
  return function (xf) {
    return new Take(n, xf);
  };
};
exports.take = take;

var Take = (function (_Transducer3) {
  _inherits(Take, _Transducer3);

  function Take(n, xf) {
    _classCallCheck(this, Take);

    _Transducer3.call(this, xf);
    this.n = n;
  }

  Take.prototype[tStep] = function (value, input) {
    if (this.n-- > 0) {
      value = this.xfStep(value, input);
    }
    if (this.n <= 0) {
      value = _util.reduced(value);
    }
    return value;
  };

  return Take;
})(_util.Transducer);

var takeWhile = function takeWhile(p) {
  return function (xf) {
    return new TakeWhile(p, xf);
  };
};
exports.takeWhile = takeWhile;

var TakeWhile = (function (_Transducer4) {
  _inherits(TakeWhile, _Transducer4);

  function TakeWhile(p, xf) {
    _classCallCheck(this, TakeWhile);

    _Transducer4.call(this, xf);
    this.p = p;
  }

  TakeWhile.prototype[tStep] = function (value, input) {
    return this.p(input) ? this.xfStep(value, input) : _util.reduced(value);
  };

  return TakeWhile;
})(_util.Transducer);

var drop = function drop(n) {
  return function (xf) {
    return new Drop(n, xf);
  };
};
exports.drop = drop;

var Drop = (function (_Transducer5) {
  _inherits(Drop, _Transducer5);

  function Drop(n, xf) {
    _classCallCheck(this, Drop);

    _Transducer5.call(this, xf);
    this.n = n;
  }

  Drop.prototype[tStep] = function (value, input) {
    return --this.n < 0 ? this.xfStep(value, input) : value;
  };

  return Drop;
})(_util.Transducer);

var dropWhile = function dropWhile(p) {
  return function (xf) {
    return new DropWhile(p, xf);
  };
};
exports.dropWhile = dropWhile;

var DropWhile = (function (_Transducer6) {
  _inherits(DropWhile, _Transducer6);

  function DropWhile(p, xf) {
    _classCallCheck(this, DropWhile);

    _Transducer6.call(this, xf);
    this.p = p;
    this.found = false;
  }

  DropWhile.prototype[tStep] = function (value, input) {
    if (!this.found) {
      if (this.p(input)) {
        return value;
      }
      this.found = true;
    }
    return this.xfStep(value, input);
  };

  return DropWhile;
})(_util.Transducer);

var cat = function cat(xf) {
  return new Cat(xf);
};
exports.cat = cat;

var Cat = (function (_Transducer7) {
  _inherits(Cat, _Transducer7);

  function Cat(xf) {
    _classCallCheck(this, Cat);

    _Transducer7.call(this, new PreserveReduced(xf));
  }

  Cat.prototype[tStep] = function (value, input) {
    return _core.reduce(this.xf, value, input);
  };

  return Cat;
})(_util.Transducer);

var PreserveReduced = (function (_Transducer8) {
  _inherits(PreserveReduced, _Transducer8);

  function PreserveReduced(xf) {
    _classCallCheck(this, PreserveReduced);

    _Transducer8.call(this, xf);
  }

  PreserveReduced.prototype[tStep] = function (value, input) {
    value = this.xfStep(value, input);
    if (_util.isReduced(value)) {
      value = _util.reduced(value, true);
    }
    return value;
  };

  return PreserveReduced;
})(_util.Transducer);

var mapcat = function mapcat(f) {
  return _util.compose(map(f), cat);
};

exports.mapcat = mapcat;
var partitionAll = function partitionAll(n) {
  return function (xf) {
    return new PartitionAll(n, xf);
  };
};
exports.partitionAll = partitionAll;

var PartitionAll = (function (_Transducer9) {
  _inherits(PartitionAll, _Transducer9);

  function PartitionAll(n, xf) {
    _classCallCheck(this, PartitionAll);

    _Transducer9.call(this, xf);
    this.n = n;
    this.inputs = [];
  }

  PartitionAll.prototype[tStep] = function (value, input) {
    var ins = this.inputs;
    ins.push(input);
    if (this.n === ins.length) {
      this.inputs = [];
      value = this.xfStep(value, ins);
    }
    return value;
  };

  PartitionAll.prototype[tResult] = function (value) {
    var ins = this.inputs;
    if (ins && ins.length) {
      this.inputs = [];
      value = this.xfStep(value, ins);
    }
    return this.xfResult(value);
  };

  return PartitionAll;
})(_util.Transducer);

var partitionBy = function partitionBy(f) {
  return function (xf) {
    return new PartitionBy(f, xf);
  };
};
exports.partitionBy = partitionBy;

var PartitionBy = (function (_Transducer10) {
  _inherits(PartitionBy, _Transducer10);

  function PartitionBy(f, xf) {
    _classCallCheck(this, PartitionBy);

    _Transducer10.call(this, xf);
    this.f = f;
  }

  PartitionBy.prototype[tStep] = function (value, input) {
    var ins = this.inputs,
        curr = this.f(input),
        prev = this.prev;
    this.prev = curr;
    if (ins === void 0) {
      this.inputs = [input];
    } else if (prev === curr) {
      ins.push(input);
    } else {
      this.inputs = [];
      value = this.xfStep(value, ins);
      if (!_util.isReduced(value)) {
        this.inputs.push(input);
      }
    }
    return value;
  };

  PartitionBy.prototype[tResult] = function (value) {
    var ins = this.inputs;
    if (ins && ins.length) {
      this.inputs = [];
      value = this.xfStep(value, ins);
    }
    return this.xfResult(value);
  };

  return PartitionBy;
})(_util.Transducer);

var dedupe = function dedupe() {
  return function (xf) {
    return new Dedupe(xf);
  };
};
exports.dedupe = dedupe;

var Dedupe = (function (_Transducer11) {
  _inherits(Dedupe, _Transducer11);

  function Dedupe(xf) {
    _classCallCheck(this, Dedupe);

    _Transducer11.call(this, xf);
    this.sawFirst = false;
  }

  Dedupe.prototype[tStep] = function (value, input) {
    if (!this.sawFirst || this.last !== input) {
      value = this.xfStep(value, input);
    }
    this.last = input;
    this.sawFirst = true;
    return value;
  };

  return Dedupe;
})(_util.Transducer);

var unique = function unique(f) {
  return function (xf) {
    return new Unique(f, xf);
  };
};
exports.unique = unique;

var Unique = (function (_Transducer12) {
  _inherits(Unique, _Transducer12);

  function Unique(f, xf) {
    _classCallCheck(this, Unique);

    _Transducer12.call(this, xf);
    this.seen = [];
    this.f = f || _util.identity;
  }

  Unique.prototype[tStep] = function (value, input) {
    var computed = this.f(input);
    if (this.seen.indexOf(computed) < 0) {
      this.seen.push(computed);
      value = this.xfStep(value, input);
    }
    return value;
  };

  return Unique;
})(_util.Transducer);

var tap = function tap(f) {
  return function (xf) {
    return new Tap(f, xf);
  };
};
exports.tap = tap;

var Tap = (function (_Transducer13) {
  _inherits(Tap, _Transducer13);

  function Tap(f, xf) {
    _classCallCheck(this, Tap);

    _Transducer13.call(this, xf);
    this.f = f;
  }

  Tap.prototype[tStep] = function (value, input) {
    this.f(value, input);
    return this.xfStep(value, input);
  };

  return Tap;
})(_util.Transducer);

var interpose = function interpose(separator) {
  return function (xf) {
    return new Interpose(separator, xf);
  };
};
exports.interpose = interpose;

var Interpose = (function (_Transducer14) {
  _inherits(Interpose, _Transducer14);

  function Interpose(separator, xf) {
    _classCallCheck(this, Interpose);

    _Transducer14.call(this, xf);
    this.separator = separator;
    this.started = false;
  }

  Interpose.prototype[tStep] = function (value, input) {
    if (this.started) {
      var withSep = this.xf[tStep](value, this.separator);
      if (_util.isReduced(withSep)) {
        return withSep;
      } else {
        return this.xfStep(withSep, input);
      }
    } else {
      this.started = true;
      return this.xfStep(value, input);
    }
  };

  return Interpose;
})(_util.Transducer);
//# sourceMappingURL=transducers.js.map

},{"10":10,"12":12}],12:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.isIterable = isIterable;
exports.isIterator = isIterator;
exports.compose = compose;
exports.reduced = reduced;
exports.unreduced = unreduced;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var toString = Object.prototype.toString;
var has = ({}).hasOwnProperty;

// type checks
var isArray = Array.isArray || predicateToString('Array');
exports.isArray = isArray;
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
exports.isFunction = isFunction;
var isUndefined = function isUndefined(value) {
  return value === void 0;
};
exports.isUndefined = isUndefined;
var isNumber = predicateToString('Number');
exports.isNumber = isNumber;
var isRegExp = predicateToString('RegExp');
exports.isRegExp = isRegExp;
var isString = predicateToString('String');
exports.isString = isString;
function predicateToString(type) {
  var str = '[object ' + type + ']';
  return function (value) {
    return str === toString.call(value);
  };
}

function isIterable(value) {
  return !!(isString(value) || isArray(value) || value && value[protocols.iterator]);
}

function isIterator(value) {
  return !!(value && isFunction(value.next));
}

// convenience functions
var identity = function identity(v) {
  return v;
};

exports.identity = identity;

function compose() {
  var fns = arguments;
  return function (xf) {
    var i = fns.length;
    while (i--) {
      xf = fns[i](xf);
    }
    return xf;
  };
}

// protocol symbols for iterators and transducers
var symbolExists = typeof Symbol !== 'undefined';
var protocols = {
  iterator: symbolExists ? Symbol.iterator : '@@iterator',
  transducer: {
    init: '@@transducer/init',
    step: '@@transducer/step',
    result: '@@transducer/result',
    reduce: '@@transducer/reduce',
    reduced: '@@transducer/reduced',
    value: '@@transducer/value'
  }
};

exports.protocols = protocols;
// reduced wrapper object
var _protocols$transducer = protocols.transducer;
var tValue = _protocols$transducer.value;
var tReduced = _protocols$transducer.reduced;
var isReduced = function isReduced(value) {
  return !!(value && value[tReduced]);
};

exports.isReduced = isReduced;

function reduced(value, force) {
  if (force || !isReduced(value)) {
    value = new Reduced(value);
  }
  return value;
}

function Reduced(value) {
  this[tValue] = value;
  this[tReduced] = true;
}

function unreduced(value) {
  if (isReduced(value)) {
    value = value[tValue];
  }
  return value;
}

// Base class for transducers with default implementation
// delegating to wrapped transformer, xf
var _protocols$transducer2 = protocols.transducer;
var tInit = _protocols$transducer2.init;
var tStep = _protocols$transducer2.step;
var tResult = _protocols$transducer2.result;

var Transducer = (function () {
  function Transducer(xf) {
    _classCallCheck(this, Transducer);

    this.xf = xf;
  }

  Transducer.prototype[tInit] = function () {
    return this.xfInit();
  };

  Transducer.prototype.xfInit = function xfInit() {
    return this.xf[tInit]();
  };

  Transducer.prototype[tStep] = function (value, input) {
    return this.xfStep(value, input);
  };

  Transducer.prototype.xfStep = function xfStep(value, input) {
    return this.xf[tStep](value, input);
  };

  Transducer.prototype[tResult] = function (value) {
    return this.xfResult(value);
  };

  Transducer.prototype.xfResult = function xfResult(value) {
    return this.xf[tResult](value);
  };

  return Transducer;
})();

exports.Transducer = Transducer;
//# sourceMappingURL=util.js.map

},{}],13:[function(require,module,exports){
module.exports = require(11)

},{"11":11}],14:[function(require,module,exports){
module.exports = require(3)([
  require(6),
  require(2),
  require(4)])

},{"2":2,"3":3,"4":4,"6":6}]},{},[14]);
