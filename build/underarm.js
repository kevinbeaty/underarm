(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

var array = require(20)
var forEach = array.forEach

module.exports = function(_r){
  // Array Functions
  // ---------------
  _r.mixin({
    forEach: forEach,
    each: forEach,
    find: find,
    detect: find,
    every: every,
    all: every,
    some: some,
    any: some,
    contains: contains,
    include: contains,
    findWhere: findWhere,
    push: array.push,
    unshift: array.unshift,
    at: at,
    slice: array.slice,
    initial: array.initial,
    last: last
  })

  var iteratee = _r.iteratee,
      resolveSingleValue = _r.resolveSingleValue,
      _ = _r._

  // Return the first value which passes a truth test. Aliased as `detect`.
  function find(predicate) {
     /*jshint validthis:true*/
     resolveSingleValue(this)
     return array.find(iteratee(predicate))
  }

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  function every(predicate) {
     /*jshint validthis:true*/
    resolveSingleValue(this)
    return array.every(iteratee(predicate))
  }

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  function some(predicate) {
     /*jshint validthis:true*/
    resolveSingleValue(this)
    return array.some(iteratee(predicate))
  }

  // Determine if contains a given value (using `===`).
  // Aliased as `include`.
  function contains(target) {
     /*jshint validthis:true*/
    return some.call(this, function(x){ return x === target })
  }

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  function findWhere(attrs) {
     /*jshint validthis:true*/
    return find.call(this, _.matches(attrs))
  }

  // Retrieves the value at the given index. Resolves as single value.
  function at(idx){
     /*jshint validthis:true*/
    resolveSingleValue(this)
    return array.slice(idx, idx+1)
  }

  // Get the last element. Passing **n** will return the last N  values.
  // Note that no items will be sent until completion.
  function last(n) {
    if(n === void 0){
     /*jshint validthis:true*/
      resolveSingleValue(this)
    }
    return array.last(n)
  }
}

},{"20":20}],2:[function(require,module,exports){
'use strict'
var Prom = require(15),
    async = require(18)

module.exports = function(_r){
  var empty = _r.empty,
      append = _r.append,
      unwrap = _r.unwrap,
      IGNORE = _r.IGNORE,
      transducer = _r.transducer,
      as = _r.as,
      _ = _r._

  _r.resolveAsync = resolveAsync
  _r.mixin({
    defer: defer,
    delay: delay
  })

  // Helper to mark transducer to resolve as a Promise
  //  Only valid when chaining, but this should be passed
  // when called as a function
  function resolveAsync(self){
    if(as(self)){
      self._opts.resolveAsync = true
    }
  }
  _r.prototype.async = function(){
    resolveAsync(this)
    return this
  }

  function isAsync(self){
    return as(self) && self._opts.resolveAsync
  }

  // Resolve async values as a promise
  _r.value.register(function(r){
    var promise
    if(r._opts.resolveAsync){
      if(!r._opts.resolveSingleValue){
        promise = r.into()
      } else {
        promise = r
          .into(IGNORE)
          .then(_value)
      }
      return promise
    }
  })

  function _value(result){
    return result === IGNORE ? void 0 : result
  }

  _r.wrap.register(function(value){
    if(value && typeof value.then === 'function'){
      /*jshint validthis:true*/
      resolveAsync(this)
    }
  })

  _r.prototype.then = function(resolve, reject){
    resolveAsync(this)
    return this.value()
      .then(resolve, reject)
  }

  function defer(){
    /*jshint validthis:true*/
    resolveAsync(this)
    return async.defer()
  }

  function delay(wait){
    /*jshint validthis:true*/
    resolveAsync(this)
    return async.delay(wait)
  }

  _r.transducer.register(function(self){
    if(isAsync(self)){
      return async.compose.apply(null, self._wrappedFns)
    }
  })

  function asXf(xf){
    if(as(xf)){
      xf = transducer(xf)
    }
    return xf
  }

  _r.reduce.register(function(xf, init, coll) {
    if(isAsync(xf)){
      return reduceAsync(xf, init, coll)
    }
  })

  function reduceAsync(xf, init, coll) {
    if (coll === null || coll === void 0) coll = empty(coll)
    return async.reduce(asXf(xf), init, coll)
      .then(unwrap)
  }

  _r.transduce.register(function(xf, f, init, coll){
    if(isAsync(xf)){
      return transduceAsync(xf, f, init, coll)
    }
  })

  function transduceAsync(xf, f, init, coll){
    return async.transduce(asXf(xf), f, init, coll)
      .then(unwrap)
  }

  _r.into.register(function(to, xf, from){
    if(isAsync(xf)){
      return intoAsync(to, xf, from)
    }
  })

  function intoAsync(to, xf, from){
    if(from === void 0){
      from = xf
      xf = void 0
    }
    xf = asXf(xf)
    return Prom
      .all([to, from])
      .then(_into(xf))
  }

  function _into(xf){
    return function(toFrom){
      var to = toFrom[0],
          from = toFrom[1]
      if(from === void 0){
        from = empty()
      }

      if(to === void 0){
        to = empty(from)
      }

      if(xf === void 0){
        return reduceAsync(append, to, from)
      }

      return transduceAsync(xf, append, to, from)
    }
  }

  // Returns a new collection of the empty value of the from collection
  _r.toArray.register(function(xf, from){
    if(isAsync(xf)){
      return Prom
        .all([from])
        .then(_toArray(xf))
    }
  })

  function _toArray(xf){
    return function(from){
      from = from[0]
      return intoAsync(empty(from), xf, from)
    }
  }
}

},{"15":15,"18":18}],3:[function(require,module,exports){
'use strict'
var util = require(13),
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

},{"13":13}],4:[function(require,module,exports){
'use strict'
var dispatcher = require(17)

module.exports = function(_r){
  var _ = _r._,
      as = _r.as,
      // sentinel to ignore wrapped objects (maintain only last item)
      IGNORE = _r.IGNORE = {}

  // Transducer Functions
  // --------------------
  var core = require(21),
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
      _util = require(13),
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

},{"13":13,"17":17,"21":21}],5:[function(require,module,exports){
'use strict'
var symIterator = require(21).protocols.iterator

module.exports = function(_r){
  _r.generate = generate

  // Transduces the current chained object by using the chained trasnformation
  // and an iterator created with the callback
  _r.prototype.generate = function(callback, callToInit){
    return this.withSource(generate(callback, callToInit))
  }

  // Creates an (duck typed) iterator that calls the provided next callback repeatedly
  // and uses the return value as the next value of the iterator.
  // Marks iterator as done if the next callback returns undefined (returns nothing)
  // Can be used to as a source obj to reduce, transduce etc
  function generate(callback, callToInit){
    var gen = {}
    gen[symIterator] = function(){
      var next = callToInit ? callback() : callback
      return {
        next: function(){
          var value = next()
          return (value === void 0) ? {done: true} : {done: false, value: value}
        }
      }
    }
    return gen
  }
}

},{"21":21}],6:[function(require,module,exports){
'use strict'
module.exports = function(libs, _r){
  var i = 0, len = libs.length, lib
  if(_r === void 0){
    _r = require(3)
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

},{"3":3}],7:[function(require,module,exports){
'use strict'
var math = require(29)

module.exports = function(_r){
  // Math Functions
  // --------------------
  _r.mixin({
    max: max,
    min: min
  })

  var iteratee = _r.iteratee,
      resolveSingleValue = _r.resolveSingleValue

  // Return the maximum element (or element-based computation).
  function max(f) {
    /*jshint validthis:true */
    resolveSingleValue(this)
    return math.max(iteratee(f))
  }

  // Return the minimum element (or element-based computation).
  function min(f) {
    /*jshint validthis:true */
    resolveSingleValue(this)
    return math.min(iteratee(f))
  }
}

},{"29":29}],8:[function(require,module,exports){
'use strict'
var transducers = require(31),
    async = require(18),
    tap = transducers.tap,
    _callback = async.callback

module.exports = function(_r){

  _r.mixin({tap: tap})
  _r.asCallback = asCallback
  _r.asyncCallback = asyncCallback

  var as = _r.as,
      dispatch = _r.dispatch,
      transducer = _r.transducer

  // Creates a callback that starts a transducer process and accepts
  // parameter as a new item in the process. Each item advances the state
  // of the transducer. If the transducer exhausts due to early termination,
  // all subsequent calls to the callback will no-op and return the computed result.
  //
  // If the callback is called with no argument, the transducer terminates,
  // and all subsequent calls will no-op and return the computed result.
  //
  // The callback returns undefined until completion. Once completed, the result
  // is always returned.
  //
  // If init is defined, maintains last value and does not buffer results.
  // If init is provided, it is dispatched
  function asCallback(xf, init){
    if(as(xf)){
      xf = transducer(xf)
    }

    var reducer
    if(init !== void 0){
      reducer = dispatch()
    }
    var ncb = _callback(xf, init)
    return function(item){
      return ncb(null, item)
    }
  }

  _r.prototype.asCallback = function(init){
    return asCallback(this, init)
  }

  // Creates an async callback that starts a transducer process and accepts
  // parameter cb(err, item) as a new item in the process. The returned callback
  // and the optional continuation follow node conventions with  fn(err, item).
  //
  // Each item advances the state  of the transducer, if the continuation
  // is provided, it will be called on completion or error. An error will terminate
  // the transducer and be propagated to the continuation.  If the transducer
  // exhausts due to early termination, any further call will be a no-op.
  //
  // If the callback is called with no item, it will terminate the transducer process.
  //
  // If init is defined, maintains last value and does not buffer results.
  // If init is provided, it is dispatched
  function asyncCallback(xf, continuation, init){
    if(as(xf)){
      xf = transducer(xf)
    }

    var reducer
    if(init !== void 0){
      reducer = dispatch()
    }
    return _callback(xf, reducer, continuation)
  }

  _r.prototype.asyncCallback = function(continuation, init){
    return asyncCallback(this, continuation, init)
  }
}

},{"18":18,"31":31}],9:[function(require,module,exports){
'use strict'
var core = require(21),
    seq = core.sequence,
    symbol = core.protocols.iterator

module.exports = function(_r){
  // Returns a new collection of the empty value of the from collection
  _r.sequence = sequence
  function sequence(xf, from){
    if(_r.as(xf)){
      xf = _r.transducer(xf)
    }
    return seq(xf, from)
  }

  // calls sequence with chained transformation and optional wrapped object
  _r.prototype.sequence = function(from){
    if(from === void 0){
      from = this._wrapped
    }
    return sequence(this, from)
  }

  _r.prototype[symbol] = function(){
    return _r.iterator(this.sequence())
  }
}

},{"21":21}],10:[function(require,module,exports){
'use strict'
var string = require(30)

module.exports = function(_r){
  // String Functions
  // --------------------
  _r.mixin({
    split: string.split,
    join: join,
    nonEmpty: string.nonEmpty,
    lines: string.lines,
    chars: string.chars,
    words: string.words
  })

  function join(separator){
    /*jshint validthis:true */
    _r.resolveSingleValue(this)
    return string.join(separator)
  }
}

},{"30":30}],11:[function(require,module,exports){
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
      util = require(13),
      transducers = require(31),
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

},{"13":13,"31":31}],12:[function(require,module,exports){
'use strict'
var transducers = require(31)

module.exports = function(_r){
  // Array Functions
  // ---------------
  _r.mixin({
    unique: unique,
    uniq: unique
  })

  var _ = _r._,
      iteratee = _r.iteratee

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  function unique(isSorted, f) {
     if (isSorted !== true && isSorted !== false) {
       f = isSorted
       isSorted = false
     }
     if(isSorted){
       return transducers.dedupe()
     }

     if (f !== void 0) f = iteratee(f)
     return transducers.unique(f)
  }
}

},{"31":31}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
'use strict'
// Based on Underscore.js 1.7.0
// http://underscorejs.org
//
// Which is distributed under MIT License:
// Underscore.js > (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Underscore.js > Underscore may be freely distributed under the MIT license.

var util = require(13),
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

},{"13":13}],15:[function(require,module,exports){
module.exports = require(16)().Promise

},{"16":16}],16:[function(require,module,exports){
"use strict"
var registered = {
  Promise: window.Promise,
  implementation: 'window.Promise'
}

/**
 * any-promise in browser is always global
 * polyfill as necessary
 */
module.exports = register
function register(){
  return registered
}

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
module.exports = require(19)

},{"19":19}],19:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.compose = compose;
exports.callback = callback;
exports.emitInto = emitInto;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _anyPromise = require(15);

var _anyPromise2 = _interopRequireDefault(_anyPromise);

var _transduceLibUtil = require(28);

var _transduceLib_internal = require(22);

var _protocols$transducer = _transduceLibUtil.protocols.transducer;
var tInit = _protocols$transducer.init;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;

// Transduce, reduce, into
var reduce = _transduceLib_internal.reduceImpl(_reduce);
exports.reduce = reduce;
var transduce = _transduceLib_internal.transduceImpl(_reduce);
exports.transduce = transduce;
var into = _transduceLib_internal.intoImpl(_reduce);

exports.into = into;
var _iterator = function _iterator(coll) {
  return _transduceLib_internal.iterable(coll)[_transduceLibUtil.protocols.iterator]();
};
var _iteratorValue = function _iteratorValue(item) {
  return { done: false, value: item };
};

function _reduce(xf, init, coll) {
  if (coll === void 0) {
    coll = init;
    init = xf[tInit]();
  }
  return _anyPromise2['default'].all([xf, init, coll]).then(function (_ref) {
    var xf = _ref[0];
    var init = _ref[1];
    var coll = _ref[2];
    return new Reduce(_iterator(coll), init, xf).iterate();
  });
}

var Reduce = (function () {
  function Reduce(iter, init, xf) {
    _classCallCheck(this, Reduce);

    this.xf = xf;
    this.iter = iter;
    this.value = init;
    this._step = this.__step.bind(this);
    this._loop = this.__loop.bind(this);
  }

  // Defer, delay compose

  Reduce.prototype.iterate = function iterate() {
    return _anyPromise2['default'].resolve(this.next()).then(this._step);
  };

  Reduce.prototype.next = function next() {
    var _this = this;

    return new _anyPromise2['default'](function (resolve, reject) {
      try {
        var item = _this.iter.next();
        if (!item.done) {
          item = _anyPromise2['default'].resolve(item.value).then(_iteratorValue);
        }
        resolve(item);
      } catch (e) {
        reject(e);
      }
    });
  };

  Reduce.prototype.__step = function __step(item) {
    var _this2 = this;

    return new _anyPromise2['default'](function (resolve, reject) {
      try {
        var result;
        if (item.done) {
          result = _this2.xf[tResult](_this2.value);
        } else {
          result = _anyPromise2['default'].resolve(_this2.xf[tStep](_this2.value, item.value)).then(_this2._loop);
        }
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  };

  Reduce.prototype.__loop = function __loop(value) {
    var _this3 = this;

    this.value = value;
    return new _anyPromise2['default'](function (resolve, reject) {
      try {
        var result;
        if (_transduceLibUtil.isReduced(value)) {
          result = _this3.xf[tResult](_transduceLibUtil.unreduced(value));
        } else {
          result = _this3.iterate();
        }
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  };

  return Reduce;
})();

function compose() {
  for (var _len = arguments.length, fromArgs = Array(_len), _key = 0; _key < _len; _key++) {
    fromArgs[_key] = arguments[_key];
  }

  var toArgs = [],
      len = fromArgs.length,
      i = 0;
  for (; i < len; i++) {
    toArgs.push(fromArgs[i]);
    toArgs.push(defer());
  }
  return _transduceLibUtil.compose.apply(null, toArgs);
}

var defer = function defer() {
  return delay();
};
exports.defer = defer;
var delay = function delay(wait) {
  return function (xf) {
    return new Delay(wait, xf);
  };
};
exports.delay = delay;

var Delay = (function () {
  function Delay(wait, xf) {
    _classCallCheck(this, Delay);

    var task = new DelayTask(wait, xf);
    this.xf = xf;
    this.task = task;
    this._step = task.step.bind(task);
    this._result = task.result.bind(task);
  }

  Delay.prototype[tInit] = function () {
    if (this.task.resolved) {
      return this.task.resolved;
    }

    return _anyPromise2['default'].resolve(this.xf[tInit]());
  };

  Delay.prototype[tStep] = function (value, input) {
    if (this.task.resolved) {
      return this.task.resolved;
    }

    return _anyPromise2['default'].all([value, input]).then(this._step);
  };

  Delay.prototype[tResult] = function (value) {
    if (this.task.resolved) {
      return this.task.resolved;
    }

    return _anyPromise2['default'].resolve(value).then(this._result);
  };

  return Delay;
})();

var DelayTask = (function () {
  function DelayTask(wait, xf) {
    _classCallCheck(this, DelayTask);

    this.wait = wait;
    this.xf = xf;
    this.q = [];
  }

  // Promises and callbacks

  DelayTask.prototype.call = function call() {
    var next = this.q[0];
    if (next && !next.processing) {
      next.processing = true;

      var wait = next.wait;
      if (wait > 0) {
        setTimeout(next.fn, wait);
      } else {
        next.fn();
      }
    }
  };

  DelayTask.prototype.step = function step(_ref2) {
    var value = _ref2[0];
    var input = _ref2[1];

    var task = this;
    return new _anyPromise2['default'](function (resolve, reject) {
      task.q.push({ fn: taskStep, wait: task.wait });
      task.call();

      function taskStep() {
        try {
          resolve(task.xf[tStep](value, input));
          task.q.shift();
          if (task.q.length > 0) {
            task.call();
          }
        } catch (e) {
          reject(e);
        }
      }
    });
  };

  DelayTask.prototype.result = function result(value) {
    var task = this;
    task.resolved = new _anyPromise2['default'](function (resolve, reject) {
      task.q.push({ fn: taskResult });
      task.call();
      function taskResult() {
        try {
          task.q = [];
          resolve(task.xf[tResult](value));
        } catch (e) {
          reject(e);
        }
      }
    });
    return task.resolved;
  };

  return DelayTask;
})();

var when = function when(promiseOrValue, t) {
  return _anyPromise2['default'].resolve(promiseOrValue).then(promiseTransform(t));
};
exports.when = when;
var promiseTransform = function promiseTransform(t) {
  return function (item) {
    return new _anyPromise2['default'](function (resolve, reject) {
      var cb = callback(t, null, function (err, result) {
        if (err) reject(err);else resolve(result);
      });
      cb(null, item);
      cb();
    });
  };
};

exports.promiseTransform = promiseTransform;

function callback(t, init, continuation) {
  var done = false,
      stepper,
      value,
      xf = _transduceLib_internal.transformer(init);

  stepper = t(xf);
  value = stepper[tInit]();

  function checkDone(err, item) {
    if (done) {
      return true;
    }

    err = err || null;

    // check if exhausted
    if (_transduceLibUtil.isReduced(value)) {
      value = _transduceLibUtil.unreduced(value);
      done = true;
    }

    if (err || done || item === void 0) {
      value = stepper[tResult](value);
      done = true;
    }

    // notify if done
    if (done) {
      if (continuation) {
        continuation(err, value);
        continuation = null;
        value = null;
      } else if (err) {
        value = null;
        throw err;
      }
    }

    return done;
  }

  return function (err, item) {
    if (!checkDone(err, item)) {
      try {
        // step to next result.
        value = stepper[tStep](value, item);
        checkDone(err, item);
      } catch (err2) {
        checkDone(err2, item);
      }
    }
    if (done) return value;
  };
}

function emitInto(to, t, from) {
  var cb;
  t = _transduceLibUtil.compose(t, emitData(to));
  cb = callback(t, null, continuation);
  from.on('data', onData);
  from.once('error', onError);
  from.once('end', onEnd);

  function continuation(err) {
    if (err) to.emit('error', err);
    to.emit('end');
  }

  function onData(item) {
    cb(null, item);
  }

  function onError(err) {
    cb(err);
  }

  function onEnd() {
    cb();
    removeListeners();
  }

  function removeListeners() {
    from.removeListener(onData).removeListener(onError).removeListener(onEnd);
  }

  return to;
}

var emitData = function emitData(emitter) {
  return function (xf) {
    return new EmitData(emitter, xf);
  };
};

var EmitData = (function (_Transducer) {
  _inherits(EmitData, _Transducer);

  function EmitData(emitter, xf) {
    _classCallCheck(this, EmitData);

    _Transducer.call(this, xf);
    this.emitter = emitter;
  }

  EmitData.prototype[tStep] = function (value, input) {
    this.emitter.emit('data', input);
    return value;
  };

  return EmitData;
})(_transduceLibUtil.Transducer);
//# sourceMappingURL=async.js.map

},{"15":15,"22":22,"28":28}],20:[function(require,module,exports){
module.exports = require(23)

},{"23":23}],21:[function(require,module,exports){
module.exports = require(24)

},{"24":24}],22:[function(require,module,exports){
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

var _util = require(28);

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

},{"28":28}],23:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.push = push;
exports.unshift = unshift;
exports.slice = slice;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _util = require(28);

var _protocols$transducer = _util.protocols.transducer;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;
var forEach = function forEach(f) {
  return function (xf) {
    return new ForEach(f, xf);
  };
};
exports.forEach = forEach;

var ForEach = (function (_Transducer) {
  _inherits(ForEach, _Transducer);

  function ForEach(f, xf) {
    _classCallCheck(this, ForEach);

    _Transducer.call(this, xf);
    this.f = f;
    this.idx = 0;
  }

  ForEach.prototype[tStep] = function (value, input) {
    this.f(input, this.idx++, value);
    return this.xfStep(value, input);
  };

  return ForEach;
})(_util.Transducer);

var find = function find(p) {
  return function (xf) {
    return new Find(p, xf);
  };
};
exports.find = find;

var Find = (function (_Transducer2) {
  _inherits(Find, _Transducer2);

  function Find(p, xf) {
    _classCallCheck(this, Find);

    _Transducer2.call(this, xf);
    this.p = p;
  }

  Find.prototype[tStep] = function (value, input) {
    if (this.p(input)) {
      value = _util.reduced(this.xfStep(value, input));
    }
    return value;
  };

  return Find;
})(_util.Transducer);

var every = function every(p) {
  return function (xf) {
    return new Every(p, xf);
  };
};
exports.every = every;

var Every = (function (_Transducer3) {
  _inherits(Every, _Transducer3);

  function Every(p, xf) {
    _classCallCheck(this, Every);

    _Transducer3.call(this, xf);
    this.p = p;
    this.found = false;
  }

  Every.prototype[tStep] = function (value, input) {
    if (!this.p(input)) {
      this.found = true;
      return _util.reduced(this.xfStep(value, false));
    }
    return value;
  };

  Every.prototype[tResult] = function (value) {
    if (!this.found) {
      value = this.xfStep(value, true);
    }
    return this.xfResult(value);
  };

  return Every;
})(_util.Transducer);

var some = function some(p) {
  return function (xf) {
    return new Some(p, xf);
  };
};
exports.some = some;

var Some = (function (_Transducer4) {
  _inherits(Some, _Transducer4);

  function Some(p, xf) {
    _classCallCheck(this, Some);

    _Transducer4.call(this, xf);
    this.p = p;
    this.found = false;
  }

  Some.prototype[tStep] = function (value, input) {
    if (this.p(input)) {
      this.found = true;
      return _util.reduced(this.xfStep(value, true));
    }
    return value;
  };

  Some.prototype[tResult] = function (value) {
    if (!this.found) {
      value = this.xfStep(value, false);
    }
    return this.xfResult(value);
  };

  return Some;
})(_util.Transducer);

var contains = function contains(target) {
  return some(function (x) {
    return x === target;
  });
};

exports.contains = contains;

function push() {
  for (var _len = arguments.length, toPush = Array(_len), _key = 0; _key < _len; _key++) {
    toPush[_key] = arguments[_key];
  }

  return function (xf) {
    return new Push(toPush, xf);
  };
}

var Push = (function (_Transducer5) {
  _inherits(Push, _Transducer5);

  function Push(toPush, xf) {
    _classCallCheck(this, Push);

    _Transducer5.call(this, xf);
    this.toPush = toPush;
  }

  Push.prototype[tResult] = function (value) {
    var idx;
    var len = this.toPush.length;
    for (idx = 0; idx < len; idx++) {
      value = this.xfStep(value, this.toPush[idx]);
      if (_util.isReduced(value)) {
        value = _util.unreduced(value);
        break;
      }
    }
    return this.xfResult(value);
  };

  return Push;
})(_util.Transducer);

function unshift() {
  for (var _len2 = arguments.length, toUnshift = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    toUnshift[_key2] = arguments[_key2];
  }

  return function (xf) {
    return new Unshift(toUnshift, xf);
  };
}

var Unshift = (function (_Transducer6) {
  _inherits(Unshift, _Transducer6);

  function Unshift(toUnshift, xf) {
    _classCallCheck(this, Unshift);

    _Transducer6.call(this, xf);
    this.toUnshift = toUnshift;
    this.done = false;
  }

  Unshift.prototype[tStep] = function (value, input) {
    if (!this.done) {
      var idx;
      var len = this.toUnshift.length;
      this.done = true;
      for (idx = 0; idx < len; idx++) {
        value = this.xfStep(value, this.toUnshift[idx]);
        if (_util.isReduced(value)) {
          return value;
        }
      }
    }
    return this.xfStep(value, input);
  };

  return Unshift;
})(_util.Transducer);

var initial = function initial(n) {
  return function (xf) {
    return new Initial(n, xf);
  };
};
exports.initial = initial;

var Initial = (function (_Transducer7) {
  _inherits(Initial, _Transducer7);

  function Initial(n, xf) {
    _classCallCheck(this, Initial);

    _Transducer7.call(this, xf);
    n = n === void 0 ? 1 : n > 0 ? n : 0;
    this.n = n;
    this.idx = 0;
    this.buffer = [];
  }

  Initial.prototype[tStep] = function (value, input) {
    this.buffer[this.idx++] = input;
    return value;
  };

  Initial.prototype[tResult] = function (value) {
    var idx = 0;
    var count = this.idx - this.n;
    for (idx = 0; idx < count; idx++) {
      value = this.xfStep(value, this.buffer[idx]);
      if (_util.isReduced(value)) {
        value = _util.unreduced(value);
        break;
      }
    }
    return this.xfResult(value);
  };

  return Initial;
})(_util.Transducer);

var last = function last(n) {
  return function (xf) {
    return new Last(n, xf);
  };
};
exports.last = last;

var Last = (function (_Transducer8) {
  _inherits(Last, _Transducer8);

  function Last(n, xf) {
    _classCallCheck(this, Last);

    _Transducer8.call(this, xf);
    if (n === void 0) {
      n = 1;
    } else {
      n = n > 0 ? n : 0;
    }
    this.n = n;
    this.idx = 0;
    this.buffer = [];
  }

  Last.prototype[tStep] = function (value, input) {
    this.buffer[this.idx++ % this.n] = input;
    return value;
  };

  Last.prototype[tResult] = function (value) {
    var count = this.n,
        idx = this.idx;
    if (idx < count) {
      count = idx;
      idx = 0;
    }
    while (count--) {
      value = this.xfStep(value, this.buffer[idx++ % this.n]);
      if (_util.isReduced(value)) {
        value = _util.unreduced(value);
        break;
      }
    }
    return this.xfResult(value);
  };

  return Last;
})(_util.Transducer);

function slice(begin, end) {
  if (begin === void 0) {
    begin = 0;
  }
  if (begin < 0) {
    if (end === void 0) {
      return last(-begin);
    }
    if (end >= 0) {
      return _util.compose(last(-begin), slice(0, end + begin + 1));
    }
  }
  if (end < 0) {
    if (begin === 0) {
      return initial(-end);
    }
    return _util.compose(slice(begin), initial(-end));
  }
  return function (xf) {
    return new Slice(begin, end, xf);
  };
}

var Slice = (function (_Transducer9) {
  _inherits(Slice, _Transducer9);

  function Slice(begin, end, xf) {
    _classCallCheck(this, Slice);

    _Transducer9.call(this, xf);
    this.begin = begin;
    this.end = end;
    this.idx = 0;
  }

  Slice.prototype[tStep] = function (value, input) {
    if (this.idx++ >= this.begin) {
      value = this.xfStep(value, input);
    }
    if (this.idx >= this.end) {
      value = _util.reduced(value);
    }
    return value;
  };

  return Slice;
})(_util.Transducer);
//# sourceMappingURL=array.js.map

},{"28":28}],24:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _stepTransformer;

exports.sequence = sequence;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _util = require(28);

// Transformer, iterable, completing

var _internal = require(22);

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

},{"22":22,"28":28}],25:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _util = require(28);

var _protocols$transducer = _util.protocols.transducer;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;
var max = function max(f) {
  return function (xf) {
    return new Max(f, xf);
  };
};
exports.max = max;

var Max = (function (_Transducer) {
  _inherits(Max, _Transducer);

  function Max(f, xf) {
    _classCallCheck(this, Max);

    _Transducer.call(this, xf);
    this.f = f || _util.identity;
    this.computedResult = -Infinity;
    this.lastComputed = -Infinity;
  }

  Max.prototype[tStep] = function (value, input) {
    var computed = this.f(input);
    if (computed > this.lastComputed || computed === -Infinity && this.computedResult === -Infinity) {
      this.computedResult = input;
      this.lastComputed = computed;
    }
    return value;
  };

  Max.prototype[tResult] = function (value) {
    return this.xfResult(this.xfStep(value, this.computedResult));
  };

  return Max;
})(_util.Transducer);

var min = function min(f) {
  return function (xf) {
    return new Min(f, xf);
  };
};
exports.min = min;

var Min = (function (_Transducer2) {
  _inherits(Min, _Transducer2);

  function Min(f, xf) {
    _classCallCheck(this, Min);

    _Transducer2.call(this, xf);
    this.f = f || _util.identity;
    this.computedResult = Infinity;
    this.lastComputed = Infinity;
  }

  Min.prototype[tStep] = function (value, input) {
    var computed = this.f(input);
    if (computed < this.lastComputed || computed === Infinity && this.computedResult === Infinity) {
      this.computedResult = input;
      this.lastComputed = computed;
    }
    return value;
  };

  Min.prototype[tResult] = function (value) {
    return this.xfResult(this.xfStep(value, this.computedResult));
  };

  return Min;
})(_util.Transducer);
//# sourceMappingURL=math.js.map

},{"28":28}],26:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.words = words;
exports.split = split;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _util = require(28);

