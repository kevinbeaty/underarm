(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

var forEach = require(29)

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
    push: require(32),
    unshift: require(35),
    at: at,
    slice: require(33),
    initial: require(30),
    last: last
  })

  var iteratee = _r.iteratee,
      resolveSingleValue = _r.resolveSingleValue,
      _ = _r._

  // Return the first value which passes a truth test. Aliased as `detect`.
  var _find = require(28)
  function find(predicate) {
     /*jshint validthis:true*/
     resolveSingleValue(this)
     return _find(iteratee(predicate))
  }

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  var _every = require(27)
  function every(predicate) {
     /*jshint validthis:true*/
    resolveSingleValue(this)
    return _every(iteratee(predicate))
  }

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  var _some = require(34)
  function some(predicate) {
     /*jshint validthis:true*/
    resolveSingleValue(this)
    return _some(iteratee(predicate))
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
  var _slice = require(33)
  function at(idx){
     /*jshint validthis:true*/
    resolveSingleValue(this)
    return _slice(idx, idx+1)
  }

  // Get the last element. Passing **n** will return the last N  values.
  // Note that no items will be sent until completion.
  var _last = require(31)
  function last(n) {
    if(n === void 0){
     /*jshint validthis:true*/
      resolveSingleValue(this)
    }
    return _last(n)
  }
}

},{"27":27,"28":28,"29":29,"30":30,"31":31,"32":32,"33":33,"34":34,"35":35}],2:[function(require,module,exports){
'use strict'
var Prom = require(16),
    _defer = require(39),
    _delay = require(40),
    _compose = require(38),
    _reduce = require(41),
    _transduce = require(42)

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
    return _defer()
  }

  function delay(wait){
    /*jshint validthis:true*/
    resolveAsync(this)
    return _delay(wait)
  }

  _r.transducer.register(function(self){
    if(isAsync(self)){
      return _compose.apply(null, self._wrappedFns)
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
    return _reduce(asXf(xf), init, coll)
      .then(unwrap)
  }

  _r.transduce.register(function(xf, f, init, coll){
    if(isAsync(xf)){
      return transduceAsync(xf, f, init, coll)
    }
  })

  function transduceAsync(xf, f, init, coll){
    return _transduce(asXf(xf), f, init, coll)
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

},{"16":16,"38":38,"39":39,"40":40,"41":41,"42":42}],3:[function(require,module,exports){
'use strict'
var util = require(60),
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

_r.VERSION = '0.7.0'

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

},{"60":60}],4:[function(require,module,exports){
'use strict'
var dispatcher = require(26)

module.exports = function(_r){
  var _ = _r._,
      as = _r.as,
      // sentinel to ignore wrapped objects (maintain only last item)
      IGNORE = _r.IGNORE = {}

  // Transducer Functions
  // --------------------
  var value = _r.value = dispatcher(),
      wrap = _r.wrap = dispatcher(),
      unwrap = _r.unwrap = dispatcher(),
      empty = _r.empty = dispatcher(),
      append = _r.append = dispatcher(),
      reduce = _r.reduce = dispatcher(),
      _reduce = require(53),
      _unreduced = require(59),
      transduce = _r.transduce = dispatcher(),
      _transduce = require(56),
      into = _r.into = dispatcher(),
      transducer = _r.transducer = dispatcher(),
      iterator = _r.iterator = dispatcher(),
      _iterable = require(51),
      _protocols = require(52),
      toArray = _r.toArray = dispatcher(),
      _toArray = require(49)([]),
      _util = require(60),
      iteratee = _r.iteratee = dispatcher()
  _r.resolveSingleValue = resolveSingleValue
  _r.resolveMultipleValues = resolveMultipleValues
  _r.reduced = require(54)
  _r.isReduced = require(50)
  _r.foldl = reduce
  _r.inject = reduce
  _r.deref = unwrap
  _r.conj = append
  _r.conjoin = append
  _r.dispatch = dispatch

  var compose = _r.compose = require(48)
  _r.transformer = require(58)
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

},{"26":26,"48":48,"49":49,"50":50,"51":51,"52":52,"53":53,"54":54,"56":56,"58":58,"59":59,"60":60}],5:[function(require,module,exports){
'use strict'
var symIterator = require(52).iterator

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

},{"52":52}],6:[function(require,module,exports){
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
var _max = require(61),
    _min = require(62)

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
    return _max(iteratee(f))
  }

  // Return the minimum element (or element-based computation).
  function min(f) {
    /*jshint validthis:true */
    resolveSingleValue(this)
    return _min(iteratee(f))
  }
}

},{"61":61,"62":62}],8:[function(require,module,exports){
'use strict'
var tap = require(81),
    _callback = require(37)

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

},{"37":37,"81":81}],9:[function(require,module,exports){
'use strict'
var transducer = require(57)
module.exports = function(_r){
  var _ = _r._

  _r.mixin({
    throttle: throttle,
    debounce: debounce
  })

  function throttle(wait, options){
    return sample(sampler_(_.throttle, wait, options))
  }

  function debounce(wait, immediate){
    return sample(sampler_(_.debounce, wait, immediate))
  }

  function sampler_(debounce, wait, options){
    return function(fn){
      return debounce(fn, wait, options)
    }
  }

  function sample(sampler){
    return transducer(function(step, value, input){
      if(this._sample === void 0){
         this._sample = sampler(this.step)
      }
      var res = this._sample(value, input)
      return res !== void 0 ? res : value
    })
  }
}

},{"57":57}],10:[function(require,module,exports){
'use strict'
var seq = require(55),
    symbol = require(52).iterator

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

},{"52":52,"55":55}],11:[function(require,module,exports){
'use strict'

module.exports = function(_r){
  // String Functions
  // --------------------
  _r.mixin({
    split: require(67),
    join: join,
    nonEmpty: require(66),
    lines: require(65),
    chars: require(63),
    words: require(68)
  })

  var _join = require(64)
  function join(separator){
    /*jshint validthis:true */
    _r.resolveSingleValue(this)
    return _join(separator)
  }
}

},{"63":63,"64":64,"65":65,"66":66,"67":67,"68":68}],12:[function(require,module,exports){
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
      util = require(60),
      isFunction = util.isFunction,
      identity = util.identity

  // Return the results of applying the iteratee to each element.
  var _map = require(74)
  function map(f) {
    return _map(iteratee(f))
  }

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  var _filter = require(73)
  function filter(predicate) {
    return _filter(iteratee(predicate))
  }

  // Return all the elements for which a truth test fails.
  var _remove = require(78)
  function remove(predicate) {
    return _remove(iteratee(predicate))
  }

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`.
  var _take = require(79)
  function take(n) {
     if(n === void 0){
       /*jshint validthis:true*/
       _r.resolveSingleValue(this)
       n = 1
     } else {
       n = (n > 0) ? n : 0
     }
     return _take(n)
  }

  // takes items until predicate returns false
  var _takeWhile = require(80)
  function takeWhile(predicate) {
     return _takeWhile(iteratee(predicate))
  }

  // Returns everything but the first entry. Aliased as `tail` and `drop`.
  // Passing an **n** will return the rest N values.
  var _drop = require(71)
  function drop(n) {
    n = (n === void 0) ? 1 : (n > 0) ? n : 0
    return _drop(n)
  }

  // Drops items while the predicate returns true
  var _dropWhile = require(72)
  function dropWhile(predicate) {
     return _dropWhile(iteratee(predicate))
  }

  // Concatenating transducer.
  // NOTE: unlike libraries, cat should be called as a function to use.
  // _r.cat() not _r.cat
  var _cat = require(69)
  function cat(){
    return _cat
  }

  // mapcat.
  // Composition of _r.map(f) and _r.cat()
  var _mapcat = require(75)
  function mapcat(f){
    return _mapcat(iteratee(f))
  }

  // Partitions the source into arrays of size n
  // When transformer completes, the array will be stepped with any remaining items.
  // Alias chunkAll
  var _partitionAll = require(76)
  function partitionAll(n){
    return _partitionAll(n)
  }

  // Partitions the source into sub arrays while the value of the function
  // changes equality.
  var _partitionBy = require(77)
  function partitionBy(f){
    return _partitionBy(iteratee(f))
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

},{"60":60,"69":69,"71":71,"72":72,"73":73,"74":74,"75":75,"76":76,"77":77,"78":78,"79":79,"80":80}],13:[function(require,module,exports){
'use strict'
var _unique = require(82),
    _dedupe = require(70)

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
       return _dedupe()
     }

     if (f !== void 0) f = iteratee(f)
     return _unique(f)
  }
}

},{"70":70,"82":82}],14:[function(require,module,exports){
'use strict'
module.exports = function(_r){
  var _ = _r._ || {}
  _r._ = _
  _.debounce = require(18)
  _.throttle = require(19)
}

},{"18":18,"19":19}],15:[function(require,module,exports){
'use strict'
// Based on Underscore.js 1.7.0
// http://underscorejs.org
//
// Which is distributed under MIT License:
// Underscore.js > (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Underscore.js > Underscore may be freely distributed under the MIT license.

var util = require(60),
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

},{"60":60}],16:[function(require,module,exports){
module.exports = Promise;

},{}],17:[function(require,module,exports){
var isNative = require(23);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeNow = isNative(nativeNow = Date.now) && nativeNow;

/**
 * Gets the number of milliseconds that have elapsed since the Unix epoch
 * (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @category Date
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => logs the number of milliseconds it took for the deferred function to be invoked
 */
var now = nativeNow || function() {
  return new Date().getTime();
};

module.exports = now;

},{"23":23}],18:[function(require,module,exports){
var isObject = require(24),
    now = require(17);

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time it was invoked. The created function comes
 * with a `cancel` method to cancel delayed invocations. Provide an options
 * object to indicate that `func` should be invoked on the leading and/or
 * trailing edge of the `wait` timeout. Subsequent calls to the debounced
 * function return the result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=false] Specify invoking on the leading
 *  edge of the timeout.
 * @param {number} [options.maxWait] The maximum time `func` is allowed to be
 *  delayed before it is invoked.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // avoid costly calculations while the window size is in flux
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
 * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // ensure `batchLog` is invoked once after 1 second of debounced calls
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', _.debounce(batchLog, 250, {
 *   'maxWait': 1000
 * }));
 *
 * // cancel a debounced call
 * var todoChanges = _.debounce(batchLog, 1000);
 * Object.observe(models.todo, todoChanges);
 *
 * Object.observe(models, function(changes) {
 *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
 *     todoChanges.cancel();
 *   }
 * }, ['delete']);
 *
 * // ...at some point `models.todo` is changed
 * models.todo.completed = true;
 *
 * // ...before 1 second has passed `models.todo` is deleted
 * // which cancels the debounced `todoChanges` call
 * delete models.todo;
 */
function debounce(func, wait, options) {
  var args,
      maxTimeoutId,
      result,
      stamp,
      thisArg,
      timeoutId,
      trailingCall,
      lastCalled = 0,
      maxWait = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = wait < 0 ? 0 : (+wait || 0);
  if (options === true) {
    var leading = true;
    trailing = false;
  } else if (isObject(options)) {
    leading = options.leading;
    maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
    trailing = 'trailing' in options ? options.trailing : trailing;
  }

  function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
  }

  function delayed() {
    var remaining = wait - (now() - stamp);
    if (remaining <= 0 || remaining > wait) {
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
      }
      var isCalled = trailingCall;
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (isCalled) {
        lastCalled = now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
      }
    } else {
      timeoutId = setTimeout(delayed, remaining);
    }
  }

  function maxDelayed() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
    if (trailing || (maxWait !== wait)) {
      lastCalled = now();
      result = func.apply(thisArg, args);
      if (!timeoutId && !maxTimeoutId) {
        args = thisArg = null;
      }
    }
  }

  function debounced() {
    args = arguments;
    stamp = now();
    thisArg = this;
    trailingCall = trailing && (timeoutId || !leading);

    if (maxWait === false) {
      var leadingCall = leading && !timeoutId;
    } else {
      if (!maxTimeoutId && !leading) {
        lastCalled = stamp;
      }
      var remaining = maxWait - (stamp - lastCalled),
          isCalled = remaining <= 0 || remaining > maxWait;

      if (isCalled) {
        if (maxTimeoutId) {
          maxTimeoutId = clearTimeout(maxTimeoutId);
        }
        lastCalled = stamp;
        result = func.apply(thisArg, args);
      }
      else if (!maxTimeoutId) {
        maxTimeoutId = setTimeout(maxDelayed, remaining);
      }
    }
    if (isCalled && timeoutId) {
      timeoutId = clearTimeout(timeoutId);
    }
    else if (!timeoutId && wait !== maxWait) {
      timeoutId = setTimeout(delayed, wait);
    }
    if (leadingCall) {
      isCalled = true;
      result = func.apply(thisArg, args);
    }
    if (isCalled && !timeoutId && !maxTimeoutId) {
      args = thisArg = null;
    }
    return result;
  }
  debounced.cancel = cancel;
  return debounced;
}

module.exports = debounce;

},{"17":17,"24":24}],19:[function(require,module,exports){
var debounce = require(18),
    isObject = require(24);

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as an internal `_.debounce` options object by `_.throttle`. */
var debounceOptions = {
  'leading': false,
  'maxWait': 0,
  'trailing': false
};

/**
 * Creates a function that only invokes `func` at most once per every `wait`
 * milliseconds. The created function comes with a `cancel` method to cancel
 * delayed invocations. Provide an options object to indicate that `func`
 * should be invoked on the leading and/or trailing edge of the `wait` timeout.
 * Subsequent calls to the throttled function return the result of the last
 * `func` call.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the throttled function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=true] Specify invoking on the leading
 *  edge of the timeout.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // avoid excessively updating the position while scrolling
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // invoke `renewToken` when the click event is fired, but not more than once every 5 minutes
 * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
 *   'trailing': false
 * }));
 *
 * // cancel a trailing throttled call
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (options === false) {
    leading = false;
  } else if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  debounceOptions.leading = leading;
  debounceOptions.maxWait = +wait;
  debounceOptions.trailing = trailing;
  return debounce(func, wait, debounceOptions);
}

module.exports = throttle;

},{"18":18,"24":24}],20:[function(require,module,exports){
/**
 * Converts `value` to a string if it is not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  return value == null ? '' : (value + '');
}

module.exports = baseToString;

},{}],21:[function(require,module,exports){
/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
var isHostObject = (function() {
  try {
    Object({ 'toString': 0 } + '');
  } catch(e) {
    return function() { return false; };
  }
  return function(value) {
    // IE < 9 presents many host objects as `Object` objects that can coerce
    // to strings despite having improperly defined `toString` methods.
    return typeof value.toString != 'function' && typeof (value + '') == 'string';
  };
}());

module.exports = isHostObject;

},{}],22:[function(require,module,exports){
/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],23:[function(require,module,exports){
var escapeRegExp = require(25),
    isHostObject = require(21),
    isObjectLike = require(22);

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reHostCtor = /^\[object .+?Constructor\]$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reNative = RegExp('^' +
  escapeRegExp(objToString)
  .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (objToString.call(value) == funcTag) {
    return reNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && (isHostObject(value) ? reNative : reHostCtor).test(value);
}

module.exports = isNative;

},{"21":21,"22":22,"25":25}],24:[function(require,module,exports){
/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (!!value && type == 'object');
}

module.exports = isObject;

},{}],25:[function(require,module,exports){
var baseToString = require(20);

/**
 * Used to match `RegExp` [special characters](http://www.regular-expressions.info/characters.html#special).
 * In addition to special characters the forward slash is escaped to allow for
 * easier `eval` use and `Function` compilation.
 */
var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
    reHasRegExpChars = RegExp(reRegExpChars.source);

/**
 * Escapes the `RegExp` special characters "\", "/", "^", "$", ".", "|", "?",
 * "*", "+", "(", ")", "[", "]", "{" and "}" in `string`.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https:\/\/lodash\.com\/\)'
 */
function escapeRegExp(string) {
  string = baseToString(string);
  return (string && reHasRegExpChars.test(string))
    ? string.replace(reRegExpChars, '\\$&')
    : string;
}

module.exports = escapeRegExp;

},{"20":20}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
'use strict'
var transducer = require(57),
    reduced = require(54)

module.exports =
function every(predicate) {
  return transducer(
    function(step, value, input){
      if(!predicate(input)){
        this.found = true
        return reduced(step(value, false))
      }
      return value
    },
    function(result, value){
      if(!this.found){
        value = this.step(value, true)
      }
      return result(value)
    })
}

},{"54":54,"57":57}],28:[function(require,module,exports){
'use strict'
var transducer = require(57),
    reduced = require(54)

// Return the first value which passes a truth test. Aliased as `detect`.
module.exports =
function find(predicate) {
  return transducer(function(step, value, input){
    if(predicate(input)){
      value = reduced(step(value, input))
    }
    return value
  })
}

},{"54":54,"57":57}],29:[function(require,module,exports){
'use strict'
var transducer = require(57)

// Executes f with f(input, idx, result) for forEach item
// passed through transducer without changing the result.
module.exports =
function forEach(f) {
  return transducer(function(step, value, input){
    if(this.idx === void 0){
      this.idx = 0
    }
    f(input, this.idx++, value)
    return step(value, input)
  })
}

},{"57":57}],30:[function(require,module,exports){
'use strict'
var transducer = require(57),
    isReduced = require(50),
    unreduced = require(59)

// Returns everything but the last entry. Passing **n** will return all the values
// excluding the last N.
// Note that no items will be sent and all items will be buffered until completion.
module.exports =
function initial(n) {
  n = (n === void 0) ? 1 : (n > 0) ? n : 0
  return transducer(
    function(step, value, input){
      if(this.buffer === void 0){
        this.n = n
        this.idx = 0
        this.buffer = []
      }
      this.buffer[this.idx++] = input
      return value
    },
    function(result, value){
      var idx = 0, count = this.idx - this.n, buffer = this.buffer
      for(idx = 0; idx < count; idx++){
        value = this.step(value, buffer[idx])
        if(isReduced(value)){
          value = unreduced(value)
          break
        }
      }
      return result(value)
    })
}

},{"50":50,"57":57,"59":59}],31:[function(require,module,exports){
'use strict'
var transducer = require(57),
    isReduced = require(50),
    unreduced = require(59)

// Get the last element. Passing **n** will return the last N  values.
// Note that no items will be sent until completion.
module.exports =
function last(n) {
  if(n === void 0){
    n = 1
  } else {
    n = (n > 0) ? n : 0
  }
  return transducer(
    function(step, value, input){
      if(this.buffer === void 0){
        this.n = n
        this.idx = 0
        this.buffer = []
      }
      this.buffer[this.idx++ % this.n] = input
      return value
    },
    function(result, value){
      var n = this.n, count = n, buffer=this.buffer, idx=this.idx
      if(idx < count){
        count = idx
        idx = 0
      }
      while(count--){
        value = this.step(value, buffer[idx++ % n])
        if(isReduced(value)){
          value = unreduced(value)
          break
        }
      }
      return result(value)
    })
}

},{"50":50,"57":57,"59":59}],32:[function(require,module,exports){
'use strict'
var transducer = require(57),
    isReduced = require(50),
    unreduced = require(59),
    _slice = Array.prototype.slice

// Adds one or more items to the end of the sequence, like Array.prototype.push.
module.exports =
function push(){
  var toPush = _slice.call(arguments)
  return transducer(
    null,
    function(result, value){
      var idx, len = toPush.length
      for(idx = 0; idx < len; idx++){
        value = this.step(value, toPush[idx])
        if(isReduced(value)){
          value = unreduced(value)
          break
        }
      }
      return result(value)
    })
}

},{"50":50,"57":57,"59":59}],33:[function(require,module,exports){
'use strict'
var transducer = require(57),
    compose = require(48),
    reduced = require(54),
    initial = require(30),
    last = require(31)

module.exports =
function slice(begin, end){
  if(begin === void 0){
    begin = 0
  }

  if(begin < 0){
    if(end === void 0){
      return last(-begin)
    }
    if(end >= 0){
      return compose(last(-begin), slice(0, end+begin+1))
    }
  }

  if(end < 0){
    if(begin === 0){
      return initial(-end)
    }
    return compose(slice(begin), initial(-end))
  }
  return transducer(function(step, value, input){
    if(this.idx === void 0){

      this.idx = 0
    }
    if(this.idx++ >= begin){
      value = step(value, input)
    }
    if(this.idx >= end){
      value = reduced(value)
    }
    return value
  })
}

},{"30":30,"31":31,"48":48,"54":54,"57":57}],34:[function(require,module,exports){
'use strict'
var transducer = require(57),
    reduced = require(54)

// Determine if at least one element in the object matches a truth test.
// Aliased as `any`.
// Early termination if item matches predicate.
module.exports =
function some(predicate) {
  return transducer(
    function(step, value, input){
      if(predicate(input)){
        this.found = true
        return reduced(step(value, true))
      }
      return value
    },
    function(result, value){
      if(!this.found){
        value = this.step(value, false)
      }
      return result(value)
    })
}

},{"54":54,"57":57}],35:[function(require,module,exports){
'use strict'
var transducer = require(57), 
    isReduced = require(50),
    _slice = Array.prototype.slice

// Adds one or more items to the beginning of the sequence, like Array.prototype.unshift.
module.exports =
function unshift(){
  var toUnshift = _slice.call(arguments)
  return transducer(function(step, value, input){
    if(!this.done){
      var idx, len = toUnshift.length
      this.done = true
      for(idx = 0; idx < len; idx++){
        value = step(value, toUnshift[idx])
        if(isReduced(value)){
          return value
        }
      }
    }
    return step(value, input)
  })
}

},{"50":50,"57":57}],36:[function(require,module,exports){
'use strict'
var Prom = require(16),
    isReduced = require(50),
    unreduced = require(59),
    transformer = require(58),
    iterable = require(51),
    protocols = require(52),
    tp = protocols.transducer

module.exports = {
  transduce: transduce,
  reduce: reduce
}

var _transduce = spread(__transduce),
    _reduce = spread(__reduce)
function spread(fn, ctx){
  return function(arr){
    return fn.apply(ctx, arr)
  }
}

function transduce(t, xf, init, coll){
  return Prom
    .all([t, xf, init, coll])
    .then(_transduce)
}

function __transduce(t, xf, init, coll){
  xf = transformer(xf)
  xf = t(xf)
  return reduce(xf, init, coll)
}

function reduce(xf, init, coll){
  if(coll === void 0){
    coll = init
    init = xf.init()
  }
  return Prom
    .all([xf, init, coll])
    .then(_reduce)
}

function __reduce(xf, init, coll){
  xf = transformer(xf)
  var reduce = new Reduce(_iterator(coll), init, xf)
  return reduce.iterate()
}
function Reduce(iter, init, xf){
  var self = this
  self.xf = xf
  self.iter = iter
  self.value = init
  self._step = spread(self.__step, self)
  self._loop = spread(self.__loop, self)
}
Reduce.prototype.iterate = function(){
  var self = this
  return Prom
    .all([self.next()])
    .then(self._step)
}
Reduce.prototype.next = function(){
  var self = this
  return new Prom(function(resolve, reject){
    try {
      var item = self.iter.next()
      if(!item.done){
        item = Prom
          .all([item.value])
          .then(_iteratorValue)
      }
      resolve(item)
    } catch(e){
      reject(e)
    }
  })
}
Reduce.prototype.__step = function(item){
  var self = this
  return new Prom(function(resolve, reject){
    try {
      var result
      if(item.done){
        result = self.xf[tp.result](self.value)
      } else {
        result = Prom
          .all([self.xf[tp.step](self.value, item.value)])
          .then(self._loop)
      }
      resolve(result)
    } catch(e){
      reject(e)
    }
  })
}
Reduce.prototype.__loop = function(value){
  var self = this
  self.value = value
  return new Prom(function(resolve, reject){
    try {
      var result
      if(isReduced(value)){
        result = self.xf[tp.result](unreduced(value))
      } else {
        result = self.iterate()
      }
      resolve(result)
    } catch(e){
      reject(e)
    }
  })
}

function _iterator(coll){
  return iterable(coll)[protocols.iterator]()
}

function _iteratorValue(item){
  return {done: false, value: item[0]}
}

},{"16":16,"50":50,"51":51,"52":52,"58":58,"59":59}],37:[function(require,module,exports){
'use strict'
var isReduced = require(50),
    unreduced = require(59),
    transformer = require(58),
    tp = require(52).transducer

module.exports =
function callback(t, init, continuation){
  var done = false, stepper, value,
      xf = transformer(init)

  stepper = t(xf)
  value = stepper[tp.init]()

  function checkDone(err, item){
    if(done){
      return true
    }

    err = err || null

    // check if exhausted
    if(isReduced(value)){
      value = unreduced(value)
      done = true
    }

    if(err || done || item === void 0){
      value = stepper[tp.result](value)
      done = true
    }

    // notify if done
    if(done){
      if(continuation){
        continuation(err, value)
        continuation = null
        value = null
      } else if(err){
        value = null
        throw err
      }
    }

    return done
  }

  return function(err, item){
    if(!checkDone(err, item)){
      try {
        // step to next result.
        value = stepper[tp.step](value, item)
        checkDone(err, item)
      } catch(err2){
        checkDone(err2, item)
      }
    }
    if(done) return value
  }
}

},{"50":50,"52":52,"58":58,"59":59}],38:[function(require,module,exports){
'use strict'
var defer = require(39),
    comp = require(48)

module.exports =
function compose(/*args*/){
  var toArgs = [],
      fromArgs = arguments,
      len = fromArgs.length,
      i = 0
  for(; i < len; i++){
    toArgs.push(fromArgs[i])
    toArgs.push(defer())
  }
  return comp.apply(null, toArgs)
}

},{"39":39,"48":48}],39:[function(require,module,exports){
'use strict'
var delay = require(40)

module.exports =
function defer() {
  return delay()
}

},{"40":40}],40:[function(require,module,exports){
'use strict'
var Prom = require(16),
    tp = require(52).transducer

module.exports = 
function delay(wait) {
  return function(xf){
    return new Delay(wait, xf)
  }
}
function Delay(wait, xf) {
  var self = this,
      task = new DelayTask(wait, xf)
  self.xf = xf
  self.task = task
  self._step = spread(task.step, task)
  self._result = spread(task.result, task)
}

Delay.prototype[tp.init] = function(){
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .resolve(self.xf[tp.init]())
}
Delay.prototype[tp.step] = function(value, input) {
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .all([value, input])
    .then(self._step)
}
Delay.prototype[tp.result] = function(value){
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .all([value])
    .then(self._result)
}

function DelayTask(wait, xf){
  this.wait = wait
  this.xf = xf
  this.q = []
}
DelayTask.prototype.call = function(){
  var next = this.q[0]
  if(next && !next.processing){
    next.processing = true

    var wait = next.wait
    if(wait > 0){
      setTimeout(next.fn, wait)
    } else {
      next.fn()
    }
  }
}
DelayTask.prototype.step = function(value, input){
  var task = this
  return new Prom(function(resolve, reject){
    task.q.push({fn: step, wait: task.wait})
    task.call()

    function step(){
      try {
        resolve(task.xf[tp.step](value, input))
        task.q.shift()
        if(task.q.length > 0){
          task.call()
        }
      } catch(e){
        reject(e)
      }
    }
  })
}
DelayTask.prototype.result = function(value){
  var task = this
  task.resolved = new Prom(function(resolve, reject){
    task.q.push({fn: result})
    task.call()
    function result(){
      try {
        task.q = []
        resolve(task.xf[tp.result](value))
      } catch(e){
        reject(e)
      }
    }
  })
  return task.resolved
}

function spread(fn, ctx){
  return function(arr){
    return fn.apply(ctx, arr)
  }
}

},{"16":16,"52":52}],41:[function(require,module,exports){
'use strict'
module.exports = require(45)(require(36))

},{"36":36,"45":45}],42:[function(require,module,exports){
'use strict'
module.exports = require(46)(require(36))

},{"36":36,"46":46}],43:[function(require,module,exports){
'use strict'
var isReduced = require(50),
    unreduced = require(59),
    iterable = require(51),
    protocols = require(52),
    tp = protocols.transducer,
    util = require(60),
    isArray = util.isArray,
    isFunction = util.isFunction

module.exports = {
  transduce: transduce,
  reduce: reduce
}

function transduce(t, xf, init, coll) {
  return reduce(t(xf), init, coll)
}

function reduce(xf, init, coll){
  if(isArray(coll)){
    return arrayReduce(xf, init, coll)
  }

  if(isFunction(coll.reduce)){
    return methodReduce(xf, init, coll)
  }

  return iteratorReduce(xf, init, coll)
}

function arrayReduce(xf, init, arr){
  var value = init,
      i = 0,
      len = arr.length
  for(; i < len; i++){
    value = xf[tp.step](value, arr[i])
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf[tp.result](value)
}

function methodReduce(xf, init, coll){
  var result = coll.reduce(function(result, value){
    return xf[tp.step](result, value)
  }, init)
  return xf[tp.result](result)
}

function iteratorReduce(xf, init, iter){
  var value = init, next
  iter = iterable(iter)[protocols.iterator]()
  while(true){
    next = iter.next()
    if(next.done){
      break
    }

    value = xf[tp.step](value, next.value)
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf[tp.result](value)
}

},{"50":50,"51":51,"52":52,"59":59,"60":60}],44:[function(require,module,exports){
'use strict'
var transformer = require(58),
    isFunction = require(60).isFunction,
    tp = require(52).transducer

module.exports = function(core){
  var reduce = core.reduce,
      transduce = core.transduce

  return function into(init, t, coll){
    var xf = transformer(init),
        len = arguments.length

    if(len === 1){
      return intoCurryXf(xf)
    }

    if(len === 2){
      if(isFunction(t)){
        return intoCurryXfT(xf, t)
      }
      coll = t
      return reduce(xf, init, coll)
    }
    return transduce(t, xf, init, coll)
  }

  function intoCurryXf(xf){
    return function intoXf(t, coll){
      if(arguments.length === 1){
        if(isFunction(t)){
          return intoCurryXfT(xf, t)
        }
        coll = t
        return reduce(xf, xf[tp.init](), coll)
      }
      return transduce(t, xf, xf[tp.init](), coll)
    }
  }

  function intoCurryXfT(xf, t){
    return function intoXfT(coll){
      return transduce(t, xf, xf[tp.init](), coll)
    }
  }
}

},{"52":52,"58":58,"60":60}],45:[function(require,module,exports){
'use strict'
var completing = require(47),
    util = require(60),
    isFunction = util.isFunction,
    tp = require(52).transducer

module.exports = function(core){
  return function reduce(xf, init, coll){
    if(isFunction(xf)){
      xf = completing(xf)
    }

    if (arguments.length === 2) {
      coll = init
      init = xf[tp.init]()
    }
    return core.reduce(xf, init, coll)
  }
}

},{"47":47,"52":52,"60":60}],46:[function(require,module,exports){
'use strict'
var completing = require(47),
    util = require(60),
    isFunction = util.isFunction,
    tp = require(52).transducer

module.exports = function(core){
  return function transduce(t, xf, init, coll) {
    if(isFunction(xf)){
      xf = completing(xf)
    }
    xf = t(xf)
    if (arguments.length === 3) {
      coll = init
      init = xf[tp.init]()
    }
    return core.reduce(xf, init, coll)
  }
}

},{"47":47,"52":52,"60":60}],47:[function(require,module,exports){
'use strict'
var identity = require(60).identity,
    tp = require(52).transducer

module.exports =
// Turns a step function into a transfomer with init, step, result
// If init not provided, calls `step()`.  If result not provided, calls `idenity`
function completing(rf, result){
  return new Completing(rf, result)
}
function Completing(rf, result){
  this[tp.init] = rf
  this[tp.step] = rf
  this[tp.result] = result || identity
}

},{"52":52,"60":60}],48:[function(require,module,exports){
'use strict'

module.exports =
function compose(){
  var fns = arguments
  return function(xf){
    var i = fns.length
    while(i--){
      xf = fns[i](xf)
    }
    return xf
  }
}

},{}],49:[function(require,module,exports){
'use strict'
module.exports = require(44)(require(43))

},{"43":43,"44":44}],50:[function(require,module,exports){
'use strict'

var tp = require(52).transducer

module.exports =
function isReduced(value){
  return !!(value && value[tp.reduced])
}

},{"52":52}],51:[function(require,module,exports){
'use strict'
var symbol = require(52).iterator,
    util = require(60),
    isArray = util.isArray,
    isFunction = util.isFunction,
    isString = util.isString,
    has = {}.hasOwnProperty,
    keys = Object.keys || _keys

module.exports =
function iterable(value){
  var it
  if(value[symbol] !== void 0){
    it = value
  } else if(isArray(value) || isString(value)){
    it = new ArrayIterable(value)
  } else if(isFunction(value)){
    it = new FunctionIterable(value)
  } else if(isFunction(value.next)){
    it = new FunctionIterable(callNext(value))
  } else {
    it = new ObjectIterable(value)
  }
  return it
}

function callNext(value){
  return function(){
    return value.next()
  }
}

// Wrap an Array into an iterable
function ArrayIterable(arr){
  this.arr = arr
}
ArrayIterable.prototype[symbol] = function(){
  var arr = this.arr,
      idx = 0
  return {
    next: function(){
      if(idx >= arr.length){
        return {done: true}
      }

      return {done: false, value: arr[idx++]}
    }
  }
}

// Wrap an function into an iterable that calls function on every next
function FunctionIterable(fn){
  this.fn = fn
}
FunctionIterable.prototype[symbol] = function(){
  var fn = this.fn
  return {
    next: function(){
      return {done: false, value: fn()}
    }
  }
}

// Wrap an Object into an iterable. iterates [key, val]
function ObjectIterable(obj){
  this.obj = obj
  this.keys = keys(obj)
}
ObjectIterable.prototype[symbol] = function(){
  var obj = this.obj,
      keys = this.keys,
      idx = 0
  return {
    next: function(){
      if(idx >= keys.length){
        return {done: true}
      }
      var key = keys[idx++]
      return {done: false, value: [key, obj[key]]}
    }
  }
}

function _keys(obj){
  var prop, keys = []
  for(prop in obj){
    if(has.call(obj, prop)){
      keys.push(prop)
    }
  }
  return keys
}

},{"52":52,"60":60}],52:[function(require,module,exports){
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined',
    iterator = symbolExists ? Symbol.iterator : '@@iterator'

module.exports = {
  iterator: iterator,
  transducer: {
    init: '@@transducer/init',
    step: '@@transducer/step',
    result: '@@transducer/result',
    reduced: '@@transducer/reduced',
    value: '@@transducer/value'
  }
}

},{}],53:[function(require,module,exports){
'use strict'
module.exports = require(45)(require(43))

},{"43":43,"45":45}],54:[function(require,module,exports){
'use strict'

var isReduced = require(50),
    tp = require(52).transducer

module.exports =
function reduced(value, force){
  if(force || !isReduced(value)){
    value = new Reduced(value)
  }
  return value
}

function Reduced(value){
  this[tp.value] = value
  this[tp.reduced] = true
}

},{"50":50,"52":52}],55:[function(require,module,exports){
'use strict'
var isReduced = require(50),
    iterable = require(51),
    protocols = require(52),
    tp = protocols.transducer

module.exports =
function sequence(t, coll) {
  return new LazyIterable(t, coll)
}

function LazyIterable(t, coll){
  this.t = t
  this.coll = coll
}
LazyIterable.prototype[protocols.iterator] = function(){
  var iter = iterable(this.coll)[protocols.iterator]()
  return new LazyIterator(new Stepper(this.t, iter))
}

function LazyIterator(stepper){
  this.stepper = stepper
  this.values = []
}
LazyIterator.prototype.next = function(){
  var lt = this,
      values = lt.values,
      stepper = lt.stepper
  if(stepper && values.length === 0){
    stepper.step(lt)
  }
  return values.length ? {done: false, value: values.pop()} : {done: true}
}

var stepTransformer = new StepTransformer()
function StepTransformer(){}
StepTransformer.prototype[tp.init] = function(){}
StepTransformer.prototype[tp.step] = function(lt, input){
  lt.values.push(input)
  return lt
}
StepTransformer.prototype[tp.result] = function(lt){
  lt.stepper = null
  return lt
}

function Stepper(t, iter){
  this.xf = t(stepTransformer)
  this.iter = iter
}
Stepper.prototype.step = function(lt){
  var next, result,
      iter = this.iter,
      xf = this.xf,
      values = lt.values,
      prevLen = values.length
  while(prevLen === values.length){
    next = iter.next()
    if(next.done){
      xf[tp.result](lt)
      break
    }

    result = xf[tp.step](lt, next.value)
    if(isReduced(result)){
      xf[tp.result](lt)
      break
    }
  }
}


},{"50":50,"51":51,"52":52}],56:[function(require,module,exports){
'use strict'
module.exports = require(46)(require(43))

},{"43":43,"46":46}],57:[function(require,module,exports){
'use strict'
var tp = require(52).transducer

module.exports =
function transducer(step, result, init) {
  return function(xf){
    return new Transducer(xf, step, result, init)
  }
}
function Transducer(xf, step, result, init) {
  this.xf = xf

  this.init = init
  this.step = step
  this.result = result

  this.context = {
    init: bindXf(xf, tp.init),
    step: bindXf(xf, tp.step),
    result: bindXf(xf, tp.result)
  }
}
Transducer.prototype[tp.init] = function(){
  var that = this.context
  return this.init ? this.init.call(that, that.init) : that.init()
}
Transducer.prototype[tp.step] = function(value, input){
  var that = this.context
  return this.step ? this.step.call(that, that.step, value, input) : that.step(value, input)
}
Transducer.prototype[tp.result] = function(value){
  var that = this.context
  return this.result ? this.result.call(that, that.result, value) : that.result(value)
}
function bindXf(xf, p){
  return function(){
    return xf[p].apply(xf, arguments)
  }
}

},{"52":52}],58:[function(require,module,exports){
'use strict'
var tp = require(52).transducer,
    completing = require(47),
    util = require(60),
    identity = util.identity,
    isArray = util.isArray,
    isFunction = util.isFunction,
    isString = util.isString,
    objectMerge = util.objectMerge,
    arrayPush = util.arrayPush,
    stringAppend = util.stringAppend,
    slice = Array.prototype.slice,
    lastValue = {}

lastValue[tp.init] = function(){}
lastValue[tp.step] = function(result, input){return input}
lastValue[tp.result] = identity

module.exports =
function transformer(value){
  var xf
  if(value === void 0 || value === null){
    xf = lastValue
  } else if(isFunction(value[tp.step])){
    xf = value
  } else if(isFunction(value)){
    xf = completing(value)
  } else if(isArray(value)){
    xf = new ArrayTransformer(value)
  } else if(isString(value)){
    xf = new StringTransformer(value)
  } else {
    xf = new ObjectTransformer(value)
  }
  return xf
}

// Pushes value on array, using optional constructor arg as default, or [] if not provided
// init will clone the default
// step will push input onto array and return result
// result is identity
function ArrayTransformer(defaultValue){
  this.defaultValue = defaultValue === void 0 ? [] : defaultValue
}
ArrayTransformer.prototype[tp.init] = function(){
  return slice.call(this.defaultValue)
}
ArrayTransformer.prototype[tp.step] = arrayPush
ArrayTransformer.prototype[tp.result] = identity


// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function StringTransformer(str){
  this.strDefault = str === void 0 ? '' : str
}
StringTransformer.prototype[tp.init] = function(){
  return this.strDefault
}
StringTransformer.prototype[tp.step] = stringAppend
StringTransformer.prototype[tp.result] = identity

// Merges value into object, using optional constructor arg as default, or {} if undefined
// init will clone the default
// step will merge input into object and return result
// result is identity
function ObjectTransformer(obj){
  this.objDefault = obj === void 0 ? {} : objectMerge({}, obj)
}
ObjectTransformer.prototype[tp.init] = function(){
  return objectMerge({}, this.objDefault)
}
ObjectTransformer.prototype[tp.step] = objectMerge
ObjectTransformer.prototype[tp.result] = identity

},{"47":47,"52":52,"60":60}],59:[function(require,module,exports){
'use strict'

var isReduced = require(50),
    tp = require(52).transducer

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value[tp.value]
  }
  return value
}

},{"50":50,"52":52}],60:[function(require,module,exports){
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

},{}],61:[function(require,module,exports){
'use strict'
var transducer = require(57),
    identity = require(60).identity

// Return the maximum element (or element-based computation).
module.exports =
function max(f) {
  if(!f){
    f = identity
  }
  return transducer(
    function(step, value, input){
      if(this.lastComputed === void 0){
        this.computedResult = -Infinity
        this.lastComputed = -Infinity
      }
      var computed = f(input)
      if (computed > this.lastComputed ||
          computed === -Infinity && this.computedResult === -Infinity) {
        this.computedResult = input
        this.lastComputed = computed
      }
      return value
    },
    function(result, value){
      if(this.lastComputed === void 0){
        value = this.step(value, -Infinity)
      } else {
        value = this.step(value, this.computedResult)
      }
      return result(value)
    })
}

},{"57":57,"60":60}],62:[function(require,module,exports){
'use strict'
var transducer = require(57),
    identity = require(60).identity

// Return the minimum element (or element-based computation).
module.exports =
function min(f) {
  if(!f){
    f = identity
  }
  return transducer(
    function(step, value, input){
      if(this.lastComputed === void 0){
        this.computedResult = Infinity
        this.lastComputed = Infinity
      }
      var computed = f(input)
      if (computed < this.lastComputed ||
          computed === Infinity && this.computedResult === Infinity) {
        this.computedResult = input
        this.lastComputed = computed
      }
      return value
    },
    function(result, value){
      if(this.lastComputed === void 0){
        value = this.step(value, Infinity)
      } else {
        value = this.step(value, this.computedResult)
      }
      return result(value)
    })
}

},{"57":57,"60":60}],63:[function(require,module,exports){
'use strict'
var split = require(67)

module.exports =
function chars(limit){
  return split('', limit)
}

},{"67":67}],64:[function(require,module,exports){
'use strict'
var transducer = require(57)

module.exports =
function join(separator){
  return transducer(
    function(step, value, input){
      if(this.buffer === void 0){
        this.buffer = []
      }
      this.buffer.push(input)
      return value
    },
    function(result, value){
      value = this.step(value, this.buffer.join(separator))
      return result(value)
    })
}

},{"57":57}],65:[function(require,module,exports){
'use strict'
var split = require(67)

module.exports =
function lines(limit){
  return split('\n', limit)
}

},{"67":67}],66:[function(require,module,exports){
'use strict'
var transducer = require(57),
    isString = require(60).isString

module.exports =
function nonEmpty(){
  return transducer(function(step, value, input){
    if(isString(input) && input.trim().length){
      value = step(value, input)
    }
    return value
  })
}

},{"57":57,"60":60}],67:[function(require,module,exports){
'use strict'
var reduced = require(54),
    isRegExp = require(60).isRegExp,
    tp = require(52).transducer

module.exports =
function split(separator, limit){
  if(isRegExp(separator)){
    separator = cloneRegExp(separator)
  }
  return function(xf){
    return new Split(separator, limit, xf)
  }
}

function Split(separator, limit, xf){
  this.separator = separator
  this.xf = xf
  this.next = null
  this.idx = 0

  if(limit == void 0){
    limit = Infinity
  }
  this.limit = limit

  if(!isRegExp(separator) && separator !== ''){
    this.spliterate = spliterateString
  } else if(isRegExp(separator)){
    this.spliterate = spliterateRegExp
  } else {
    this.spliterate = spliterateChars
  }
}
Split.prototype[tp.init] = function(){return this.xf.init()}
Split.prototype[tp.step] = function(result, input){
  if(input === null || input === void 0){
    return result
  }

  var next = this.next,
      str = (next && next.value || '')+input,
      chunk = this.spliterate(str, this.separator)

  for(;;){
    this.next = next = chunk()
    if(next.done){
      break
    }

    result = this.xf[tp.step](result, next.value)

    if(++this.idx >= this.limit){
      this.next = null
      result = reduced(result)
      break
    }
  }
  return result
}
Split.prototype[tp.result] = function(result){
  var next = this.next
  if(next && next.value !== null && next.value !== void 0){
    result = this.xf[tp.step](result, next.value)
  }
  return this.xf[tp.result](result)
}

function spliterateChars(str){
  var i = 0,  len = str.length,
      result = {done: false}
  return function(){
    result.value = str[i++]
    if(i >= len){
      result.done = true
    }
    return result
  }
}

function spliterateString(str, separator){
  var first, second, sepLen = separator.length,
      result = {done: false}
  return function(){
    first = (first === void 0) ? 0 : second + sepLen
    second = str.indexOf(separator, first)

    if(second < 0){
      result.done = true
      second = void 0
    }
    result.value = str.substring(first, second)
    return result
  }
}

function spliterateRegExp(str, pattern){
  var index, match,
      result = {done: false}
  pattern = cloneRegExp(pattern)
  return function(){
    match = pattern.exec(str)
    if(match){
      index = match.index
      result.value = str.substring(0, index)
      str = str.substring(index + match[0].length)
    } else {
      result.done = true
      result.value = str
    }
    return result
  }
}

function cloneRegExp(regexp){
  // From https://github.com/aheckmann/regexp-clone
  var flags = []
  if (regexp.global) flags.push('g')
  if (regexp.multiline) flags.push('m')
  if (regexp.ignoreCase) flags.push('i')
  return new RegExp(regexp.source, flags.join(''))
}

},{"52":52,"54":54,"60":60}],68:[function(require,module,exports){
'use strict'
var compose = require(48),
    isNumber = require(60).isNumber,
    split = require(67),
    nonEmpty = require(66)

module.exports =
function words(delimiter, limit) {
  if(delimiter === void 0 || isNumber(delimiter)){
    limit  = delimiter
    delimiter = /\s+/
  }
  return compose(split(delimiter, limit), nonEmpty())
}

},{"48":48,"60":60,"66":66,"67":67}],69:[function(require,module,exports){
'use strict'
var reduced = require(54),
    isReduced = require(50),
    reduce = require(53),
    transducer = require(57),
    transducerReduce = transducer(reduce),
    preserveReduced = transducer(function(step, value, input){
      value = step(value, input)
      return isReduced(value) ? reduced(value, true) : value
    })

module.exports =
function cat(xf){
  return transducerReduce(preserveReduced(xf))
}

},{"50":50,"53":53,"54":54,"57":57}],70:[function(require,module,exports){
'use strict'
var transducer = require(57)

module.exports =
function dedupe(){
  return transducer(function(step, value, input){
    if (!this.sawFirst || this.last !== input){
      value = step(value, input)
    }
    this.last = input
    this.sawFirst = true
    return value
  })
}

},{"57":57}],71:[function(require,module,exports){
'use strict'
var transducer = require(57)

module.exports =
function drop(n){
  return transducer(function(step, value, item){
    if(this.n === void 0) this.n = n
    return (--this.n < 0) ? step(value, item) : value
  })
}

},{"57":57}],72:[function(require,module,exports){
'use strict'
var transducer = require(57)

module.exports =
function dropWhile(p){
  return transducer(function(step, value, input){
    if(!this.found){
      if(p(input)){
        return value
      }
      this.found = true
    }
    return step(value, input)
  })
}

},{"57":57}],73:[function(require,module,exports){
'use strict'
var transducer = require(57)

module.exports =
function filter(predicate) {
  return transducer(function(step, value, input) {
    return predicate(input) ? step(value, input) : value
  })
}

},{"57":57}],74:[function(require,module,exports){
'use strict'
var transducer = require(57)

module.exports =
function map(callback) {
  return transducer(function(step, value, input) {
    return step(value, callback(input))
  })
}

},{"57":57}],75:[function(require,module,exports){
'use strict'
var compose = require(48),
    map = require(74),
    cat = require(69)

module.exports =
function mapcat(callback) {
  return compose(map(callback), cat)
}

},{"48":48,"69":69,"74":74}],76:[function(require,module,exports){
'use strict'
var transducer = require(57)

module.exports =
function partitionAll(n) {
  return transducer(
    function(step, value, input){
      if(this.inputs === void 0){
        this.inputs = []
      }
      var ins = this.inputs
      ins.push(input)
      if(n === ins.length){
        this.inputs = []
        value = step(value, ins)
      }
      return value
    },
    function(result, value){
      var ins = this.inputs
      if(ins && ins.length){
        this.inputs = []
        value = this.step(value, ins)
      }
      return result(value)
    })
}

},{"57":57}],77:[function(require,module,exports){
'use strict'
var transducer = require(57),
    isReduced = require(50)

module.exports =
function partitionBy(f) {
  return transducer(
    function(step, value, input){
      var ins = this.inputs,
          curr = f(input),
          prev = this.prev
      this.prev = curr
      if(ins === void 0){
        this.inputs = [input]
      } else if(prev === curr){
        ins.push(input)
      } else {
        this.inputs = []
        value = step(value, ins)
        if(!isReduced(value)){
          this.inputs.push(input)
        }
      }
      return value
    },
    function(result, value){
      var ins = this.inputs
      if(ins && ins.length){
        this.inputs = []
        value = this.step(value, ins)
      }
      return result(value)
    })
}

},{"50":50,"57":57}],78:[function(require,module,exports){
'use strict'
var filter = require(73)

module.exports = remove
function remove(p){
  return filter(function(x){
    return !p(x)
  })
}


},{"73":73}],79:[function(require,module,exports){
'use strict'
var transducer = require(57),
    reduced = require(54)

module.exports =
function take(n){
  return transducer(function(step, value, item){
    if(this.n === void 0){
      this.n = n
    }
    if(this.n-- > 0){
      value = step(value, item)
    }
    if(this.n <= 0){
      value = reduced(value)
    }
    return value
  })
}

},{"54":54,"57":57}],80:[function(require,module,exports){
'use strict'
var transducer = require(57),
    reduced = require(54)

module.exports =
function takeWhile(p){
  return transducer(function(step, value, input){
    return p(input) ? step(value, input) : reduced(value)
  })
}

},{"54":54,"57":57}],81:[function(require,module,exports){
'use strict'
var transducer = require(57)

module.exports =
function tap(interceptor) {
  return transducer(function(step, value, input){
    interceptor(value, input)
    return step(value, input)
  })
}

},{"57":57}],82:[function(require,module,exports){
'use strict'
var transducer = require(57),
    identity = require(60).identity

module.exports =
function unique(f) {
  f = f || identity
  return transducer(function(step, value, input){
    if(this.seen === void 0){
      this.seen = []
    }
    var seen = this.seen,
        computed = f(input)
    if (seen.indexOf(computed) < 0) {
      seen.push(computed)
      value = step(value, input)
    }
    return value
  })
}

},{"57":57,"60":60}],83:[function(require,module,exports){
module.exports = require(6)([
  require(15),
  require(14),
  require(4),
  require(12),
  require(10),
  require(1),
  require(13),
  require(8),
  require(5),
  require(7),
  require(11),
  require(2),
  require(9)])

},{"1":1,"10":10,"11":11,"12":12,"13":13,"14":14,"15":15,"2":2,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9}]},{},[83]);
