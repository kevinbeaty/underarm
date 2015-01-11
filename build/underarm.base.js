(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'
var async = require(3),
    Prom = require(2)

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
    return async
      .reduce(asXf(xf), init, coll)
      .then(unwrap)
  }

  _r.transduce.register(function(xf, f, init, coll){
    if(isAsync(xf)){
      return transduceAsync(xf, f, init, coll)
    }
  })

  function transduceAsync(xf, f, init, coll){
    return async
      .transduce(asXf(xf), f, init, coll)
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

},{}],2:[function(require,module,exports){
module.exports = Promise;

},{}],3:[function(require,module,exports){
'use strict'
var Prom = require(2),
    comp = require(5),
    arrayPush = require(31),
    isReduced = require(9),
    unreduced = require(21),
    transformer = require(29),
    iterator = require(25)

var impl = module.exports = {
  compose: compose,
  transduce: transduce,
  reduce: reduce,
  toArray: toArray,
  defer: defer,
  delay: delay
}

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

function toArray(xf, coll){
  var init = [],
      push = arrayPush
  if(coll === void 0){
    return reduce(push, init, xf)
  }
  return transduce(xf, push, init, coll)
}

var _transduce = spread(__transduce),
    _reduce = spread(__reduce)
function spread(fn, ctx){
  return function(arr){
    return fn.apply(ctx, arr)
  }
}

function transduce(xf, f, init, coll){
  return Prom
    .all([xf, f, init, coll])
    .then(_transduce)
}

function __transduce(xf, f, init, coll){
  f = transformer(f)
  xf = xf(f)
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
  var reduce = new Reduce(iterator(coll), init, xf)
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
        result = self.xf.result(self.value)
      } else {
        result = Prom
          .all([self.xf.step(self.value, item.value)])
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
        result = self.xf.result(unreduced(value))
      } else {
        result = self.iterate()
      }
      resolve(result)
    } catch(e){
      reject(e)
    }
  })
}

function _iteratorValue(item){
  return {done: false, value: item[0]}
}

function defer() {
  return delay()
}

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

