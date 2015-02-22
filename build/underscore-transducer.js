(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

var forEach = require(16)

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
    push: require(19),
    unshift: require(22),
    at: at,
    slice: require(20),
    initial: require(17),
    last: last
  })

  var iteratee = _r.iteratee,
      resolveSingleValue = _r.resolveSingleValue,
      _ = _r._

  // Return the first value which passes a truth test. Aliased as `detect`.
  var _find = require(15)
  function find(predicate) {
     /*jshint validthis:true*/
     resolveSingleValue(this)
     return _find(iteratee(predicate))
  }

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  var _every = require(14)
  function every(predicate) {
     /*jshint validthis:true*/
    resolveSingleValue(this)
    return _every(iteratee(predicate))
  }

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  var _some = require(21)
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
  var _slice = require(20)
  function at(idx){
     /*jshint validthis:true*/
    resolveSingleValue(this)
    return _slice(idx, idx+1)
  }

  // Get the last element. Passing **n** will return the last N  values.
  // Note that no items will be sent until completion.
  var _last = require(18)
  function last(n) {
    if(n === void 0){
     /*jshint validthis:true*/
      resolveSingleValue(this)
    }
    return _last(n)
  }
}

},{"14":14,"15":15,"16":16,"17":17,"18":18,"19":19,"20":20,"21":21,"22":22}],2:[function(require,module,exports){
'use strict'
var util = require(36),
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

_r.VERSION = '0.4.3'

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

},{"36":36}],3:[function(require,module,exports){
'use strict'
var dispatcher = require(13)

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
      _reduce = require(30),
      _unreduced = require(35),
      transduce = _r.transduce = dispatcher(),
      _transduce = require(33),
      into = _r.into = dispatcher(),
      transducer = _r.transducer = dispatcher(),
      iterator = _r.iterator = dispatcher(),
      _iterable = require(28),
      _protocols = require(29),
      toArray = _r.toArray = dispatcher(),
      _toArray = require(26)([]),
      _util = require(36),
      iteratee = _r.iteratee = dispatcher()
  _r.resolveSingleValue = resolveSingleValue
  _r.resolveMultipleValues = resolveMultipleValues
  _r.reduced = require(31)
  _r.isReduced = require(27)
  _r.foldl = reduce
  _r.inject = reduce
  _r.deref = unwrap
  _r.conj = append
  _r.conjoin = append
  _r.dispatch = dispatch

  var compose = _r.compose = require(25)
  _r.transformer = require(34)
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

},{"13":13,"25":25,"26":26,"27":27,"28":28,"29":29,"30":30,"31":31,"33":33,"34":34,"35":35,"36":36}],4:[function(require,module,exports){
'use strict'
var symIterator = require(29).iterator

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

},{"29":29}],5:[function(require,module,exports){
'use strict'
module.exports = function(libs, _r){
  var i = 0, len = libs.length, lib
  if(_r === void 0){
    _r = require(2)
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

},{"2":2}],6:[function(require,module,exports){
'use strict'

// Based on Underscore.js 1.7.0
// http://underscorejs.org
//
// Which is distributed under MIT License:
// Underscore.js > (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Underscore.js > Underscore may be freely distributed under the MIT license.

var util = require(36),
    isFunction = util.isFunction,
    isArray = util.isArray,
    isString = util.isString,
    isNumber = util.isNumber,
    identity = util.identity

module.exports = function(_r){
  var _ = {}
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

},{"36":36}],7:[function(require,module,exports){
'use strict'
var _max = require(37),
    _min = require(38)

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

},{"37":37,"38":38}],8:[function(require,module,exports){
'use strict'
var tap = require(41),
    _asCallback = require(39),
    _asyncCallback = require(40)

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
    return _asCallback(xf, reducer)
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
    return _asyncCallback(xf, continuation, reducer)
  }

  _r.prototype.asyncCallback = function(continuation, init){
    return asyncCallback(this, continuation, init)
  }
}

},{"39":39,"40":40,"41":41}],9:[function(require,module,exports){
'use strict'
var seq = require(32),
    symbol = require(29).iterator

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

},{"29":29,"32":32}],10:[function(require,module,exports){
'use strict'

module.exports = function(_r){
  // String Functions
  // --------------------
  _r.mixin({
    split: require(46),
    join: join,
    nonEmpty: require(45),
    lines: require(44),
    chars: require(42),
    words: require(47)
  })

  var _join = require(43)
  function join(separator){
    /*jshint validthis:true */
    _r.resolveSingleValue(this)
    return _join(separator)
  }
}

},{"42":42,"43":43,"44":44,"45":45,"46":46,"47":47}],11:[function(require,module,exports){
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
      util = require(36),
      isFunction = util.isFunction,
      identity = util.identity

  // Return the results of applying the iteratee to each element.
  var _map = require(54)
  function map(f) {
    return _map(iteratee(f))
  }

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  var _filter = require(53)
  function filter(predicate) {
    return _filter(iteratee(predicate))
  }

  // Return all the elements for which a truth test fails.
  var _remove = require(58)
  function remove(predicate) {
    return _remove(iteratee(predicate))
  }

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`.
  var _take = require(59)
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
  var _takeWhile = require(60)
  function takeWhile(predicate) {
     return _takeWhile(iteratee(predicate))
  }

  // Returns everything but the first entry. Aliased as `tail` and `drop`.
  // Passing an **n** will return the rest N values.
  var _drop = require(51)
  function drop(n) {
    n = (n === void 0) ? 1 : (n > 0) ? n : 0
    return _drop(n)
  }

  // Drops items while the predicate returns true
  var _dropWhile = require(52)
  function dropWhile(predicate) {
     return _dropWhile(iteratee(predicate))
  }

  // Concatenating transducer.
  // NOTE: unlike libraries, cat should be called as a function to use.
  // _r.cat() not _r.cat
  var _cat = require(49)
  function cat(){
    return _cat
  }

  // mapcat.
  // Composition of _r.map(f) and _r.cat()
  var _mapcat = require(55)
  function mapcat(f){
    return _mapcat(iteratee(f))
  }

  // Partitions the source into arrays of size n
  // When transformer completes, the array will be stepped with any remaining items.
  // Alias chunkAll
  var _partitionAll = require(56)
  function partitionAll(n){
    return _partitionAll(n)
  }

  // Partitions the source into sub arrays while the value of the function
  // changes equality.
  var _partitionBy = require(57)
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

},{"36":36,"49":49,"51":51,"52":52,"53":53,"54":54,"55":55,"56":56,"57":57,"58":58,"59":59,"60":60}],12:[function(require,module,exports){
'use strict'
var _unique = require(61),
    _dedupe = require(50)

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

},{"50":50,"61":61}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
'use strict'
var reduced = require(31)

// Determine whether all of the elements match a truth test.
// Early termination if item does not match predicate.
module.exports =
function every(predicate) {
  return function(xf){
    return new Every(predicate, xf)
  }
}
function Every(f, xf) {
  this.xf = xf
  this.f = f
  this.found = false
}
Every.prototype.init = function(){
  return this.xf.init()
}
Every.prototype.result = function(result){
  if(!this.found){
    result = this.xf.step(result, true)
  }
  return this.xf.result(result)
}
Every.prototype.step = function(result, input) {
  if(!this.f(input)){
    this.found = true
    return reduced(this.xf.step(result, false))
  }
  return result
}

},{"31":31}],15:[function(require,module,exports){
'use strict'
var reduced = require(31)

// Return the first value which passes a truth test. Aliased as `detect`.
module.exports =
function find(predicate) {
   return function(xf){
     return new Find(predicate, xf)
   }
}
function Find(f, xf) {
  this.xf = xf
  this.f = f
}
Find.prototype.init = function(){
  return this.xf.init()
}
Find.prototype.result = function(result){
  return this.xf.result(result)
}
Find.prototype.step = function(result, input) {
  if(this.f(input)){
    result = reduced(this.xf.step(result, input))
  }
  return result
}

},{"31":31}],16:[function(require,module,exports){
'use strict'

// Executes f with f(input, idx, result) for forEach item
// passed through transducer without changing the result.
module.exports =
function forEach(f) {
  return function(xf){
    return new ForEach(f, xf)
  }
}
function ForEach(f, xf) {
  this.xf = xf
  this.f = f
  this.i = 0
}
ForEach.prototype.init = function(){
  return this.xf.init()
}
ForEach.prototype.result = function(result){
  return this.xf.result(result)
}
ForEach.prototype.step = function(result, input) {
  this.f(input, this.i++, result)
  return this.xf.step(result, input)
}

},{}],17:[function(require,module,exports){
'use strict'
var isReduced = require(27),
    unreduced = require(35)

// Returns everything but the last entry. Passing **n** will return all the values
// excluding the last N.
// Note that no items will be sent and all items will be buffered until completion.
module.exports =
function initial(n) {
  n = (n === void 0) ? 1 : (n > 0) ? n : 0
  return function(xf){
    return new Initial(n, xf)
  }
}
function Initial(n, xf) {
  this.xf = xf
  this.n = n
  this.idx = 0
  this.buffer = []
}
Initial.prototype.init = function(){
  return this.xf.init()
}
Initial.prototype.result = function(result){
  var idx = 0, count = this.idx - this.n, buffer = this.buffer
  for(idx = 0; idx < count; idx++){
    result = this.xf.step(result, buffer[idx])
    if(isReduced(result)){
      result = unreduced(result)
      break
    }
  }
  return this.xf.result(result)
}
Initial.prototype.step = function(result, input){
  this.buffer[this.idx++] = input
  return result
}

},{"27":27,"35":35}],18:[function(require,module,exports){
'use strict'
var isReduced = require(27),
    unreduced = require(35)

// Get the last element. Passing **n** will return the last N  values.
// Note that no items will be sent until completion.
module.exports =
function last(n) {
  if(n === void 0){
    n = 1
  } else {
    n = (n > 0) ? n : 0
  }
  return function(xf){
    return new Last(n, xf)
  }
}
function Last(n, xf) {
  this.xf = xf
  this.n = n
  this.idx = 0
  this.buffer = []
}
Last.prototype.init = function(){
  return this.xf.init()
}
Last.prototype.result = function(result){
  var n = this.n, count = n, buffer=this.buffer, idx=this.idx
  if(idx < count){
    count = idx
    idx = 0
  }
  while(count--){
    result = this.xf.step(result, buffer[idx++ % n])
    if(isReduced(result)){
      result = unreduced(result)
      break
    }
  }
  return this.xf.result(result)
}
Last.prototype.step = function(result, input){
  this.buffer[this.idx++ % this.n] = input
  return result
}

},{"27":27,"35":35}],19:[function(require,module,exports){
'use strict'
var isReduced = require(27),
    unreduced = require(35),
    _slice = Array.prototype.slice

// Adds one or more items to the end of the sequence, like Array.prototype.push.
module.exports =
function push(){
  var toPush = _slice.call(arguments)
  return function(xf){
    return new Push(toPush, xf)
  }
}
function Push(toPush, xf) {
  this.xf = xf
  this.toPush = toPush
}
Push.prototype.init = function(){
  return this.xf.init()
}
Push.prototype.result = function(result){
  var idx, toPush = this.toPush, len = toPush.length
  for(idx = 0; idx < len; idx++){
    result = this.xf.step(result, toPush[idx])
    if(isReduced(result)){
      result = unreduced(result)
      break
    }
  }
  return this.xf.result(result)
}
Push.prototype.step = function(result, input){
  return this.xf.step(result, input)
}

},{"27":27,"35":35}],20:[function(require,module,exports){
'use strict'
var compose = require(25),
    reduced = require(31),
    initial = require(17),
    last = require(18)

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

  return function(xf){
    return new Slice(begin, end, xf)
  }
}
function Slice(begin, end, xf) {
  this.xf = xf
  if(begin === void 0){
    begin = 0
  }
  this.begin = begin
  this.end = end
  this.idx = 0
}
Slice.prototype.init = function(){
  return this.xf.init()
}
Slice.prototype.result = function(result){
  return this.xf.result(result)
}
Slice.prototype.step = function(result, input){
  if(this.idx++ >= this.begin){
    result = this.xf.step(result, input)
  }
  if(this.idx >= this.end){
    result = reduced(result)
  }
  return result 
}


},{"17":17,"18":18,"25":25,"31":31}],21:[function(require,module,exports){
'use strict'
var reduced = require(31)

// Determine if at least one element in the object matches a truth test.
// Aliased as `any`.
// Early termination if item matches predicate.
module.exports =
function some(predicate) {
  return function(xf){
    return new Some(predicate, xf)
  }
}
function Some(f, xf) {
  this.xf = xf
  this.f = f
  this.found = false
}
Some.prototype.init = function(){
  return this.xf.init()
}
Some.prototype.result = function(result){
  if(!this.found){
    result = this.xf.step(result, false)
  }
  return this.xf.result(result)
}
Some.prototype.step = function(result, input) {
  if(this.f(input)){
    this.found = true
    return reduced(this.xf.step(result, true))
  }
  return result
}

},{"31":31}],22:[function(require,module,exports){
'use strict'
var isReduced = require(27),
    _slice = Array.prototype.slice

// Adds one or more items to the beginning of the sequence, like Array.prototype.unshift.
module.exports =
function unshift(){
  var toUnshift = _slice.call(arguments)
  return function(xf){
    return new Unshift(toUnshift, xf)
  }
}
function Unshift(toUnshift, xf){
  this.xf = xf
  this.toUnshift = toUnshift
  this.idx = 0
}
Unshift.prototype.init = function(){
  return this.xf.init()
}
Unshift.prototype.result = function(result){
  return this.xf.result(result)
}
Unshift.prototype.step = function(result, input){
  var toUnshift = this.toUnshift
  if(toUnshift){
    var idx, len = toUnshift.length
    for(idx = 0; idx < len; idx++){
      result = this.xf.step(result, toUnshift[idx])
      if(isReduced(result)){
        return result
      }
    }
    this.toUnshift = null
  }
  return this.xf.step(result, input)
}

},{"27":27}],23:[function(require,module,exports){
'use strict'
var isReduced = require(27),
    unreduced = require(35),
    completing = require(24),
    iterable = require(28),
    protocols = require(29),
    util = require(36),
    isArray = util.isArray,
    isFunction = util.isFunction

module.exports = {
  transduce: transduce,
  reduce: reduce,
  _transduce: _transduce,
  _reduce: _reduce
}

function transduce(t, xf, init, coll) {
  if(isFunction(xf)){
    xf = completing(xf)
  }
  xf = t(xf)
  if (arguments.length === 3) {
    coll = init;
    init = xf.init();
  }
  return _reduce(xf, init, coll)
}

function _transduce(t, xf, init, coll) {
  return _reduce(t(xf), init, coll)
}

function reduce(xf, init, coll){
  if(isFunction(xf)){
    xf = completing(xf)
  }

  if (arguments.length === 2) {
    coll = init
    init = xf.init()
  }
  return _reduce(xf, init, coll)
}

function _reduce(xf, init, coll){
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
    value = xf.step(value, arr[i])
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf.result(value)
}

function methodReduce(xf, init, coll){
  var result = coll.reduce(function(result, value){
    return xf.step(result, value)
  }, init)
  return xf.result(result)
}

function iteratorReduce(xf, init, iter){
  var value = init, next
  iter = iterable(iter)[protocols.iterator]()
  while(true){
    next = iter.next()
    if(next.done){
      break
    }

    value = xf.step(value, next.value)
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf.result(value)
}

},{"24":24,"27":27,"28":28,"29":29,"35":35,"36":36}],24:[function(require,module,exports){
'use strict'
var identity = require(36).identity

module.exports =
// Turns a step function into a transfomer with init, step, result
// If init not provided, calls `step()`.  If result not provided, calls `idenity`
function completing(rf, result){
  return new Completing(rf, result)
}
function Completing(rf, result){
  this.step = rf
  this.result = result || identity
}
Completing.prototype.init = function(){
  return this.step()
}

},{"36":36}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
'use strict'
var core = require(23),
    transduce = core._transduce,
    reduce = core._reduce,
    transformer = require(34),
    isFunction = require(36).isFunction

module.exports =
function into(init, t, coll){
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
      return reduce(xf, xf.init(), coll)
    }
    return transduce(t, xf, xf.init(), coll)
  }
}
function intoCurryXfT(xf, t){
  return function intoXfT(coll){
    return transduce(t, xf, xf.init(), coll)
  }
}

},{"23":23,"34":34,"36":36}],27:[function(require,module,exports){
'use strict'

module.exports =
function isReduced(value){
  return !!(value && value.__transducers_reduced__)
}

},{}],28:[function(require,module,exports){
'use strict'
var symbol = require(29).iterator,
    util = require(36),
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

},{"29":29,"36":36}],29:[function(require,module,exports){
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined',
    iterator = symbolExists ? Symbol.iterator : '@@iterator'
    transformer = symbolExists ? Symbol('transformer') : '@@transformer'

module.exports = {
  iterator: iterator,
  transformer: transformer
}

},{}],30:[function(require,module,exports){
'use strict'
module.exports = require(23).reduce

},{"23":23}],31:[function(require,module,exports){
'use strict'

var isReduced = require(27)

module.exports =
function reduced(value, force){
  if(force || !isReduced(value)){
    value = new Reduced(value)
  }
  return value
}

function Reduced(value){
  this.value = value
  this.__transducers_reduced__ = true
}

},{"27":27}],32:[function(require,module,exports){
'use strict'
var isReduced = require(27),
    iterable = require(28),
    symbol = require(29).iterator

module.exports =
function sequence(t, coll) {
  return new LazyIterable(t, coll)
}

function LazyIterable(t, coll){
  this.t = t
  this.coll = coll
}
LazyIterable.prototype[symbol] = function(){
  var iter = iterable(this.coll)[symbol]()
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
function StepTransformer(){
}
StepTransformer.prototype.init = function(){
  throw new Error('Cannot init')
}
StepTransformer.prototype.step = function(lt, input){
  lt.values.push(input)
  return lt
}
StepTransformer.prototype.result = function(lt){
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
      xf.result(lt)
      break
    }

    result = xf.step(lt, next.value)
    if(isReduced(result)){
      xf.result(lt)
      break
    }
  }
}


},{"27":27,"28":28,"29":29}],33:[function(require,module,exports){
'use strict'
module.exports = require(23).transduce

},{"23":23}],34:[function(require,module,exports){
'use strict'
var symbol = require(29).transformer,
    completing = require(24),
    util = require(36),
    identity = util.identity,
    isArray = util.isArray,
    isFunction = util.isFunction,
    isString = util.isString,
    objectMerge = util.objectMerge,
    arrayPush = util.arrayPush,
    stringAppend = util.stringAppend,
    slice = Array.prototype.slice,
    lastValue = {
      init: function(){},
      step: function(result, input){return input},
      result: identity
    }

module.exports =
function transformer(value){
  var xf
  if(value === void 0){
    xf = lastValue
  } else if(value[symbol] !== void 0){
    xf = value[symbol]
  } else if(isFunction(value.step) && isFunction(value.result)){
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
ArrayTransformer.prototype.init = function(){
  return slice.call(this.defaultValue)
}
ArrayTransformer.prototype.step = arrayPush
ArrayTransformer.prototype.result = identity


// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function StringTransformer(str){
  this.strDefault = str === void 0 ? '' : str
}
StringTransformer.prototype.init = function(){
  return this.strDefault
}
StringTransformer.prototype.step = stringAppend
StringTransformer.prototype.result = identity

// Merges value into object, using optional constructor arg as default, or {} if undefined
// init will clone the default
// step will merge input into object and return result
// result is identity
function ObjectTransformer(obj){
  this.objDefault = obj === void 0 ? {} : objectMerge({}, obj)
}
ObjectTransformer.prototype.init = function(){
  return objectMerge({}, this.objDefault)
}
ObjectTransformer.prototype.step = objectMerge
ObjectTransformer.prototype.result = identity

},{"24":24,"29":29,"36":36}],35:[function(require,module,exports){
'use strict'

var isReduced = require(27)

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value.value
  }
  return value
}

},{"27":27}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
'use strict'

var identity = require(36).identity

// Return the maximum element (or element-based computation).
module.exports =
function max(f) {
  if(!f){
    f = identity
  }
  return function(xf){
    return new Max(f, xf)
  }
}
function Max(f, xf) {
  this.xf = xf
  this.f = f
  this.computedResult = -Infinity
  this.lastComputed = -Infinity
}
Max.prototype.init = function(){
  return this.xf.init()
}
Max.prototype.result = function(result){
  result = this.xf.step(result, this.computedResult)
  return this.xf.result(result)
}
Max.prototype.step = function(result, input) {
  var computed = this.f(input)
  if (computed > this.lastComputed ||
      computed === -Infinity && this.computedResult === -Infinity) {
    this.computedResult = input
    this.lastComputed = computed
  }
  return result
}

},{"36":36}],38:[function(require,module,exports){
'use strict'

var identity = require(36).identity

// Return the minimum element (or element-based computation).
module.exports =
function min(f) {
  if(!f){
    f = identity
  }
  return function(xf){
    return new Min(f, xf)
  }
}
function Min(f, xf) {
  this.xf = xf
  this.f = f
  this.computedResult = Infinity
  this.lastComputed = Infinity
}
Min.prototype.init = function(){
  return this.xf.init()
}
Min.prototype.result = function(result){
  result = this.xf.step(result, this.computedResult)
  return this.xf.result(result)
}
Min.prototype.step = function(result, input) {
  var computed = this.f(input)
  if (computed < this.lastComputed ||
      computed === Infinity && this.computedResult === Infinity) {
    this.computedResult = input
    this.lastComputed = computed
  }
  return result
}

},{"36":36}],39:[function(require,module,exports){
'use strict'
var isReduced = require(27),
    unreduced = require(35),
    transformer = require(34)

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
// If iniit, is not defined, maintains last value and does not buffer results.
module.exports =
function asCallback(t, init){
  var done = false, stepper, result,
      xf = transformer(init)
  stepper = t(xf)
  result = stepper.init()

  return function(item){
    if(done) return result

    if(item === void 0){
      // complete
      result = stepper.result(result)
      done = true
    } else {
      // step to next result.
      result = stepper.step(result, item)

      // check if exhausted
      if(isReduced(result)){
        result = stepper.result(unreduced(result))
        done = true
      }
    }

    if(done) return result
  }
}

},{"27":27,"34":34,"35":35}],40:[function(require,module,exports){
'use strict'
var isReduced = require(27),
    unreduced = require(35),
    transformer = require(34)

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
// If init is not defined, maintains last value and does not buffer results.
module.exports =
function asyncCallback(t, continuation, init){
  var done = false, stepper, result,
      xf = transformer(init)

  stepper = t(xf)
  result = stepper.init()

  function checkDone(err, item){
    if(done){
      return true
    }

    err = err || null

    // check if exhausted
    if(isReduced(result)){
      result = unreduced(result)
      done = true
    }

    if(err || done || item === void 0){
      result = stepper.result(result)
      done = true
    }

    // notify if done
    if(done){
      if(continuation){
        continuation(err, result)
        continuation = null
      } else if(err){
        throw err
      }
      result = null
    }

    return done
  }

  return function(err, item){
    if(!checkDone(err, item)){
      try {
        // step to next result.
        result = stepper.step(result, item)
        checkDone(err, item)
      } catch(err2){
        checkDone(err2, item)
      }
    }
  }
}

},{"27":27,"34":34,"35":35}],41:[function(require,module,exports){
'use strict'

// Invokes interceptor with each result and input, and then passes through input.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
// Executes interceptor with current result and input
module.exports =
function tap(interceptor) {
  return function(xf){
    return new Tap(interceptor, xf)
  }
}
function Tap(f, xf) {
  this.xf = xf
  this.f = f
}
Tap.prototype.init = function(){
  return this.xf.init()
}
Tap.prototype.result = function(result){
  return this.xf.result(result)
}
Tap.prototype.step = function(result, input) {
  this.f(result, input)
  return this.xf.step(result, input)
}

},{}],42:[function(require,module,exports){
'use strict'
var split = require(46)

module.exports =
function chars(limit){
  return split('', limit)
}

},{"46":46}],43:[function(require,module,exports){
'use strict'

module.exports =
function join(separator){
  return function(xf){
    return new Join(separator, xf)
  }
}
function Join(separator, xf){
  this.separator = separator
  this.xf = xf
  this.buffer = []
}
Join.prototype.init = function(){return this.xf.init()}
Join.prototype.step = function(result, input){
  this.buffer.push(input)
  return result
}
Join.prototype.result = function(result){
  result = this.xf.step(result, this.buffer.join(this.separator))
  return this.xf.result(result)
}

},{}],44:[function(require,module,exports){
'use strict'
var split = require(46)

module.exports =
function lines(limit){
  return split('\n', limit)
}

},{"46":46}],45:[function(require,module,exports){
'use strict'
var isString = require(36).isString

module.exports =
function nonEmpty(){
  return function(xf){
    return new NonEmpty(xf)
  }
}
function NonEmpty(xf){
  this.xf = xf
}
NonEmpty.prototype.init = function(){return this.xf.init()}
NonEmpty.prototype.step = function(result, input){
  if(isString(input) && input.trim().length){
    result = this.xf.step(result, input)
  }
  return result
}
NonEmpty.prototype.result = function(result){
  return this.xf.result(result)
}

},{"36":36}],46:[function(require,module,exports){
'use strict'
var reduced = require(31),
    isRegExp = require(36).isRegExp

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
Split.prototype.init = function(){return this.xf.init()}
Split.prototype.step = function(result, input){
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

    result = this.xf.step(result, next.value)

    if(++this.idx >= this.limit){
      this.next = null
      result = reduced(result)
      break
    }
  }
  return result
}
Split.prototype.result = function(result){
  var next = this.next
  if(next && next.value !== null && next.value !== void 0){
    result = this.xf.step(result, next.value)
  }
  return this.xf.result(result)
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

},{"31":31,"36":36}],47:[function(require,module,exports){
'use strict'
var compose = require(25),
    isNumber = require(36).isNumber,
    split = require(46),
    nonEmpty = require(45)

module.exports =
function words(delimiter, limit) {
  if(delimiter === void 0 || isNumber(delimiter)){
    limit  = delimiter
    delimiter = /\s+/
  }
  return compose(split(delimiter, limit), nonEmpty())
}

},{"25":25,"36":36,"45":45,"46":46}],48:[function(require,module,exports){
'use strict'
module.exports =
function _unique(f, buffer) {
   return function(xf){
     return new Uniq(f, !buffer, xf)
   }
}
function Uniq(f, isSorted, xf) {
  this.xf = xf
  this.f = f
  this.isSorted = isSorted
  this.seen = []
  this.i = 0
}
Uniq.prototype.init = function(){
  return this.xf.init()
}
Uniq.prototype.result = function(result){
  return this.xf.result(result)
}
Uniq.prototype.step = function(result, input){
  var seen = this.seen
  if (this.isSorted) {
    if (!this.i || seen !== input){
      result = this.xf.step(result, input)
    }
    this.seen = input
    this.i++
  } else if (this.f) {
    var computed = this.f(input)
    if (seen.indexOf(computed) < 0) {
      seen.push(computed)
      result = this.xf.step(result, input)
    }
  } else if (seen.indexOf(input) < 0) {
      seen.push(input)
      result = this.xf.step(result, input)
  }
  return result
}

},{}],49:[function(require,module,exports){
'use strict'

var reduced = require(31),
    isReduced = require(27),
    reduce = require(30)

module.exports =
function cat(xf){
  return new Cat(xf)
}
function Cat(xf){
  this.xf = new PreserveReduced(xf)
}
Cat.prototype.init = function(){
  return this.xf.init()
}
Cat.prototype.result = function(value){
  return this.xf.result(value)
}
Cat.prototype.step = function(value, item){
  return reduce(this.xf, value, item)
}

function PreserveReduced(xf){
  this.xf = xf
}
PreserveReduced.prototype.init = function(){
  return this.xf.init()
}
PreserveReduced.prototype.result = function(value){
  return this.xf.result(value)
}
PreserveReduced.prototype.step = function(value, item){
  value = this.xf.step(value, item)
  if(isReduced(value)){
    value = reduced(value, true)
  }
  return value
}

},{"27":27,"30":30,"31":31}],50:[function(require,module,exports){
'use strict'
var _unique = require(48)

module.exports =
function dedupe(){
  return _unique()
}

},{"48":48}],51:[function(require,module,exports){
'use strict'

module.exports =
function drop(n){
  return function(xf){
    return new Drop(n, xf)
  }
}
function Drop(n, xf){
  this.xf = xf
  this.n = n
}
Drop.prototype.init = function(){
  return this.xf.init()
}
Drop.prototype.result = function(value){
  return this.xf.result(value)
}
Drop.prototype.step = function(value, item){
  if(--this.n < 0){
    value = this.xf.step(value, item)
  }
  return value
}

},{}],52:[function(require,module,exports){
'use strict'

module.exports =
function dropWhile(p){
  return function(xf){
    return new DropWhile(p, xf)
  }
}
function DropWhile(p, xf){
  this.xf = xf
  this.p = p
}
DropWhile.prototype.init = function(){
  return this.xf.init()
}
DropWhile.prototype.result = function(value){
  return this.xf.result(value)
}
DropWhile.prototype.step = function(value, item){
  if(this.p){
    if(this.p(item)){
      return value
    }
    this.p = null
  }
  return this.xf.step(value, item)
}

},{}],53:[function(require,module,exports){
'use strict'
module.exports = filter

function filter(predicate) {
  return function(xf){
    return new Filter(predicate, xf)
  }
}
function Filter(f, xf) {
  this.xf = xf
  this.f = f
}
Filter.prototype.init = function(){
  return this.xf.init()
}
Filter.prototype.result = function(result){
  return this.xf.result(result)
}
Filter.prototype.step = function(result, input) {
  if(this.f(input)){
    result = this.xf.step(result, input)
  }
  return result
}

},{}],54:[function(require,module,exports){
'use strict'
module.exports =
function map(callback) {
  return function(xf){
    return new Map(callback, xf)
  }
}
function Map(f, xf) {
  this.xf = xf
  this.f = f
}
Map.prototype.init = function(){
  return this.xf.init()
}
Map.prototype.result = function(result){
  return this.xf.result(result)
}
Map.prototype.step = function(result, input) {
  return this.xf.step(result, this.f(input))
}

},{}],55:[function(require,module,exports){
'use strict'
var compose = require(25),
    map = require(54),
    cat = require(49)
module.exports =
function mapcat(callback) {
  return compose(map(callback), cat)
}

},{"25":25,"49":49,"54":54}],56:[function(require,module,exports){
'use strict'
module.exports = partitionAll
function partitionAll(n) {
  return function(xf){
    return new PartitionAll(n, xf)
  }
}
function PartitionAll(n, xf) {
  this.xf = xf
  this.n = n
  this.inputs = []
}
PartitionAll.prototype.init = function(){
  return this.xf.init()
}
PartitionAll.prototype.result = function(result){
  var ins = this.inputs
  if(ins && ins.length){
    this.inputs = []
    result = this.xf.step(result, ins)
  }
  return this.xf.result(result)
}
PartitionAll.prototype.step = function(result, input) {
  var ins = this.inputs,
      n = this.n
  ins.push(input)
  if(n === ins.length){
    this.inputs = []
    result = this.xf.step(result, ins)
  }
  return result
}

},{}],57:[function(require,module,exports){
'use strict'
var isReduced = require(27)

module.exports =
function partitionBy(f) {
  return function(xf){
    return new PartitionBy(f, xf)
  }
}
function PartitionBy(f, xf) {
  this.xf = xf
  this.f = f
}
PartitionBy.prototype.init = function(){
  return this.xf.init()
}
PartitionBy.prototype.result = function(result){
  var ins = this.inputs
  if(ins && ins.length){
    this.inputs = []
    result = this.xf.step(result, ins)
  }
  return this.xf.result(result)
}
PartitionBy.prototype.step = function(result, input) {
  var ins = this.inputs,
      curr = this.f(input),
      prev = this.prev
  this.prev = curr

  if(ins === void 0){
    this.inputs = [input]
  } else if(prev === curr){
    ins.push(input)
  } else {
    this.inputs = []
    result = this.xf.step(result, ins)
    if(!isReduced(result)){
      this.inputs.push(input)
    }
  }
  return result
}

},{"27":27}],58:[function(require,module,exports){
'use strict'
var filter = require(53)

module.exports = remove
function remove(p){
  return filter(function(x){
    return !p(x)
  })
}


},{"53":53}],59:[function(require,module,exports){
'use strict'

var reduced = require(31)

module.exports =
function take(n){
  return function(xf){
    return new Take(n, xf)
  }
}
function Take(n, xf){
  this.xf = xf
  this.n = n
}
Take.prototype.init = function(){
  return this.xf.init()
}
Take.prototype.result = function(value){
  return this.xf.result(value)
}
Take.prototype.step = function(value, item){
  if(this.n-- > 0){
    value = this.xf.step(value, item)
  }
  if(this.n <= 0){
    value = reduced(value)
  }
  return value
}

},{"31":31}],60:[function(require,module,exports){
'use strict'
var reduced = require(31)

module.exports =
function takeWhile(p){
  return function(xf){
    return new TakeWhile(p, xf)
  }
}
function TakeWhile(p, xf){
  this.xf = xf
  this.p = p
}
TakeWhile.prototype.init = function(){
  return this.xf.init()
}
TakeWhile.prototype.result = function(value){
  return this.xf.result(value)
}
TakeWhile.prototype.step = function(value, item){
  if(this.p(item)){
    value = this.xf.step(value, item)
  } else {
    value = reduced(value)
  }
  return value
}

},{"31":31}],61:[function(require,module,exports){
'use strict'
var _unique = require(48)

module.exports =
function unique(f) {
  return _unique(f, true)
}

},{"48":48}],62:[function(require,module,exports){
module.exports = require(5)([
  require(6),
  require(3),
  require(11),
  require(9),
  require(1),
  require(12),
  require(8),
  require(4),
  require(7),
  require(10)])

},{"1":1,"10":10,"11":11,"12":12,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9}]},{},[62]);