var _protocols$transducer = _util.protocols.transducer;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;
var join = function join(separator) {
  return function (xf) {
    return new Join(separator, xf);
  };
};
exports.join = join;

var Join = (function (_Transducer) {
  _inherits(Join, _Transducer);

  function Join(separator, xf) {
    _classCallCheck(this, Join);

    _Transducer.call(this, xf);
    this.buffer = [];
    this.separator = separator;
  }

  Join.prototype[tStep] = function (value, input) {
    this.buffer.push(input);
    return value;
  };

  Join.prototype[tResult] = function (value) {
    value = this.xfStep(value, this.buffer.join(this.separator));
    return this.xfResult(value);
  };

  return Join;
})(_util.Transducer);

var nonEmpty = function nonEmpty() {
  return function (xf) {
    return new NonEmpty(xf);
  };
};
exports.nonEmpty = nonEmpty;

var NonEmpty = (function (_Transducer2) {
  _inherits(NonEmpty, _Transducer2);

  function NonEmpty(xf) {
    _classCallCheck(this, NonEmpty);

    _Transducer2.call(this, xf);
  }

  NonEmpty.prototype[tStep] = function (value, input) {
    if (_util.isString(input) && input.trim().length) {
      value = this.xfStep(value, input);
    }
    return value;
  };

  return NonEmpty;
})(_util.Transducer);

