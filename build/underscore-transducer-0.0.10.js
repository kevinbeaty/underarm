(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
var undef,
    symbolExists = typeof Symbol !== 'undefined',
    protocols = {
      iterator: symbolExists ? Symbol.iterator : '@@iterator',
      transformer: symbolExists ? Symbol('transformer') : '@@transformer'
    };

module.exports = {
  protocols: protocols,
  isIterator: isIterator,
  iterator: iterator,
  isTransformer: isTransformer,
  transformer: transformer,
  isReduced: isReduced,
  reduced: reduced,
  unreduced: unreduced,
  compose: compose
};

function isFunction(value){
  return typeof value === 'function';
}

function isIterator(value){
  return (value[protocols.iterator] !== undef)
    || (isFunction(value.next));
}

function iterator(value){
  var it;
  if(value[protocols.iterator]){
    it = value[protocols.iterator]();
  } else if(isFunction(value.next)){
    it = value;
  }
  return it;
}

function isTransformer(value){
  return (value[protocols.transformer] !== undef)
    || (isFunction(value.init) && isFunction(value.step) && isFunction(value.result));
}

function transformer(value){
  var xf;
  if(isTransformer(value)){
    xf = value[protocols.transformer];
    if(xf === undef){
      xf = value;
    }
  } else if(isFunction(value)){
    xf = new FunctionTransformer(value);
  }
  return xf;
}

function isReduced(value){
  return !!(value && value.__transducers_reduced__);
}

function reduced(value){
  if(!isReduced(value)){
    value = new Reduced(value);
  }
  return value;
}

function unreduced(value){
  if(isReduced(value)){
    value = value.value;
  }
  return value;
}

function Reduced(value){
  this.value = value;
}
Reduced.prototype.__transducers_reduced__ = true;

function compose(){
  var fns = arguments;
  return function(xf){
    var i = fns.length;
    while(i--){
      xf = fns[i].call(null, xf);
    }
    return xf;
  }
}

// Turns a step function into a transfomer with init, step, result (init not supported and will error)
// Like transducers-js Wrap
function FunctionTransformer(step){
  this.step = step;
}
FunctionTransformer.prototype.init = function(){
  throw new Error('Cannot init wrapped function, use proper transformer instead');
}
FunctionTransformer.prototype.step = function(result, input){
  return this.step(result, input);
}
FunctionTransformer.prototype.result = function(result){
  return result;
}

},{}],3:[function(require,module,exports){
var tp = require('transduce-protocol');

module.exports = {
  forEach: forEach,
  find: find,
  push: push,
  unshift: unshift,
  every: every,
  some: some,
  contains: contains
}

// Executes f with f(input, idx, result) for forEach item
// passed through transducer without changing the result.
function forEach(f) {
  return function(xf){
    return new ForEach(f, xf);
  }
}
function ForEach(f, xf) {
  this.xf = xf;
  this.f = f;
  this.i = 0;
}
ForEach.prototype.init = function(){
  return this.xf.init();
}
ForEach.prototype.result = function(result){
  return this.xf.result(result);
}
ForEach.prototype.step = function(result, input) {
  this.f(input, this.i++, result);
  return this.xf.step(result, input);
}

// Return the first value which passes a truth test. Aliased as `detect`.
// Stateless transducer
function find(predicate) {
   return function(xf){
     return new Find(predicate, xf);
   }
};
function Find(f, xf) {
  this.xf = xf;
  this.f = f;
}
Find.prototype.init = function(){
  return this.xf.init();
}
Find.prototype.result = function(result){
  return this.xf.result(result);
}
Find.prototype.step = function(result, input) {
  if(this.f(input)){
    result = tp.reduced(this.xf.step(result, input))
  }
  return result;
}

// Adds one or more items to the end of the sequence, like Array.prototype.push.
function push(){
  var toPush = toArray(arguments);
  return function(xf){
    return new Push(toPush, xf);
  }
}
function Push(toPush, xf) {
  this.xf = xf;
  this.toPush = toPush;
}
Push.prototype.init = function(){
  return this.xf.init();
}
Push.prototype.result = function(result){
  var idx, toPush = this.toPush, len = toPush.length;
  for(idx = 0; idx < len; idx++){
    result = this.xf.step(result, toPush[idx]);
  }
  return this.xf.result(result);
}
Push.prototype.step = function(result, input){
  return this.xf.step(result, input);
}

// Adds one or more items to the beginning of the sequence, like Array.prototype.unshift.
function unshift(){
  var toUnshift = toArray(arguments);
  return function(xf){
    return new Unshift(toUnshift, xf);
  }
}
function Unshift(toUnshift, xf) {
  this.xf = xf;
  this.toUnshift = toUnshift;
}
Unshift.prototype.init = function(){
  return this.xf.init();
}
Unshift.prototype.result = function(result){
  return this.xf.result(result);
}
Unshift.prototype.step = function(result, input){
  var toUnshift = this.toUnshift;
  if(toUnshift){
    var idx, len = toUnshift.length;
    for(idx = 0; idx < len; idx++){
      result = this.xf.step(result, toUnshift[idx]);
    }
  }
  this.toUnshift = null;
  return this.xf.step(result, input);
}

function toArray(args){
  var i=0; len = args.length; result=[];
  for(; i<len; i++){
    result[i] = args[i];
  }
  return result;
}

// Determine whether all of the elements match a truth test.
// Stateful transducer (found).  Early termination if item
// does not match predicate.
function every(predicate) {
  return function(xf){
    return new Every(predicate, xf);
  }
};
function Every(f, xf) {
  this.xf = xf;
  this.f = f;
  this.found = false;
}
Every.prototype.init = function(){
  return this.xf.init();
}
Every.prototype.result = function(result){
  if(!this.found){
    result = this.xf.step(result, true);
  }
  return this.xf.result(result);
}
Every.prototype.step = function(result, input) {
  if(!this.f(input)){
    this.found = true;
    return tp.reduced(this.xf.step(result, false));
  }
  return result;
}

// Determine if at least one element in the object matches a truth test.
// Aliased as `any`.
// Stateful transducer (found).  Early termination if item matches predicate.
function some(predicate) {
  return function(xf){
    return new Some(predicate, xf);
  }
};
function Some(f, xf) {
  this.xf = xf;
  this.f = f;
  this.found = false;
}
Some.prototype.init = function(){
  return this.xf.init();
}
Some.prototype.result = function(result){
  if(!this.found){
    result = this.xf.step(result, false);
  }
  return this.xf.result(result);
}
Some.prototype.step = function(result, input) {
  if(this.f(input)){
    this.found = true;
    return tp.reduced(this.xf.step(result, true));
  }
  return result;
}

// Determine if contains a given value (using `===`).
// Aliased as `include`.
// Stateful transducer (found). Early termination when item found.
function contains(target) {
  return some(function(x){return x === target});
}

},{"transduce-protocol":2}],4:[function(require,module,exports){
module.exports = {
  min: min,
  max: max
}

// Return the maximum element (or element-based computation).
function max(f) {
  return function(xf){
    return new Max(f, xf);
  }
};
function Max(f, xf) {
  this.xf = xf;
  this.f = f;
  this.computedResult = -Infinity;
  this.lastComputed = -Infinity
}
Max.prototype.init = function(){
  return this.xf.init();
}
Max.prototype.result = function(result){
  result = this.xf.step(result, this.computedResult);
  return this.xf.result(result);
}
Max.prototype.step = function(result, input) {
  var computed = this.f(input);
  if (computed > this.lastComputed
      || computed === -Infinity && this.computedResult === -Infinity) {
    this.computedResult = input;
    this.lastComputed = computed;
  }
  return result;
}

// Return the minimum element (or element-based computation).
function min(iteratee) {
  return function(xf){
    return new Min(iteratee, xf);
  }
};
function Min(f, xf) {
  this.xf = xf;
  this.f = f;
  this.computedResult = Infinity;
  this.lastComputed = Infinity
}
Min.prototype.init = function(){
  return this.xf.init();
}
Min.prototype.result = function(result){
  result = this.xf.step(result, this.computedResult);
  return this.xf.result(result);
}
Min.prototype.step = function(result, input) {
  var computed = this.f(input);
  if (computed < this.lastComputed
      || computed === Infinity && this.computedResult === Infinity) {
    this.computedResult = input;
    this.lastComputed = computed;
  }
  return result;
}

},{}],5:[function(require,module,exports){
module.exports=require(2)
},{"/Users/kbeaty/Projects/underscore-transducer/node_modules/transduce-array/node_modules/transduce-protocol/transduce-protocol.js":2}],6:[function(require,module,exports){
var tp = require('transduce-protocol'),
    undef;

module.exports = {
  asCallback: asCallback,
  asyncCallback: asyncCallback,
  LastValue: LastValue
}

// Reducer that maintains last value
function LastValue(){}
LastValue.prototype.init = function(){};
LastValue.prototype.result = function(val){
  return val;
};
LastValue.prototype.step = function(result, input){
  return input;
}

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
// If reducer is not defined, maintains last value and does not buffer results.
function asCallback(xf, reducer){
  var done = false, stepper, result;

  if(reducer === undef){
    reducer = new LastValue();
  }

  stepper = xf(reducer);
  result = stepper.init();

  return function(item){
    if(done) return result;

    if(item === undef){
      // complete
      result = stepper.result(result);
      done = true;
    } else {
      // step to next result.
      result = stepper.step(result, item);

      // check if exhausted
      if(tp.isReduced(result)){
        result = stepper.result(tp.unreduced(result));
        done = true;
      }
    }

    if(done) return result;
  }
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
function asyncCallback(xf, continuation, reducer){
  var done = false, stepper, result;

  if(reducer === undef){
    reducer = new LastValue();
  }

  stepper = xf(reducer);
  result = stepper.init();

  function checkDone(err, item){
    if(done){
      return true;
    }

    err = err || null;

    // check if exhausted
    if(tp.isReduced(result)){
      result = tp.unreduced(result);
      done = true;
    }

    if(err || done || item === undef){
      result = stepper.result(result);
      done = true;
    }

    // notify if done
    if(done){
      if(continuation){
        continuation(err, result);
        continuation = null;
      } else if(err){
        throw err;
      }
      result = null;
    }

    return done;
  }

  return function(err, item){
    if(!checkDone(err, item)){
      try {
        // step to next result.
        result = stepper.step(result, item);
        checkDone(err, item);
      } catch(err2){
        checkDone(err2, item);
      }
    }
  }
}

},{"transduce-protocol":5}],7:[function(require,module,exports){
module.exports=require(2)
},{"/Users/kbeaty/Projects/underscore-transducer/node_modules/transduce-array/node_modules/transduce-protocol/transduce-protocol.js":2}],8:[function(require,module,exports){
var protocol = require('transduce-protocol');

var impl = load();

module.exports = {
  into: impl.into,
  transduce: impl.transduce,
  reduce: impl.reduce,
  map: impl.map,
  filter: impl.filter,
  remove: impl.remove,
  take: impl.take,
  takeWhile: impl.takeWhile,
  drop: impl.drop,
  dropWhile: impl.dropWhile,
  protocols: protocol.protocols,
  isIterator: protocol.isIterator,
  iterator: protocol.iterator,
  isTransformer: protocol.isTransformer,
  transformer: protocol.transformer,
  isReduced: protocol.isReduced,
  reduced: protocol.reduced,
  unreduced: protocol.unreduced,
  compose: protocol.compose
};

function load(){
  var impl;
  try {
    impl = loadTransducersDashJS();
  } catch (e) {
    try {
      impl = loadTransducersDotJS();
    } catch(e2){
      throw new Error('Must npm install either transducers-js or transducers.js, your choice');
    }
  }
  return impl;
}

function loadTransducersDashJS(){
  var impl;
  if(typeof window !== 'undefined' && window.transducers && window.transducers.Wrap){
    impl = window.transducers;
  } else {
    impl = require('transducers-js');
  }
  return impl;
}

function loadTransducersDotJS(){
  //adapt methods to match transducers-js API
  var impl;
  if(typeof window !== 'undefined' && window.transducers){
    impl = window.transducers;
  } else {
    impl = require('transducers.js');
  }
  return {
    into: impl.into,
    transduce: function(xf, f, init, coll){
      f = protocol.transformer(f);
      return impl.transduce(coll, xf, f, init);
    },
    reduce: function(f, init, coll){
      f = protocol.transformer(f);
      return impl.reduce(coll, f, init);
    },
    map: function(f){
      return impl.map(null, f);
    },
    filter: function(p){
      return impl.filter(null, f);
    },
    remove: function(p){
      return impl.remove(null, f);
    },
    take: function(n){
      return impl.take(null, n);
    },
    takeWhile: function(pred){
      return impl.takeWhile(null, pred);
    },
    drop: function(n){
      return impl.drop(null, n);
    },
    dropWhile: function(pred){
      return impl.dropWhile(null, pred);
    }
  }
  return impl;
}

},{"transduce-protocol":7,"transducers-js":1,"transducers.js":1}],9:[function(require,module,exports){
  // Create quick reference variables for speed access to core prototypes.
  var slice = Array.prototype.slice, undef;

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
  _r.VERSION = '0.0.10';

  // Reference to Underscore from browser
  var _ = require('underscore'),
    transduce = require('transduce'),
    math = require('transduce-math'),
    array = require('transduce-array'),
    tpush = require('transduce-push');

  // Save the previous value of the `_r` variable.
  var previous_r, root;
  if(typeof window !== 'undefined'){
    var root = window;
    previous_r = root._r;
    root._r = _r;
    _ = root._;
  } else {
    root = {};
    module.exports = _r;
  }

  // Collection Functions
  // --------------------

  // Executes the iteratee with iteratee(input, idx, result) for each item
  // passed through transducer without changing the result.
  _r.each = _r.forEach = array.forEach;

  // Return the results of applying the iteratee to each element.
  // Stateless transducer
  _r.map = _r.collect = function(iteratee) {
    return transduce.map(_r.iteratee(iteratee));
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  // Stateless transducer
  _r.find = _r.detect = function(predicate) {
     predicate = _r.iteratee(predicate);
     _r.resolveSingleValue(this);
     return array.find(predicate);
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  // Stateless transducer
  _r.filter = _r.select = function(predicate) {
    predicate = _r.iteratee(predicate);
    return transduce.filter(predicate);
  };

  // Return all the elements for which a truth test fails.
  // Stateless transducer
  _r.reject = _r.remove = function(predicate) {
    return transduce.remove(_r.iteratee(predicate));
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  // Stateful transducer (found).  Early termination if item
  // does not match predicate.
  _r.every = _r.all = function(predicate) {
    predicate = _r.iteratee(predicate);
    _r.resolveSingleValue(this);
    return array.every(predicate);
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  // Stateful transducer (found).  Early termination if item matches predicate.
  _r.some = _r.any = function(predicate) {
    predicate = _r.iteratee(predicate);
    _r.resolveSingleValue(this);
    return array.some(predicate);
  };

  // Determine if contains a given value (using `===`).
  // Aliased as `include`.
  // Stateful transducer (found). Early termination when item found.
  _r.contains = _r.include = function(target) {
    return _r.some.call(this, function(x){return x === target});
  };

  // Invoke a method (with arguments) on every item in a collection.
  // Stateless transducer
  _r.invoke = function(method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _r.map(function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  // Stateless transducer.
  _r.pluck = function(key) {
    return _r.map(_.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  // Stateless transducer
  _r.where = function(attrs) {
    return _r.filter(_.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  // Stateful transducer (found). Early termination when found.
  _r.findWhere = function(attrs) {
    return _r.find.call(this, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  // Stateful transducer (current max value and computed result)
  _r.max = function(iteratee) {
    iteratee = _r.iteratee(iteratee);
    _r.resolveSingleValue(this);
    return math.max(iteratee);
  };

  // Return the minimum element (or element-based computation).
  // Stateful transducer (current min value and computed result)
  _r.min = function(iteratee) {
    iteratee = _r.iteratee(iteratee);
    _r.resolveSingleValue(this);
    return math.min(iteratee);
  };

  // Array Functions
  // ---------------

  // Adds one or more items to the end of the sequence, like Array.prototype.push.
  _r.push = array.push;

  // Adds one or more items to the beginning of the sequence, like Array.prototype.unshift.
  _r.unshift = array.unshift;

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`.
  // Stateful transducer (running count)
  _r.first = _r.head = _r.take = function(n) {
     if(n === undef){
       _r.resolveSingleValue(this);
       n = 1;
     } else {
       n = (n > 0) ? n : 0;
     }
     return transduce.take(n);
  };

  _r.takeWhile = function(pred) {
     pred = _r.iteratee(pred);
     return transduce.takeWhile(pred);
  };

  // Returns everything but the last entry. Passing **n** will return all the values
  // excluding the last N.
  // Stateful transducer (count and buffer).
  // Note that no items will be sent and all items will be buffered until completion.
  _r.initial = function(n) {
    n = (n === undef) ? 1 : (n > 0) ? n : 0;
    return function(xf){
      return new Initial(n, xf);
    }
  };
  function Initial(n, xf) {
    this.xf = xf;
    this.n = n;
    this.idx = 0;
    this.buffer = [];
  }
  Initial.prototype.init = function(){
    return this.xf.init();
  }
  Initial.prototype.result = function(result){
    var idx = 0, count = this.idx - this.n, buffer = this.buffer;
    for(idx = 0; idx < count; idx++){
      result = this.xf.step(result, buffer[idx]);
    }
    return result;
  }
  Initial.prototype.step = function(result, input){
    this.buffer[this.idx++] = input;
    return result;
  }

  // Get the last element. Passing **n** will return the last N  values.
  // Stateful transducer (count and buffer).
  // Note that no items will be sent until completion.
  _r.last = function(n) {
    if(n === undef){
      _r.resolveSingleValue(this);
      n = 1;
    } else {
      n = (n > 0) ? n : 0;
    }
    return function(xf){
      return new Last(n, xf);
    }
  };
  function Last(n, xf) {
    this.xf = xf;
    this.n = n;
    this.idx = 0;
    this.buffer = [];
  }
  Last.prototype.init = function(){
    return this.xf.init();
  }
  Last.prototype.result = function(result){
    var n = this.n, count = n, buffer=this.buffer, idx=this.idx;
    if(idx < count){
      count = idx;
      idx = 0;
    }
    while(count--){
      result = this.xf.step(result, buffer[idx++ % n]);
    }
    return this.xf.result(result);
  }
  Last.prototype.step = function(result, input){
    this.buffer[this.idx++ % this.n] = input;
    return result;
  }

  // Returns everything but the first entry. Aliased as `tail` and `drop`.
  // Passing an **n** will return the rest N values.
  // Stateful transducer (count of items)
  _r.rest = _r.tail = _r.drop = function(n) {
    n = (n === undef) ? 1 : (n > 0) ? n : 0;
    return transduce.drop(n);
  };

  _r.dropWhile = function(pred) {
     pred = _r.iteratee(pred);
     return transduce.dropWhile(pred);
  };

  // Trim out all falsy values from an array.
  // Stateless transducer
  _r.compact = function() {
    return _r.filter(_.identity);
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  // Steteful transducer (index and all seen items if not sorted, last seen item if sorted).
  _r.uniq = _r.unique = function(isSorted, iteratee) {
     if (!_.isBoolean(isSorted)) {
       iteratee = isSorted;
       isSorted = false;
     }
     if (iteratee != null) iteratee = _r.iteratee(iteratee);
     return function(xf){
       return new Uniq(iteratee, isSorted, xf);
     }
  };
  function Uniq(f, isSorted, xf) {
    this.xf = xf;
    this.f = f;
    this.isSorted = isSorted;
    this.seen = [];
    this.i = 0;
  }
  Uniq.prototype.init = function(){
    return this.xf.init();
  }
  Uniq.prototype.result = function(result){
    return this.xf.result(result);
  }
  Uniq.prototype.step = function(result, input){
    var seen = this.seen;
    if (this.isSorted) {
      if (!this.i || seen !== input){
        result = this.xf.step(result, input);
      }
      this.seen = input;
      this.i++;
    } else if (this.f) {
      var computed = this.f(input);
      if (_.indexOf(seen, computed) < 0) {
        seen.push(computed);
        result = this.xf.step(result, input);
      }
    } else if (_.indexOf(seen, input) < 0) {
        seen.push(input);
        result = this.xf.step(result, input);
    }
    return result;
  }

  // Invokes interceptor with each result and input, and then passes through input.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  // Executes interceptor with current result and input
  // Stateless transducer
  _r.tap = function(interceptor) {
   return function(xf){
     return new Tap(interceptor, xf);
   }
  };
  function Tap(f, xf) {
    this.xf = xf;
    this.f = f;
    this.i = 0;
  }
  Tap.prototype.init = function(){
    return this.xf.init();
  }
  Tap.prototype.result = function(result){
    return this.xf.result(result);
  }
  Tap.prototype.step = function(result, input) {
    this.f(result, input, this.i++);
    return this.xf.step(result, input);
  }

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

  // Add all of the Underscore functions to the wrapper object.
  _r.mixin(_r);

  // Returns the value if it is a chained transformation, else null
  _r.as = function(value){
    return value instanceof _r ? value : null;
  }

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
  }

  // Composes and returns the underlying wrapped functions
  _r.prototype.transducer = _r.prototype.compose = function() {
    var fns = this._wrappedFns;
    return fns.length ? _.compose.apply(null, fns) : undef;
  }

  // Helper to mark transducer to expect single value when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function
  _r.resolveSingleValue = function(self){
    resolveSingleValue(self, true);
  }

  // Helper to mark transducer to expect multiple values when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function.
  _r.resolveMultipleValues = function(self){
    resolveSingleValue(self, false);
  }

  function resolveSingleValue(self, single){
    if(_r.as(self)){
      self._resolveSingleValue = single;
    }
  }

  // sentinel to ignore wrapped objects (maintain only last item)
  var IGNORE = {};

  // Resolves the value of the wrapped object, similar to underscore.
  // Returns an array, or single value (to match underscore API)
  // depending on whether the chained transformation resolves to single value.
  _r.prototype.value = function(){
    if(!this._resolveSingleValue){
      return this.into();
    }

    var ret =  this.into(IGNORE);
    return ret === IGNORE ? undef : ret;
  }

  // Dispatchers
  // -----------
  var dispatch = _.reduce(
    ['iterator', 'iteratee', 'empty', 'append', 'wrap', 'unwrap'],
    function(memo, item){

    var d = function(){
      var args = arguments, fns = d._fns, i = fns.length, result,
          self = _r.as(this);
      for(; i-- ;){
        result = fns[i].apply(self, args);
        if(result !== undef){
          return result;
        }
      }
    };

    d._fns = [];

    d.register = function(fn){
      d._fns.push(fn);
    };

    memo[item] = d;
    return memo;
  }, {});

  // Wraps a value used as source for use during chained transformation. 
  //
  // Default returns value, or _r.empty() if undefined.
  //
  // Dispatch function. To support different types,
  // call _r.unwrap.register
  _r.wrap = function(value){
    return dispatch.wrap.call(this, value);
  }

  _r.wrap.register = function(fn){
    return dispatch.wrap.register(fn);
  }

  _r.wrap.register(function(value){
    if(value == null){
      value = _r.empty();
    }
    return value;
  });

  // Unwraps (deref) a possibly wrapped value
  // Default unwraps values created with _r.reduced,
  // or calls value() on chained _r transformations,
  // otherwise returns parameter.
  //
  // Dispatch function. To support different types,
  // call _r.unwrap.register
  _r.unwrap = _r.deref = function(value){
    return dispatch.unwrap(value);
  }

  _r.unwrap.register = function(fn){
    return dispatch.unwrap.register(fn);
  }

  _r.unwrap.register(function(value){
    if(_r.as(value)){
      return r.value();
    }
    return transduce.unreduced(value);
  });

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
  _r.iterator = function(obj){
    return dispatch.iterator(obj);
  }

  _r.iterator.register = function(fn){
    return dispatch.iterator.register(fn);
  }

  _r.iterator.register(transduce.iterator);

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
  _r.iteratee = function(value){
    return dispatch.iteratee(value);
  }

  _r.iteratee.register = function(fn){
    return dispatch.iteratee.register(fn);
  }

  _r.iteratee.register(function(value){
    if(_r.as(value)){
      return _riteratee(value);
    }
    return _.iteratee(value);
  });

  function _riteratee(value){
    return function(item){
      return value.withSource(item).value();
    }
  }

  // Returns empty object of the same type as argument.
  // Default returns [] if _.isArray or undefined, {} if _.isObject
  // and an internal sentinel to ignore otherwise
  //
  // Dispatch function. To support different types
  // call _r.empty.register and supply function that returns
  // an empty object after checking the input using appropriate
  // predicates. Return undefined if not supported, so other
  // dispatched functions can be checked
  _r.empty = function(obj){
    return obj === IGNORE ? IGNORE : dispatch.empty(obj);
  }

  _r.empty.register = function(fn){
    return dispatch.empty.register(fn);
  }

  _r.empty.register(function(obj){
    if(obj === undef || _.isArray(obj) || _r.iterator(obj)){
      return []; // array if not specified or from array
    } else if(_.isObject(obj)){
      return {}; // object if from object
    }

    // ignore by default. Default append just maintains last item.
    return IGNORE;
  });

  // Appends (conjoins) the item to the collection, and returns collection
  //
  // Dispatch function. To support different types
  // call _r.append.register and supply function that append to the object
  // (first param) with the item and optional key after checking the input
  // using appropriate predicates.
  //
  // Return undefined if not supported, so other dispatched functions can be checked
  _r.append = _r.conj = _r.conjoin = function(obj, item){
    // valid object and item, dispatch
    return dispatch.append(obj, item);
  }

  _r.append.register = function(fn){
    return dispatch.append.register(fn);
  }

  _r.append.register(function(obj, item){
    if(_.isArray(obj)){
      obj.push(item);
      return obj;
    }

    // just maintain last item
    return item;
  });

  // Reducer that dispatches to empty, unwrap and append
  function Dispatch(){}
  Dispatch.prototype.init = _r.empty;
  Dispatch.prototype.result = _r.unwrap;
  Dispatch.prototype.step = _r.append;


  // Transducer Functions
  // --------------------

  // Wrapper to return from iteratee of reduce to terminate
  // _r.reduce early with the provided value
  _r.reduced = transduce.reduced;
  _r.isReduced = transduce.isReduced;

  _r.reduce = _r.foldl = _r.inject = function(xf, init, coll) {
    if (coll == null) coll = _r.empty(coll);
    return transduce.reduce(xf, init, coll);
  };

  _r.transduce = function(xf, f, init, coll){
    if(_r.as(xf)){
      xf = xf.compose();
    }

    return _r.unwrap(transduce.transduce(xf, f, init, coll));
  }

  // Calls transduce using the chained transformation
  _r.prototype.transduce = function(f, init, coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return _r.transduce(this, f, init, coll);
  }

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
  _r.asCallback = function(xf, init){
    if(_r.as(xf)){
      xf = xf.compose();
    }

    var reducer;
    if(init !== undef){
      reducer = new Dispatch();
    }
    return tpush.asCallback(xf, reducer);
  }

  // Calls asCallback with the chained transformation
  _r.prototype.asCallback = function(init){
    return _r.asCallback(this,  init);
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
  _r.asyncCallback = function(xf, continuation, init){
    if(_r.as(xf)){
      xf = xf.compose();
    }

    var reducer;
    if(init !== undef){
      reducer = new Dispatch();
    }
    return tpush.asyncCallback(xf, continuation, reducer);
  }

  // Calls asyncCallback with the chained transformation
  _r.prototype.asyncCallback = function(continuation, init){
    return _r.asyncCallback(this, continuation, init);
  }

  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  _r.into = function(to, xf, from){
    var f = _r.append;

    if(from === undef){
      from = xf;
      xf = undef;
    }

    if(from === undef){
      from = _r.empty();
    }

    if(_r.as(xf)){
      xf = xf.compose();
    }

    if(xf === undef){
      return _r.reduce(f, to, from);
    }

    return _r.transduce(xf, f, to, from);
  }

  // Calls into using the chained transformation
  _r.prototype.into = function(to, from){
    if(from === undef){
      from = this._wrapped;
    }

    if(from === undef){
      from = _r.empty();
    }

    if(to === undef){
      to = _r.empty(from);
    }

    return _r.into(to, this, from);
  }

  // Returns a new collection of the empty value of the from collection
  _r.sequence = function(xf, from){
    return _r.into(_r.empty(from), xf, from);
  }

  // calls sequence with chained transformation and optional wrapped object
  _r.prototype.sequence = function(from){
    return this.into(_r.empty(from), from);
  }

  // Creates an (duck typed) iterator that calls the provided next callback repeatedly
  // and uses the return value as the next value of the iterator.
  // Marks iterator as done if the next callback returns undefined (returns nothing)
  // Can be used to as a source obj to reduce, transduce etc
  _r.generate = function(callback, callToInit){
    var gen = {};
    gen[transduce.protocols.iterator] = function(){
      var next = callToInit ? callback() : callback;
      return {
        next: function(){
          var value = next();
          return (value === undef) ? {done: true} : {done: false, value: value};
        }
      }
    }
    return gen;
  }

  // Transduces the current chained object by using the chained trasnformation
  // and an iterator created with the callback
  _r.prototype.generate = function(callback, callToInit){
    return this.withSource(_r.generate(callback, callToInit));
  }

},{"transduce":8,"transduce-array":3,"transduce-math":4,"transduce-push":6,"underscore":1}]},{},[9]);