Delay.prototype.init = function(){
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .resolve(self.xf.init())
}
Delay.prototype.step = function(value, input) {
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .all([value, input])
    .then(self._step)
}
Delay.prototype.result = function(value){
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
        resolve(task.xf.step(value, input))
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
        resolve(task.xf.result(value))
      } catch(e){
        reject(e)
      }
    }
  })
  return task.resolved
};

},{}],4:[function(require,module,exports){
'use strict'

var reduced = require(15),
    isReduced = require(9),
    reduce = require(14)

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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
'use strict'

module.exports =
function isReduced(value){
  return !!(value && value.__transducers_reduced__)
}

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
'use strict'
var compose = require(5),
    map = require(10),
    cat = require(4)
module.exports =
function mapcat(callback) {
  return compose(map(callback), cat)
}

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
'use strict'
var isReduced = require(9)

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

},{}],14:[function(require,module,exports){
'use strict'
var transformer = require(29),
    isReduced = require(9),
    unreduced = require(21),
    isArray = require(33),
    iterator = require(25)

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

},{}],15:[function(require,module,exports){
'use strict'

var isReduced = require(9)

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

},{}],16:[function(require,module,exports){
'use strict'
var filter = require(8)

module.exports = remove
function remove(p){
  return filter(function(x){
    return !p(x)
  })
}


},{}],17:[function(require,module,exports){
'use strict'

var reduced = require(15)

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

},{}],18:[function(require,module,exports){
'use strict'
var reduced = require(15)

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

},{}],19:[function(require,module,exports){
'use strict'
var transduce = require(20),
    reduce = require(14),
    push = require(31)

module.exports =
function toArray(xf, coll){
  var init = []
  if(coll === void 0){
    return reduce(push, init, xf)
  }
  return transduce(xf, push, init, coll)
}

},{}],20:[function(require,module,exports){
'use strict'
var transformer = require(29),
    reduce = require(14)

module.exports =
function transduce(xf, f, init, coll){
  f = transformer(f)
  return reduce(xf(f), init, coll)
}

},{}],21:[function(require,module,exports){
'use strict'

var isReduced = require(9)

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value.value
  }
  return value
}

},{}],22:[function(require,module,exports){
'use strict'
var symbol = require(26)

module.exports =
function isIterable(value){
  return (value[symbol] !== void 0)
}

},{}],23:[function(require,module,exports){
'use strict'
var isIterable = require(22),
    isFunction = require(34)

module.exports =
function isIterator(value){
  return isIterable(value) ||
    isFunction(value.next)
}

},{}],24:[function(require,module,exports){
'use strict'
var isIterable = require(22),
    symbol = require(26),
    isArray = require(33),
    isFunction = require(34),
    isString = require(37),
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

},{}],25:[function(require,module,exports){
'use strict'
var symbol = require(26),
    iterable = require(24),
    isFunction = require(34)

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

},{}],26:[function(require,module,exports){
'use strict'
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined'
module.exports = symbolExists ? Symbol.iterator : '@@iterator'

},{}],27:[function(require,module,exports){
'use strict'
var symbol = require(28),
    isFunction = require(34)

module.exports =
function isTransformer(value){
  return (value[symbol] !== void 0) ||
    (isFunction(value.step) && isFunction(value.result))
}

},{}],28:[function(require,module,exports){
'use strict'
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined'
module.exports = symbolExists ? Symbol('transformer') : '@@transformer'

},{}],29:[function(require,module,exports){
'use strict'
var undef,
    slice = Array.prototype.slice,
    symbol = require(28),
    isTransformer = require(27),
    isArray = require(33),
    isFunction = require(34),
    isString = require(37),
    identity = require(32),
    arrayPush = require(31),
    objectMerge = require(39),
    stringAppend = require(40)

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

},{}],30:[function(require,module,exports){
'use strict'
var toString = Object.prototype.toString

module.exports =
function predicateToString(type){
  var str = '[object '+type+']'
  return function(value){
    return toString.call(value) === str
  }
}

},{}],31:[function(require,module,exports){
'use strict'

module.exports =
function push(result, input){
  result.push(input)
  return result
}

},{}],32:[function(require,module,exports){
'use strict'

module.exports =
function identity(result){
  return result
}

},{}],33:[function(require,module,exports){
module.exports = Array.isArray || require(30)('Array')

},{}],34:[function(require,module,exports){
'use strict'

module.exports =
function isFunction(value){
  return typeof value === 'function'
}

},{}],35:[function(require,module,exports){
module.exports = require(30)('Number')

},{}],36:[function(require,module,exports){
module.exports = require(30)('RegExp')

},{}],37:[function(require,module,exports){
module.exports = require(30)('String')

},{}],38:[function(require,module,exports){
'use strict'

module.exports =
function isUndefined(value){
  return value === void 0
}

},{}],39:[function(require,module,exports){
'use strict'

var isArray = require(33)

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

},{}],40:[function(require,module,exports){
'use strict'

module.exports =
function stringAppend(result, input){
  return result + input
}

},{}],41:[function(require,module,exports){
'use strict'
var merge = require(39),
    isArray = require(33),
    isFunction = require(34)

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

},{}],42:[function(require,module,exports){
'use strict'
var dispatcher = require(46)

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
      _reduce = require(14),
      _unreduced = require(21),
      transduce = _r.transduce = dispatcher(),
      _transduce = require(20),
      into = _r.into = dispatcher(),
      transducer = _r.transducer = dispatcher(),
      iterator = _r.iterator = dispatcher(),
      _iterator = require(25),
      toArray = _r.toArray = dispatcher(),
      _toArray = require(19),
      iteratee = _r.iteratee = dispatcher()
  _r.resolveSingleValue = resolveSingleValue
  _r.resolveMultipleValues = resolveMultipleValues
  _r.reduced = require(15)
  _r.isReduced = require(9)
  _r.foldl = reduce
  _r.inject = reduce
  _r.deref = unwrap
  _r.conj = append
  _r.conjoin = append
  _r.dispatch = dispatch

  var compose = _r.compose = require(5)
  _r.isIterable = require(22)
  _r.isIterator = require(23)
  _r.iterable = require(24)
  _r.isTransformer = require(27)
  _r.transformer = require(29)
  _r.protocols = {
    iterator: require(26),
    transformer: require(28)
  }
  _r.isFunction = require(34)
  var isArray = _r.isArray = require(33)
  var isString = _r.isString = require(37)
  _r.isRegExp = require(36)
  _r.isNumber = require(35)
  _r.isUndefined = require(38)
  _r.arrayPush = require(31)
  _r.objectMerge = require(39)
  _r.stringAppend = require(40)
  var identity = _r.identity = require(32)


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

},{}],43:[function(require,module,exports){
'use strict'
module.exports = function(libs, _r){
  var i = 0, len = libs.length, lib
  if(_r === void 0){
    _r = require(41)
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

},{}],44:[function(require,module,exports){
'use strict'

// Based on Underscore.js 1.7.0
// http://underscorejs.org
//
// Which is distributed under MIT License:
// Underscore.js > (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Underscore.js > Underscore may be freely distributed under the MIT license.

var isFunction = require(34),
    isArray = require(33),
    isString = require(37),
    isNumber = require(35),
    identity = require(32)

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

},{}],45:[function(require,module,exports){
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
      isFunction = require(34),
      identity = require(32)

  // Return the results of applying the iteratee to each element.
  var _map = require(10)
  function map(f) {
    return _map(iteratee(f))
  }

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  var _filter = require(8)
  function filter(predicate) {
    return _filter(iteratee(predicate))
  }

  // Return all the elements for which a truth test fails.
  var _remove = require(16)
  function remove(predicate) {
    return _remove(iteratee(predicate))
  }

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`.
  var _take = require(17)
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
  var _takeWhile = require(18)
  function takeWhile(predicate) {
     return _takeWhile(iteratee(predicate))
  }

  // Returns everything but the first entry. Aliased as `tail` and `drop`.
  // Passing an **n** will return the rest N values.
  var _drop = require(6)
  function drop(n) {
    n = (n === void 0) ? 1 : (n > 0) ? n : 0
    return _drop(n)
  }

  // Drops items while the predicate returns true
  var _dropWhile = require(7)
  function dropWhile(predicate) {
     return _dropWhile(iteratee(predicate))
  }

  // Concatenating transducer.
  // NOTE: unlike libraries, cat should be called as a function to use.
  // _r.cat() not _r.cat
  var _cat = require(4)
  function cat(){
    return _cat
  }

  // mapcat.
  // Composition of _r.map(f) and _r.cat()
  var _mapcat = require(11)
  function mapcat(f){
    return _mapcat(iteratee(f))
  }

  // Partitions the source into arrays of size n
  // When transformer completes, the array will be stepped with any remaining items.
  // Alias chunkAll
  var _partitionAll = require(12)
  function partitionAll(n){
    return _partitionAll(n)
  }

  // Partitions the source into sub arrays while the value of the function
  // changes equality.
  var _partitionBy = require(13)
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

},{}],46:[function(require,module,exports){
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

},{}],47:[function(require,module,exports){
module.exports = require(43)([
  require(44),
  require(42),
  require(45)])

},{}],48:[function(require,module,exports){
module.exports = require(43)([
  require(1)],
  require(47))

},{}]},{},[48]);