var lines = function lines(limit) {
  return split('\n', limit);
};
exports.lines = lines;
var chars = function chars(limit) {
  return split('', limit);
};

exports.chars = chars;

function words(delimiter, limit) {
  if (delimiter === void 0 || _util.isNumber(delimiter)) {
    limit = delimiter;
    delimiter = /\s+/;
  }
  return _util.compose(split(delimiter, limit), nonEmpty());
}

function split(separator, limit) {
  return function (xf) {
    return new Split(separator, limit, xf);
  };
}

var Split = (function (_Transducer3) {
  _inherits(Split, _Transducer3);

  function Split(separator, limit, xf) {
    _classCallCheck(this, Split);

    _Transducer3.call(this, xf);
    if (_util.isRegExp(separator)) {
      separator = cloneRegExp(separator);
    }
    this.separator = separator;
    this.next = null;
    this.idx = 0;

    if (limit == void 0) {
      limit = Infinity;
    }
    this.limit = limit;

    if (!_util.isRegExp(separator) && separator !== '') {
      this.spliterate = spliterateString;
    } else if (_util.isRegExp(separator)) {
      this.spliterate = spliterateRegExp;
    } else {
      this.spliterate = spliterateChars;
    }
  }

  Split.prototype[tStep] = function (value, input) {
    if (input === null || input === void 0) {
      return value;
    }

    var str = (this.next && this.next.value || '') + input,
        chunk = this.spliterate(str, this.separator);

    for (;;) {
      this.next = chunk();
      if (this.next.done) {
        break;
      }

      value = this.xfStep(value, this.next.value);

      if (++this.idx >= this.limit) {
        this.next = null;
        value = _util.reduced(value);
        break;
      }
    }
    return value;
  };

  Split.prototype[tResult] = function (value) {
    if (this.next && this.next.value !== null && this.next.value !== void 0) {
      value = this.xfStep(value, this.next.value);
    }
    return this.xfResult(value);
  };

  return Split;
})(_util.Transducer);

