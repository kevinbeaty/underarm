(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'
var merge = require(42),
    isArray = require(36),
    isFunction = require(37)

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

},{}],2:[function(require,module,exports){
'use strict'
var dispatcher = require(6)

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
      _reduce = require(17),
      _unreduced = require(24),
      transduce = _r.transduce = dispatcher(),
      _transduce = require(23),
      into = _r.into = dispatcher(),
      transducer = _r.transducer = dispatcher(),
      iterator = _r.iterator = dispatcher(),
      _iterator = require(28),
      toArray = _r.toArray = dispatcher(),
      _toArray = require(22),
      iteratee = _r.iteratee = dispatcher()
  _r.resolveSingleValue = resolveSingleValue
  _r.resolveMultipleValues = resolveMultipleValues
  _r.reduced = require(18)
  _r.isReduced = require(12)
  _r.foldl = reduce
  _r.inject = reduce
  _r.deref = unwrap
  _r.conj = append
  _r.conjoin = append
  _r.dispatch = dispatch

  var compose = _r.compose = require(8)
  _r.isIterable = require(25)
  _r.isIterator = require(26)
  _r.iterable = require(27)
  _r.isTransformer = require(30)
  _r.transformer = require(32)
  _r.protocols = {
    iterator: require(29),
    transformer: require(31)
  }
  _r.isFunction = require(37)
  var isArray = _r.isArray = require(36)
  var isString = _r.isString = require(40)
  _r.isRegExp = require(39)
  _r.isNumber = require(38)
  _r.isUndefined = require(41)
  _r.arrayPush = require(34)
  _r.objectMerge = require(42)
  _r.stringAppend = require(43)
  var identity = _r.identity = require(35)


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
  iterator.register(_iterator)

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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
'use strict'

// Based on Underscore.js 1.7.0
// http://underscorejs.org
//
// Which is distributed under MIT License:
// Underscore.js > (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Underscore.js > Underscore may be freely distributed under the MIT license.

var isFunction = require(37),
    isArray = require(36),
    isString = require(40),
    isNumber = require(38),
    identity = require(35)

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

},{}],5:[function(require,module,exports){
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
      isFunction = require(37),
      identity = require(35)

  // Return the results of applying the iteratee to each element.
  var _map = require(13)
  function map(f) {
    return _map(iteratee(f))
  }

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  var _filter = require(11)
  function filter(predicate) {
    return _filter(iteratee(predicate))
  }

  // Return all the elements for which a truth test fails.
  var _remove = require(19)
  function remove(predicate) {
    return _remove(iteratee(predicate))
  }

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`.
  var _take = require(20)
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
  var _takeWhile = require(21)
  function takeWhile(predicate) {
     return _takeWhile(iteratee(predicate))
  }

  // Returns everything but the first entry. Aliased as `tail` and `drop`.
  // Passing an **n** will return the rest N values.
  var _drop = require(9)
  function drop(n) {
    n = (n === void 0) ? 1 : (n > 0) ? n : 0
    return _drop(n)
  }

  // Drops items while the predicate returns true
  var _dropWhile = require(10)
  function dropWhile(predicate) {
     return _dropWhile(iteratee(predicate))
  }

  // Concatenating transducer.
  // NOTE: unlike libraries, cat should be called as a function to use.
  // _r.cat() not _r.cat
  var _cat = require(7)
  function cat(){
    return _cat
  }

  // mapcat.
  // Composition of _r.map(f) and _r.cat()
  var _mapcat = require(14)
  function mapcat(f){
    return _mapcat(iteratee(f))
  }

  // Partitions the source into arrays of size n
  // When transformer completes, the array will be stepped with any remaining items.
  // Alias chunkAll
  var _partitionAll = require(15)
  function partitionAll(n){
    return _partitionAll(n)
  }

  // Partitions the source into sub arrays while the value of the function
  // changes equality.
  var _partitionBy = require(16)
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
'use strict'

var reduced = require(18),
    isReduced = require(12),
    reduce = require(17)

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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
'use strict'

module.exports =
function isReduced(value){
  return !!(value && value.__transducers_reduced__)
}

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
'use strict'
var compose = require(8),
    map = require(13),
    cat = require(7)
module.exports =
function mapcat(callback) {
  return compose(map(callback), cat)
}

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
'use strict'
var isReduced = require(12)

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

},{}],17:[function(require,module,exports){
'use strict'
var transformer = require(32),
    isReduced = require(12),
    unreduced = require(24),
    isArray = require(36),
    iterator = require(28)

module.exports =
function reduce(xf, init, coll){
  xf = transformer(xf)
  if(isArray(coll)){
    return arrayReduce(xf, init, coll)
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

function iteratorReduce(xf, init, iter){
  var value = init, next
  iter = iterator(iter)
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

},{}],18:[function(require,module,exports){
'use strict'

var isReduced = require(12)

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

},{}],19:[function(require,module,exports){
'use strict'
var filter = require(11)

module.exports = remove
function remove(p){
  return filter(function(x){
    return !p(x)
  })
}


},{}],20:[function(require,module,exports){
'use strict'

var reduced = require(18)

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

},{}],21:[function(require,module,exports){
'use strict'
var reduced = require(18)

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

},{}],22:[function(require,module,exports){
'use strict'
var transduce = require(23),
    reduce = require(17),
    push = require(34)

module.exports =
function toArray(xf, coll){
  var init = []
  if(coll === void 0){
    return reduce(push, init, xf)
  }
  return transduce(xf, push, init, coll)
}

},{}],23:[function(require,module,exports){
'use strict'
var transformer = require(32),
    reduce = require(17)

module.exports =
function transduce(xf, f, init, coll){
  f = transformer(f)
  return reduce(xf(f), init, coll)
}

},{}],24:[function(require,module,exports){
'use strict'

var isReduced = require(12)

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value.value
  }
  return value
}

},{}],25:[function(require,module,exports){
'use strict'
var symbol = require(29)

module.exports =
function isIterable(value){
  return (value[symbol] !== void 0)
}

},{}],26:[function(require,module,exports){
'use strict'
var isIterable = require(25),
    isFunction = require(37)

module.exports =
function isIterator(value){
  return isIterable(value) ||
    isFunction(value.next)
}

},{}],27:[function(require,module,exports){
'use strict'
var isIterable = require(25),
    symbol = require(29),
    isArray = require(36),
    isFunction = require(37),
    isString = require(40),
    keys = Object.keys || _keys

module.exports =
function iterable(value){
  var it
  if(isIterable(value)){
    it = value
  } else if(isArray(value) || isString(value)){
    it = new ArrayIterable(value)
  } else if(isFunction(value)){
    it = new FunctionIterable(value)
  } else {
    it = new ObjectIterable(value)
  }
  return it
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
    if(obj.hasOwnProperty(prop)){
      keys.push(prop)
    }
  }
  return keys
}

},{}],28:[function(require,module,exports){
'use strict'
var symbol = require(29),
    iterable = require(27),
    isFunction = require(37)

module.exports =
function iterator(value){
  var it = iterable(value)
  if(it !== void 0){
    it = it[symbol]()
  } else if(isFunction(value.next)){
    // handle non-well-formed iterators that only have a next method
    it = value
  }
  return it
}

},{}],29:[function(require,module,exports){
'use strict'
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined'
module.exports = symbolExists ? Symbol.iterator : '@@iterator'

},{}],30:[function(require,module,exports){
'use strict'
var symbol = require(31),
    isFunction = require(37)

module.exports =
function isTransformer(value){
  return (value[symbol] !== void 0) ||
    (isFunction(value.step) && isFunction(value.result))
}

},{}],31:[function(require,module,exports){
'use strict'
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined'
module.exports = symbolExists ? Symbol('transformer') : '@@transformer'

},{}],32:[function(require,module,exports){
'use strict'
var undef,
    slice = Array.prototype.slice,
    symbol = require(31),
    isTransformer = require(30),
    isArray = require(36),
    isFunction = require(37),
    isString = require(40),
    identity = require(35),
    arrayPush = require(34),
    objectMerge = require(42),
    stringAppend = require(43)

module.exports =
function transformer(value){
  var xf
  if(isTransformer(value)){
    xf = value[symbol]
    if(xf === undef){
      xf = value
    }
  } else if(isFunction(value)){
    xf = new FunctionTransformer(value)
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
function ArrayTransformer(arr){
  this.arrDefault = arr === undef ? [] : arr
}
ArrayTransformer.prototype.init = function(){
  return slice.call(this.arrDefault)
}
ArrayTransformer.prototype.step = arrayPush
ArrayTransformer.prototype.result = identity

// Turns a step function into a transfomer with init, step, result (init not supported and will error)
// Like transducers-js Wrap
function FunctionTransformer(step){
  this.step = step
}
FunctionTransformer.prototype.init = function(){
  throw new Error('Cannot init wrapped function, use proper transformer instead')
}
FunctionTransformer.prototype.step = function(result, input){
  return this.step(result, input)
}
FunctionTransformer.prototype.result = identity

// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function StringTransformer(str){
  this.strDefault = str === undef ? '' : str
}
StringTransformer.prototype.init = function(){
  return this.strDefault
}
StringTransformer.prototype.step = stringAppend
StringTransformer.prototype.result = identity

// Merges value into object, using optional constructor arg as default, or {} if not provided
// init will clone the default
// step will merge input into object and return result
// result is identity
function ObjectTransformer(obj){
  this.objDefault = obj === undef ? {} : objectMerge({}, obj)
}
ObjectTransformer.prototype.init = function(){
  return objectMerge({}, this.objDefault)
}
ObjectTransformer.prototype.step = objectMerge
ObjectTransformer.prototype.result = identity

},{}],33:[function(require,module,exports){
'use strict'
var toString = Object.prototype.toString

module.exports =
function predicateToString(type){
  var str = '[object '+type+']'
  return function(value){
    return toString.call(value) === str
  }
}

},{}],34:[function(require,module,exports){
'use strict'

module.exports =
function push(result, input){
  result.push(input)
  return result
}

},{}],35:[function(require,module,exports){
'use strict'

module.exports =
function identity(result){
  return result
}

},{}],36:[function(require,module,exports){
module.exports = Array.isArray || require(33)('Array')

},{}],37:[function(require,module,exports){
'use strict'

module.exports =
function isFunction(value){
  return typeof value === 'function'
}

},{}],38:[function(require,module,exports){
module.exports = require(33)('Number')

},{}],39:[function(require,module,exports){
module.exports = require(33)('RegExp')

},{}],40:[function(require,module,exports){
module.exports = require(33)('String')

},{}],41:[function(require,module,exports){
'use strict'

module.exports =
function isUndefined(value){
  return value === void 0
}

},{}],42:[function(require,module,exports){
'use strict'

var isArray = require(36)

module.exports =
function objectMerge(result, input){
  if(isArray(input) && input.length === 2){
    result[input[0]] = input[1]
  } else {
    var prop
    for(prop in input){
      if(input.hasOwnProperty(prop)){
        result[prop] = input[prop]
      }
    }
  }
  return result
}

},{}],43:[function(require,module,exports){
'use strict'

module.exports =
function stringAppend(result, input){
  return result + input
}

},{}],44:[function(require,module,exports){
module.exports = require(3)([
  require(4),
  require(2),
  require(5)])

},{}]},{},[44]);