function spliterateChars(str) {
  var i = 0,
      len = str.length,
      result = { done: false };
  return function () {
    result.value = str[i++];
    if (i >= len) {
      result.done = true;
    }
    return result;
  };
}

function spliterateString(str, separator) {
  var first,
      second,
      sepLen = separator.length,
      result = { done: false };
  return function () {
    first = first === void 0 ? 0 : second + sepLen;
    second = str.indexOf(separator, first);

    if (second < 0) {
      result.done = true;
      second = void 0;
    }
    result.value = str.substring(first, second);
    return result;
  };
}

function spliterateRegExp(str, pattern) {
  var index,
      match,
      result = { done: false };
  pattern = cloneRegExp(pattern);
  return function () {
    match = pattern.exec(str);
    if (match) {
      index = match.index;
      result.value = str.substring(0, index);
      str = str.substring(index + match[0].length);
    } else {
      result.done = true;
      result.value = str;
    }
    return result;
  };
}

function cloneRegExp(regexp) {
  // From https://github.com/aheckmann/regexp-clone
  var flags = [];
  if (regexp.global) flags.push('g');
  if (regexp.multiline) flags.push('m');
  if (regexp.ignoreCase) flags.push('i');
  return new RegExp(regexp.source, flags.join(''));
}
//# sourceMappingURL=string.js.map

},{"28":28}],27:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _util = require(28);

var _core = require(24);

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

},{"24":24,"28":28}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
module.exports = require(25)

},{"25":25}],30:[function(require,module,exports){
module.exports = require(26)

},{"26":26}],31:[function(require,module,exports){
module.exports = require(27)

},{"27":27}],32:[function(require,module,exports){
module.exports = require(6)([
  require(14),
  require(4),
  require(11),
  require(9),
  require(1),
  require(12),
  require(8),
  require(5),
  require(7),
  require(10),
  require(2)])

},{"1":1,"10":10,"11":11,"12":12,"14":14,"2":2,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9}]},{},[32]);
