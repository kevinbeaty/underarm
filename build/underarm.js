(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var async = require('transduce-async'),
    Prom = require('any-promise'),
    undef;

module.exports = function(_r){
  var empty = _r.empty,
      append = _r.append,
      unwrap = _r.unwrap,
      IGNORE = _r.IGNORE,
      transducer = _r.transducer,
      as = _r.as,
      _ = _r._;

  _r.resolveAsync = resolveAsync;
  _r.mixin({
    defer: defer,
    delay: delay
  });

  // Helper to mark transducer to resolve as a Promise
  //  Only valid when chaining, but this should be passed
  // when called as a function
  function resolveAsync(self){
    if(as(self)){
      self._opts.resolveAsync = true;
    }
  }
  _r.prototype.async = function(){
    resolveAsync(this);
    return this;
  };

  function isAsync(self){
    return as(self) && self._opts.resolveAsync;
  }

  // Resolve async values as a promise
  _r.value.register(function(r){
    var promise;
    if(r._opts.resolveAsync){
      if(!r._opts.resolveSingleValue){
        promise = r.into();
      } else {
        promise = r
          .into(IGNORE)
          .then(_value);
      }
      return promise;
    }
  });

  function _value(result){
    return result === IGNORE ? undef : result;
  }

  _r.wrap.register(function(value){
    if(value && _.isFunction(value.then)){
      /*jshint validthis:true*/
      resolveAsync(this);
    }
  });

  _r.prototype.then = function(resolve, reject){
    resolveAsync(this);
    return this.value()
      .then(resolve, reject);
  };

  function defer(){
    /*jshint validthis:true*/
    resolveAsync(this);
    return async.defer();
  }

  function delay(wait){
    /*jshint validthis:true*/
    resolveAsync(this);
    return async.delay(wait);
  }

  _r.transducer.register(function(self){
    if(isAsync(self)){
      return async.compose.apply(null, self._wrappedFns);
    }
  });

  function asXf(xf){
    if(as(xf)){
      xf = transducer(xf);
    }
    return xf;
  }

  _r.reduce.register(function(xf, init, coll) {
    if(isAsync(xf)){
      return reduceAsync(xf, init, coll);
    }
  });

  function reduceAsync(xf, init, coll) {
    if (coll === null || coll === undef) coll = empty(coll);
    return async
      .reduce(asXf(xf), init, coll)
      .then(unwrap);
  }

  _r.transduce.register(function(xf, f, init, coll){
    if(isAsync(xf)){
      return transduceAsync(xf, f, init, coll);
    }
  });

  function transduceAsync(xf, f, init, coll){
    return async
      .transduce(asXf(xf), f, init, coll)
      .then(unwrap);
  }

  _r.into.register(function(to, xf, from){
    if(isAsync(xf)){
      return intoAsync(to, xf, from);
    }
  });

  function intoAsync(to, xf, from){
    if(from === undef){
      from = xf;
      xf = undef;
    }
    xf = asXf(xf);
    return Prom
      .all([to, from])
      .then(_into(xf));
  }

  function _into(xf){
    return function(toFrom){
      var to = toFrom[0],
          from = toFrom[1];
      if(from === undef){
        from = empty();
      }

      if(to === undef){
        to = empty(from);
      }

      if(xf === undef){
        return reduceAsync(append, to, from);
      }

      return transduceAsync(xf, append, to, from);
    };
  }

  // Returns a new collection of the empty value of the from collection
  _r.sequence.register(function(xf, from){
    if(isAsync(xf)){
      return Prom
        .all([from])
        .then(_sequence(xf));
    }
  });

  function _sequence(xf){
    return function(from){
      from = from[0];
      return intoAsync(empty(from), xf, from);
    };
  }
};

},{"any-promise":3,"transduce-async":5}],2:[function(require,module,exports){
"use strict";
var undef;
module.exports = function(_r){
  var _ = _r._;

  _r.mixin({
    throttle: throttle,
    debounce: debounce
  });

  function throttle(wait, options){
    return sample(_.partial(_.throttle, _, wait, options));
  }

  function debounce(wait, immediate){
    return sample(_.partial(_.debounce, _, wait, immediate));
  }

  function sample(sampler){
    return function(xf){
      return new Sample(sampler, xf);
    };
  }
  function Sample(sampler, xf){
    this.xf = xf;
    this._sample = sampler(xf.step.bind(xf));
  }
  Sample.prototype.init = function(){
    return this.xf.init();
  };
  Sample.prototype.result = function(result){
    return this.xf.result(result);
  };
  Sample.prototype.step = function(result, input) {
    var res = this._sample(result, input);
    return res !== undef ? res : result;
  };
};

},{}],3:[function(require,module,exports){
module.exports = Promise;

},{}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
"use strict";
var tp = require('transduce-protocol'),
    Prom = require('any-promise'),
    undef;

var impl = module.exports = {
  compose: compose,
  transduce: transduce,
  reduce: reduce,
  defer: defer,
  delay: delay
};
impl.toArray = tp.transduceToArray(impl);

function compose(/*args*/){
  var toArgs = [],
      fromArgs = arguments,
      len = fromArgs.length,
      i = 0;
  for(; i < len; i++){
    toArgs.push(fromArgs[i]);
    toArgs.push(defer());
  }
  return tp.compose.apply(null, toArgs);
}

var _transduce = spread(__transduce),
    _reduce = spread(__reduce);
function spread(fn, ctx){
  return function(arr){
    return fn.apply(ctx, arr);
  };
}

function transduce(xf, f, init, coll){
  return Prom
    .all([xf, f, init, coll])
    .then(_transduce);
}

function __transduce(xf, f, init, coll){
  f = tp.transformer(f);
  xf = xf(f);
  return reduce(xf, init, coll);
}

function reduce(xf, init, coll){
  if(coll === undef){
    coll = init;
    init = xf.init();
  }
  return Prom
    .all([xf, init, coll])
    .then(_reduce);
}

function __reduce(xf, init, coll){
  xf = tp.transformer(xf);
  var reduce = new Reduce(tp.iterator(coll), init, xf);
  return reduce.iterate();
}
function Reduce(iter, init, xf){
  var self = this;
  self.xf = xf;
  self.iter = iter;
  self.value = init;
  self._step = spread(self.__step, self);
  self._loop = spread(self.__loop, self);
}
Reduce.prototype.iterate = function(){
  var self = this;
  return Prom
    .all([self.next()])
    .then(self._step);
};
Reduce.prototype.next = function(){
  var self = this;
  return new Prom(function(resolve, reject){
    try {
      var item = self.iter.next();
      if(!item.done){
        item = Prom
          .all([item.value])
          .then(_iteratorValue);
      }
      resolve(item);
    } catch(e){
      reject(e);
    }
  });
};
Reduce.prototype.__step = function(item){
  var self = this;
  return new Prom(function(resolve, reject){
    try {
      var result;
      if(item.done){
        result = self.xf.result(self.value);
      } else {
        result = Prom
          .all([self.xf.step(self.value, item.value)])
          .then(self._loop);
      }
      resolve(result);
    } catch(e){
      reject(e);
    }
  });
};
Reduce.prototype.__loop = function(value){
  var self = this;
  self.value = value;
  return new Prom(function(resolve, reject){
    try {
      var result;
      if(tp.isReduced(value)){
        result = self.xf.result(tp.unreduced(value));
      } else {
        result = self.iterate();
      }
      resolve(result);
    } catch(e){
      reject(e);
    }
  });
};

function _iteratorValue(item){
  return {done: false, value: item[0]};
}

function defer() {
  return delay();
}

function delay(wait) {
  return function(xf){
    return new Delay(wait, xf);
  };
}
function Delay(wait, xf) {
  var self = this,
      task = new DelayTask(wait, xf);
  self.xf = xf;
  self.task = task;
  self._step = spread(task.step, task);
  self._result = spread(task.result, task);
}

Delay.prototype.init = function(){
  var self = this,
      task = self.task;
  if(task.resolved){
    return task.resolved;
  }

  return Prom
    .resolve(self.xf.init());
};
Delay.prototype.step = function(value, input) {
  var self = this,
      task = self.task;
  if(task.resolved){
    return task.resolved;
  }

  return Prom
    .all([value, input])
    .then(self._step);
};
Delay.prototype.result = function(value){
  var self = this,
      task = self.task;
  if(task.resolved){
    return task.resolved;
  }

  return Prom
    .all([value])
    .then(self._result);
};

function DelayTask(wait, xf){
  this.wait = wait;
  this.xf = xf;
  this.q = [];
}
DelayTask.prototype.call = function(){
  var next = this.q[0];
  if(next && !next.processing){
    next.processing = true;

    var wait = next.wait;
    if(wait > 0){
      setTimeout(next.fn, wait);
    } else {
      next.fn();
    }
  }
};
DelayTask.prototype.step = function(value, input){
  var task = this;
  return new Prom(function(resolve, reject){
    task.q.push({fn: step, wait: task.wait});
    task.call();

    function step(){
      try {
        resolve(task.xf.step(value, input));
        task.q.shift();
        if(task.q.length > 0){
          task.call();
        }
      } catch(e){
        reject(e);
      }
    }
  });
};
DelayTask.prototype.result = function(value){
  var task = this;
  task.resolved = new Prom(function(resolve, reject){
    task.q.push({fn: result});
    task.call();
    function result(){
      try {
        task.q = [];
        resolve(task.xf.result(value));
      } catch(e){
        reject(e);
      }
    }
  });
  return task.resolved;
};

},{"any-promise":3,"transduce-protocol":6}],6:[function(require,module,exports){
"use strict";
/* global Symbol */
var undef,
    symbolExists = typeof Symbol !== 'undefined',
    /* jshint newcap:false */
    symIterator = symbolExists ? Symbol.iterator : '@@iterator',
    symTransformer = symbolExists ? Symbol('transformer') : '@@transformer',
    protocols = {
      iterator: symIterator,
      transformer: symTransformer
    },
    Arr = Array,
    ArrProto = Arr.prototype,
    slice = ArrProto.slice,
    isArray = (isFunction(Arr.isArray) ? Arr.isArray : _isArray),
    Obj = Object,
    ObjProto = Obj.prototype,
    toString = ObjProto.toString;

module.exports = {
  protocols: protocols,
  isIterable: isIterable,
  isIterator: isIterator,
  iterable: iterable,
  iterator: iterator,
  isTransformer: isTransformer,
  transformer: transformer,
  isReduced: isReduced,
  reduced: reduced,
  unreduced: unreduced,
  deref: unreduced,
  compose: compose,
  isFunction: isFunction,
  isArray: isArray,
  arrayPush: push,
  identity: identity,
  transduceToArray: toArray
};

function isFunction(value){
  return typeof value === 'function';
}

function _isArray(value){
  return toString.call(value) === '[object Array]';
}

function isIterable(value){
  return (value[symIterator] !== undef);
}

function isIterator(value){
  return isIterable(value) || 
    (isFunction(value.next));
}

function iterable(value){
  var it;
  if(isIterable(value)){
    it = value;
  } else if(isArray(value)){
    it = new ArrayIterable(value);
  } else if(isFunction(value)){
    it = new FunctionIterable(value);
  }
  return it;
}

function iterator(value){
  var it = iterable(value);
  if(it !== undef){
    it = it[symIterator]();
  } else if(isFunction(value.next)){
    // handle non-well-formed iterators that only have a next method
    it = value;
  }
  return it;
}

function isTransformer(value){
  return (value[symTransformer] !== undef) ||
    (isFunction(value.step) && isFunction(value.result));
}

function transformer(value){
  var xf;
  if(isTransformer(value)){
    xf = value[symTransformer];
    if(xf === undef){
      xf = value;
    }
  } else if(isFunction(value)){
    xf = new FunctionTransformer(value);
  } else if(isArray(value)){
    xf = new ArrayTransformer(value);
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
      xf = fns[i](xf);
    }
    return xf;
  };
}

function toArray(impl){
  return function(xf, coll){
    var init = [];
    if(coll === undef){
      return impl.reduce(push, init, xf);
    }
    return impl.transduce(xf, push, init, coll);
  };
}

function push(result, input){
  result.push(input);
  return result;
}

function identity(result){
  return result;
}

// Wrap an Array into an iterable
function ArrayIterable(arr){
  this.arr = arr;
}
ArrayIterable.prototype[symIterator] = function(){
  return new ArrayIterator(this.arr);
};

// Turns an Array into an iterator
function ArrayIterator(arr){
  this.arr = arr;
  this.idx = 0;
}
ArrayIterator.prototype.next = function(){
  if(this.idx >= this.arr.length){
    return {done: true};
  }

  return {done: false, value: this.arr[this.idx++]};
};

// Wrap an function into an iterable that calls function on every next
function FunctionIterable(fn){
  this.fn = fn;
}
FunctionIterable.prototype[symIterator] = function(){
  return new FunctionIterator(this.fn);
};

// Turns a function into an infinite iterator that calls function on every next
function FunctionIterator(fn){
  this.fn = fn;
}
FunctionIterator.prototype.next = function(){
  return {done: false, value: this.fn()};
};

// Pushes value on array, using optional constructor arg as default, or [] if not provided
// init will clone the default
// step will push input onto array and return result
// result is identity
function ArrayTransformer(arr){
  this.arrDefault = arr === undef ? [] : arr;
}
ArrayTransformer.prototype.init = function(){
  return slice.call(this.arrDefault);
};
ArrayTransformer.prototype.step = push;
ArrayTransformer.prototype.result = identity;

// Turns a step function into a transfomer with init, step, result (init not supported and will error)
// Like transducers-js Wrap
function FunctionTransformer(step){
  this.step = step;
}
FunctionTransformer.prototype.init = function(){
  throw new Error('Cannot init wrapped function, use proper transformer instead');
};
FunctionTransformer.prototype.step = function(result, input){
  return this.step(result, input);
};
FunctionTransformer.prototype.result = identity;

},{}],7:[function(require,module,exports){
"use strict";
var array = require('transduce-array'), undef;

module.exports = function(_r){
  // Array Functions
  // ---------------
  _r.mixin({
    forEach: array.forEach,
    each: array.forEach,
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
    initial: initial,
    last: last,
    unique: unique,
    uniq: unique
  });

  var iteratee = _r.iteratee,
      resolveSingleValue = _r.resolveSingleValue,
      _ = _r._;

  // Return the first value which passes a truth test. Aliased as `detect`.
  function find(predicate) {
     /*jshint validthis:true*/
     resolveSingleValue(this);
     return array.find(iteratee(predicate));
  }

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  function every(predicate) {
     /*jshint validthis:true*/
    resolveSingleValue(this);
    return array.every(iteratee(predicate));
  }

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  function some(predicate) {
     /*jshint validthis:true*/
    resolveSingleValue(this);
    return array.some(iteratee(predicate));
  }

  // Determine if contains a given value (using `===`).
  // Aliased as `include`.
  function contains(target) {
     /*jshint validthis:true*/
    return some.call(this, function(x){ return x === target; });
  }

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  function findWhere(attrs) {
     /*jshint validthis:true*/
    return find.call(this, _.matches(attrs));
  }

  // Returns everything but the last entry. Passing **n** will return all the values
  // excluding the last N.
  // Note that no items will be sent and all items will be buffered until completion.
  function initial(n) {
    n = (n === undef) ? 1 : (n > 0) ? n : 0;
    return function(xf){
      return new Initial(n, xf);
    };
  }
  function Initial(n, xf) {
    this.xf = xf;
    this.n = n;
    this.idx = 0;
    this.buffer = [];
  }
  Initial.prototype.init = function(){
    return this.xf.init();
  };
  Initial.prototype.result = function(result){
    var idx = 0, count = this.idx - this.n, buffer = this.buffer;
    for(idx = 0; idx < count; idx++){
      result = this.xf.step(result, buffer[idx]);
    }
    return result;
  };
  Initial.prototype.step = function(result, input){
    this.buffer[this.idx++] = input;
    return result;
  };

  // Get the last element. Passing **n** will return the last N  values.
  // Note that no items will be sent until completion.
  function last(n) {
    if(n === undef){
     /*jshint validthis:true*/
      resolveSingleValue(this);
      n = 1;
    } else {
      n = (n > 0) ? n : 0;
    }
    return function(xf){
      return new Last(n, xf);
    };
  }
  function Last(n, xf) {
    this.xf = xf;
    this.n = n;
    this.idx = 0;
    this.buffer = [];
  }
  Last.prototype.init = function(){
    return this.xf.init();
  };
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
  };
  Last.prototype.step = function(result, input){
    this.buffer[this.idx++ % this.n] = input;
    return result;
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  function unique(isSorted, f) {
     if (!_.isBoolean(isSorted)) {
       f = isSorted;
       isSorted = false;
     }
     if (f !== undef) f = iteratee(f);
     return function(xf){
       return new Uniq(f, isSorted, xf);
     };
  }
  function Uniq(f, isSorted, xf) {
    this.xf = xf;
    this.f = f;
    this.isSorted = isSorted;
    this.seen = [];
    this.i = 0;
  }
  Uniq.prototype.init = function(){
    return this.xf.init();
  };
  Uniq.prototype.result = function(result){
    return this.xf.result(result);
  };
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
  };
};

},{"transduce-array":14}],8:[function(require,module,exports){
"use strict";
var transduce = require('transduce'),
    slice = Array.prototype.slice, undef;

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
  });

  var iteratee = _r.iteratee,
      _ = _r._;

  // Return the results of applying the iteratee to each element.
  function map(f) {
    return transduce.map(iteratee(f));
  }

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  function filter(predicate) {
    return transduce.filter(iteratee(predicate));
  }

  // Return all the elements for which a truth test fails.
  function remove(predicate) {
    return transduce.remove(iteratee(predicate));
  }

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`.
  function take(n) {
     if(n === undef){
       /*jshint validthis:true*/
       _r.resolveSingleValue(this);
       n = 1;
     } else {
       n = (n > 0) ? n : 0;
     }
     return transduce.take(n);
  }

  // takes items until predicate returns false
  function takeWhile(predicate) {
     return transduce.takeWhile(iteratee(predicate));
  }

  // Returns everything but the first entry. Aliased as `tail` and `drop`.
  // Passing an **n** will return the rest N values.
  function drop(n) {
    n = (n === undef) ? 1 : (n > 0) ? n : 0;
    return transduce.drop(n);
  }

  // Drops items while the predicate returns true
  function dropWhile(predicate) {
     return transduce.dropWhile(iteratee(predicate));
  }

  // Concatenating transducer.
  // NOTE: unlike libraries, cat should be called as a function to use.
  // _r.cat() not _r.cat
  function cat(){
    return transduce.cat;
  }

  // mapcat.
  // Composition of _r.map(f) and _r.cat()
  function mapcat(f){
    return transduce.mapcat(iteratee(f));
  }

  // Partitions the source into arrays of size n
  // When transformer completes, the array will be stepped with any remaining items.
  // Alias chunkAll
  function partitionAll(n){
    return transduce.partitionAll(n);
  }

  // Partitions the source into sub arrays while the value of the function
  // changes equality.
  function partitionBy(f){
    return transduce.partitionBy(iteratee(f));
  }

  // Trim out all falsy values from an array.
  function compact() {
    return filter(_.identity);
  }

  // Invoke a method (with arguments) on every item in a collection.
  function invoke(method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return map(function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  }

  // Convenience version of a common use case of `map`: fetching a property.
  function pluck(key) {
    return map(_.property(key));
  }

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  function where(attrs) {
    return filter(_.matches(attrs));
  }
};

},{"transduce":19}],9:[function(require,module,exports){
"use strict";
var tr = require('transduce'), undef;

module.exports = function(_r){
  var _ = _r._,
      as = _r.as,
      // sentinel to ignore wrapped objects (maintain only last item)
      IGNORE = _r.IGNORE = {};

  // Transducer Functions
  // --------------------
  _r.value = value;
  _r.resolveSingleValue = resolveSingleValue;
  _r.resolveMultipleValues = resolveMultipleValues;
  _r.reduced = tr.reduced;
  _r.isReduced = tr.isReduced;
  _r.reduce = reduce;
  _r.foldl = reduce;
  _r.inject = reduce;
  _r.transduce = transduce;
  _r.transducer = transducer;
  _r.into = into;
  _r.sequence = sequence;
  _r.wrap = wrap;
  _r.unwrap = unwrap;
  _r.deref = unwrap;
  _r.iterator = iterator;
  _r.iteratee = iteratee;
  _r.empty = empty;
  _r.append = append;
  _r.conj = append;
  _r.conjoin = append;
  _r.dispatch = dispatchXf;

  // Dispatchers
  // -----------
  var dispatch = _.reduce(
        ['value', 'reduce', 'transduce', 'into', 'sequence', 'transducer',
         'iterator', 'iteratee', 'empty', 'append', 'wrap', 'unwrap'],
        function(memo, item){

        var d = function(){
          var args = arguments, fns = d._fns, i = fns.length, result,
              self = as(this);
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

  // Resolves the value of the wrapped object, similar to underscore.
  // Returns an array, or single value (to match underscore API)
  // depending on whether the chained transformation resolves to single value.
  function value(r){
    return dispatch.value(r);
  }

  value.register = function(fn){
    return dispatch.value.register(fn);
  };

  value.register(function(self){
    if(!self._opts.resolveSingleValue){
      return self.into();
    }

    var ret =  self.into(IGNORE);
    return ret === IGNORE ? undef : ret;
  });

  _r.prototype.value = function(){
    return value(this);
  };

  // Helper to mark transducer to expect single value when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function
  function resolveSingleValue(self){
    _resolveSingleValue(self, true);
  }

  // Helper to mark transducer to expect multiple values when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function.
  function resolveMultipleValues(self){
    _resolveSingleValue(self, false);
  }

  function _resolveSingleValue(self, single){
    if(_r.as(self)){
      self._opts.resolveSingleValue = single;
    }
  }

  // Composes and returns the underlying wrapped functions for give chained object
  function transducer(r){
    return dispatch.transducer(r);
  }

  transducer.register = function(fn){
    return dispatch.transducer.register(fn);
  };

  transducer.register(function(self){
    var fns = self._wrappedFns;
    return fns.length ? _.compose.apply(null, fns) : _.identity;
  });

  _r.prototype.transducer = _r.prototype.compose = function() {
    return transducer(this);
  };

  function reduce(xf, init, coll){
    return dispatch.reduce(xf, init, coll);
  }

  reduce.register = function(fn){
    return dispatch.reduce.register(fn);
  };

  reduce.register(function(xf, init, coll) {
    if(_r.as(xf)){
      xf = transducer(xf);
    }

    if (coll === null || coll === undef) coll = empty(coll);
    return tr.reduce(xf, init, coll);
  });

  // Calls transduce using the chained transformation if function not passed
  _r.prototype.reduce = function(init, coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return reduce(this, init, coll);
  };

  function transduce(xf, f, init, coll){
    return dispatch.transduce(xf, f, init, coll);
  }

  transduce.register = function(fn){
    return dispatch.transduce.register(fn);
  };

  transduce.register(function(xf, f, init, coll){
    if(_r.as(xf)){
      xf = transducer(xf);
    }

    return _r.unwrap(tr.transduce(xf, f, init, coll));
  });

  // Calls transduce using the chained transformation
  _r.prototype.transduce = function(f, init, coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return transduce(this, f, init, coll);
  };


  function into(to, xf, from){
    return dispatch.into(to, xf, from);
  }

  into.register = function(fn){
    return dispatch.into.register(fn);
  };

  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  into.register(function(to, xf, from){
    if(from === undef){
      from = xf;
      xf = undef;
    }

    if(from === undef){
      from = empty();
    }

    if(as(xf)){
      xf = transducer(xf);
    }

    if(to === undef){
      to = empty(from);
    }

    if(xf === undef){
      return reduce(append, to, from);
    }

    return transduce(xf, append, to, from);
  });

  // Calls into using the chained transformation
  _r.prototype.into = function(to, from){
    if(from === undef){
      from = this._wrapped;
    }
    return into(to, this, from);
  };

  function sequence(xf, from){
    return dispatch.sequence(xf, from);
  }

  sequence.register = function(fn){
    return dispatch.sequence.register(fn);
  };

  // Returns a new collection of the empty value of the from collection
  sequence.register(function(xf, from){
    return into(empty(from), xf, from);
  });

  // calls sequence with chained transformation and optional wrapped object
  _r.prototype.sequence = function(from){
    if(from == undef){
      from = this._wrapped;
    }
    return sequence(this, from);
  };

  // Wraps a value used as source for use during chained transformation. 
  //
  // Default returns value, or _r.empty() if undefined.
  //
  // Dispatch function. To support different types,
  // call _r.unwrap.register
  function wrap(value){
    /*jshint validthis:true*/
    return dispatch.wrap.call(this, value);
  }

  wrap.register = function(fn){
    return dispatch.wrap.register(fn);
  };

  wrap.register(function(value){
    if(_.isString(value)){
      value = [value];
    } else if(value === null || value === undef){
      value = empty();
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
  function unwrap(value){
    return dispatch.unwrap(value);
  }

  unwrap.register = function(fn){
    return dispatch.unwrap.register(fn);
  };

  unwrap.register(function(value){
    if(as(value)){
      return value.value();
    }
    return tr.unreduced(value);
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
  function iterator(obj){
    return dispatch.iterator(obj);
  }

  iterator.register = function(fn){
    return dispatch.iterator.register(fn);
  };

  iterator.register(tr.iterator);

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
  function iteratee(value){
    return dispatch.iteratee(value);
  }

  iteratee.register = function(fn){
    return dispatch.iteratee.register(fn);
  };

  iteratee.register(function(value){
    if(as(value)){
      return _riteratee(value);
    }
    return _.iteratee(value);
  });

  function _riteratee(value){
    return function(item){
      return value.withSource(item).value();
    };
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
  function empty(obj){
    return obj === IGNORE ? IGNORE : dispatch.empty(obj);
  }

  empty.register = function(fn){
    return dispatch.empty.register(fn);
  };

  empty.register(function(obj){
    if(obj === undef || _.isArray(obj) || iterator(obj)){
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
  function append(obj, item){
    // valid object and item, dispatch
    return dispatch.append(obj, item);
  }

  append.register = function(fn){
    return dispatch.append.register(fn);
  };

  append.register(function(obj, item){
    if(_.isArray(obj)){
      obj.push(item);
      return obj;
    }

    // just maintain last item
    return item;
  });

  // Reducer that dispatches to empty, unwrap and append
  function Dispatch(){}
  Dispatch.prototype.init = empty;
  Dispatch.prototype.result = unwrap;
  Dispatch.prototype.step = append;

  function dispatchXf(){
    return new Dispatch();
  }
};

},{"transduce":19}],10:[function(require,module,exports){
"use strict";
var transduce = require('transduce'), undef;

module.exports = function(_r){
  _r.generate = generate;

  // Transduces the current chained object by using the chained trasnformation
  // and an iterator created with the callback
  _r.prototype.generate = function(callback, callToInit){
    return this.withSource(generate(callback, callToInit));
  };

  // Creates an (duck typed) iterator that calls the provided next callback repeatedly
  // and uses the return value as the next value of the iterator.
  // Marks iterator as done if the next callback returns undefined (returns nothing)
  // Can be used to as a source obj to reduce, transduce etc
  function generate(callback, callToInit){
    var gen = {};
    gen[transduce.protocols.iterator] = function(){
      var next = callToInit ? callback() : callback;
      return {
        next: function(){
          var value = next();
          return (value === undef) ? {done: true} : {done: false, value: value};
        }
      };
    };
    return gen;
  }
};

},{"transduce":19}],11:[function(require,module,exports){
"use strict";
var math = require('transduce-math'), undef;

module.exports = function(_r){
  // Math Functions
  // --------------------
  _r.mixin({
    max: max,
    min: min
  });

  var iteratee = _r.iteratee,
      resolveSingleValue = _r.resolveSingleValue;

  // Return the maximum element (or element-based computation).
  function max(f) {
    /*jshint validthis:true */
    resolveSingleValue(this);
    return math.max(iteratee(f));
  }

  // Return the minimum element (or element-based computation).
  function min(f) {
    /*jshint validthis:true */
    resolveSingleValue(this);
    return math.min(iteratee(f));
  }
};

},{"transduce-math":15}],12:[function(require,module,exports){
"use strict";
var push = require('transduce-push'),
    undef;

module.exports = function(_r){

  _r.mixin({tap: push.tap});
  _r.asCallback = asCallback;
  _r.asyncCallback = asyncCallback;

  var as = _r.as,
      dispatch = _r.dispatch,
      transducer = _r.transducer;

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
      xf = transducer(xf);
    }

    var reducer;
    if(init !== undef){
      reducer = dispatch();
    }
    return push.asCallback(xf, reducer);
  }

  _r.prototype.asCallback = function(init){
    return asCallback(this, init);
  };

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
      xf = transducer(xf);
    }

    var reducer;
    if(init !== undef){
      reducer = dispatch();
    }
    return push.asyncCallback(xf, continuation, reducer);
  }

  _r.prototype.asyncCallback = function(continuation, init){
    return asyncCallback(this, continuation, init);
  };
};

},{"transduce-push":16}],13:[function(require,module,exports){
"use strict";
var undef,
    string = require('transduce-string');

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
  });

  function join(separator){
    /*jshint validthis:true */
    _r.resolveSingleValue(this);
    return string.join(separator);
  }
};

},{"transduce-string":17}],14:[function(require,module,exports){
"use strict";
var tp = require('transduce-protocol'),
    _slice = Array.prototype.slice;

module.exports = {
  forEach: forEach,
  find: find,
  push: push,
  unshift: unshift,
  every: every,
  some: some,
  contains: contains
};

// Executes f with f(input, idx, result) for forEach item
// passed through transducer without changing the result.
function forEach(f) {
  return function(xf){
    return new ForEach(f, xf);
  };
}
function ForEach(f, xf) {
  this.xf = xf;
  this.f = f;
  this.i = 0;
}
ForEach.prototype.init = function(){
  return this.xf.init();
};
ForEach.prototype.result = function(result){
  return this.xf.result(result);
};
ForEach.prototype.step = function(result, input) {
  this.f(input, this.i++, result);
  return this.xf.step(result, input);
};

// Return the first value which passes a truth test. Aliased as `detect`.
// Stateless transducer
function find(predicate) {
   return function(xf){
     return new Find(predicate, xf);
   };
}
function Find(f, xf) {
  this.xf = xf;
  this.f = f;
}
Find.prototype.init = function(){
  return this.xf.init();
};
Find.prototype.result = function(result){
  return this.xf.result(result);
};
Find.prototype.step = function(result, input) {
  if(this.f(input)){
    result = tp.reduced(this.xf.step(result, input));
  }
  return result;
};

// Adds one or more items to the end of the sequence, like Array.prototype.push.
function push(){
  var toPush = _slice.call(arguments);
  return function(xf){
    return new Push(toPush, xf);
  };
}
function Push(toPush, xf) {
  this.xf = xf;
  this.toPush = toPush;
}
Push.prototype.init = function(){
  return this.xf.init();
};
Push.prototype.result = function(result){
  var idx, toPush = this.toPush, len = toPush.length;
  for(idx = 0; idx < len; idx++){
    result = this.xf.step(result, toPush[idx]);
  }
  return this.xf.result(result);
};
Push.prototype.step = function(result, input){
  return this.xf.step(result, input);
};

// Adds one or more items to the beginning of the sequence, like Array.prototype.unshift.
function unshift(){
  var toUnshift = _slice.call(arguments);
  return function(xf){
    return new Unshift(toUnshift, xf);
  };
}
function Unshift(toUnshift, xf) {
  this.xf = xf;
  this.toUnshift = toUnshift;
}
Unshift.prototype.init = function(){
  return this.xf.init();
};
Unshift.prototype.result = function(result){
  return this.xf.result(result);
};
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
};

// Determine whether all of the elements match a truth test.
// Stateful transducer (found).  Early termination if item
// does not match predicate.
function every(predicate) {
  return function(xf){
    return new Every(predicate, xf);
  };
}
function Every(f, xf) {
  this.xf = xf;
  this.f = f;
  this.found = false;
}
Every.prototype.init = function(){
  return this.xf.init();
};
Every.prototype.result = function(result){
  if(!this.found){
    result = this.xf.step(result, true);
  }
  return this.xf.result(result);
};
Every.prototype.step = function(result, input) {
  if(!this.f(input)){
    this.found = true;
    return tp.reduced(this.xf.step(result, false));
  }
  return result;
};

// Determine if at least one element in the object matches a truth test.
// Aliased as `any`.
// Stateful transducer (found).  Early termination if item matches predicate.
function some(predicate) {
  return function(xf){
    return new Some(predicate, xf);
  };
}
function Some(f, xf) {
  this.xf = xf;
  this.f = f;
  this.found = false;
}
Some.prototype.init = function(){
  return this.xf.init();
};
Some.prototype.result = function(result){
  if(!this.found){
    result = this.xf.step(result, false);
  }
  return this.xf.result(result);
};
Some.prototype.step = function(result, input) {
  if(this.f(input)){
    this.found = true;
    return tp.reduced(this.xf.step(result, true));
  }
  return result;
};

// Determine if contains a given value (using `===`).
// Aliased as `include`.
// Stateful transducer (found). Early termination when item found.
function contains(target) {
  return some(function(x){return x === target; });
}

},{"transduce-protocol":6}],15:[function(require,module,exports){
"use strict";
module.exports = {
  min: min,
  max: max
};

function identity(v){
  return v;
}

// Return the maximum element (or element-based computation).
function max(f) {
  if(!f){
    f = identity;
  }
  return function(xf){
    return new Max(f, xf);
  };
}
function Max(f, xf) {
  this.xf = xf;
  this.f = f;
  this.computedResult = -Infinity;
  this.lastComputed = -Infinity;
}
Max.prototype.init = function(){
  return this.xf.init();
};
Max.prototype.result = function(result){
  result = this.xf.step(result, this.computedResult);
  return this.xf.result(result);
};
Max.prototype.step = function(result, input) {
  var computed = this.f(input);
  if (computed > this.lastComputed ||
      computed === -Infinity && this.computedResult === -Infinity) {
    this.computedResult = input;
    this.lastComputed = computed;
  }
  return result;
};

// Return the minimum element (or element-based computation).
function min(f) {
  if(!f){
    f = identity;
  }
  return function(xf){
    return new Min(f, xf);
  };
}
function Min(f, xf) {
  this.xf = xf;
  this.f = f;
  this.computedResult = Infinity;
  this.lastComputed = Infinity;
}
Min.prototype.init = function(){
  return this.xf.init();
};
Min.prototype.result = function(result){
  result = this.xf.step(result, this.computedResult);
  return this.xf.result(result);
};
Min.prototype.step = function(result, input) {
  var computed = this.f(input);
  if (computed < this.lastComputed ||
      computed === Infinity && this.computedResult === Infinity) {
    this.computedResult = input;
    this.lastComputed = computed;
  }
  return result;
};

},{}],16:[function(require,module,exports){
"use strict";
var tp = require('transduce-protocol'),
    undef;

module.exports = {
  tap: tap,
  asCallback: asCallback,
  asyncCallback: asyncCallback,
  LastValue: LastValue
};

// Reducer that maintains last value
function LastValue(){}
LastValue.prototype.init = function(){};
LastValue.prototype.result = function(val){
  return val;
};
LastValue.prototype.step = function(result, input){
  return input;
};

// Invokes interceptor with each result and input, and then passes through input.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
// Executes interceptor with current result and input
// Stateless transducer
function tap(interceptor) {
 return function(xf){
   return new Tap(interceptor, xf);
 };
}
function Tap(f, xf) {
  this.xf = xf;
  this.f = f;
}
Tap.prototype.init = function(){
  return this.xf.init();
};
Tap.prototype.result = function(result){
  return this.xf.result(result);
};
Tap.prototype.step = function(result, input) {
  this.f(result, input);
  return this.xf.step(result, input);
};

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
  };
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
// If reducer is not defined, maintains last value and does not buffer results.
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
  };
}

},{"transduce-protocol":6}],17:[function(require,module,exports){
"use strict";
var tp = require('transduce-protocol'),
    undef;

module.exports = {
  split: split,
  join: join,
  nonEmpty: nonEmpty,
  lines: function(limit){
    return split('\n', limit);
  },
  chars: function(limit){
    return split('', limit);
  },
  words: function(delimiter, limit) {
    if(delimiter === undef || isNumber(delimiter)){
      limit  = delimiter;
      delimiter = /\s+/;
    }
    return tp.compose(split(delimiter, limit), nonEmpty());
  }
};

function join(separator){
  return function(xf){
    return new Join(separator, xf);
  };
}
function Join(separator, xf){
  this.separator = separator;
  this.xf = xf;
  this.buffer = [];
}
Join.prototype.init = function(){return this.xf.init();};
Join.prototype.step = function(result, input){
  this.buffer.push(input);
  return result;
};
Join.prototype.result = function(result){
  result = this.xf.step(result, this.buffer.join(this.separator));
  return this.xf.result(result);
};

function nonEmpty(){
  return function(xf){
    return new NonEmpty(xf);
  };
}
function NonEmpty(xf){
  this.xf = xf;
}
NonEmpty.prototype.init = function(){return this.xf.init();};
NonEmpty.prototype.step = function(result, input){
  if(isString(input) && input.trim().length){
    result = this.xf.step(result, input);
  }
  return result;
};
NonEmpty.prototype.result = function(result){
  return this.xf.result(result);
};

function split(separator, limit){
  if(isRegExp(separator)){
    separator = cloneRegExp(separator);
  }
  return function(xf){
    return new Split(separator, limit, xf);
  };
}

function Split(separator, limit, xf){
  this.separator = separator;
  this.xf = xf;
  this.next = null;
  this.idx = 0;

  if(limit == undef){
    limit = Infinity;
  }
  this.limit = limit;

  if(!isRegExp(separator) && separator !== ''){
    this.spliterate = spliterateString;
  } else if(isRegExp(separator)){
    this.spliterate = spliterateRegExp;
  } else {
    this.spliterate = spliterateChars;
  }
}
Split.prototype.init = function(){return this.xf.init();};
Split.prototype.step = function(result, input){
  if(input === null || input === undef){
    return result;
  }

  var next = this.next,
      str = (next && next.value || '')+input,
      chunk = this.spliterate(str, this.separator);

  for(;;){
    this.next = next = chunk();
    if(next.done){
      break;
    }

    result = this.xf.step(result, next.value);

    if(++this.idx >= this.limit){
      this.next = null;
      result = tp.reduced(result);
      break;
    }
  }
  return result;
};
Split.prototype.result = function(result){
  var next = this.next;
  if(next && next.value !== null && next.value !== undef){
    result = this.xf.step(result, next.value);
  }
  return this.xf.result(result);
};

function spliterateChars(str){
  var i = 0,  len = str.length,
      result = {done: false};
  return function(){
    result.value = str[i++];
    if(i >= len){
      result.done = true;
    }
    return result;
  };
}

function spliterateString(str, separator){
  var first, second, sepLen = separator.length,
      result = {done: false};
  return function(){
    first = (first === undef) ? 0 : second + sepLen;
    second = str.indexOf(separator, first);

    if(second < 0){
      result.done = true;
      second = undef;
    }
    result.value = str.substring(first, second);
    return result;
  };
}

function spliterateRegExp(str, pattern){
  var index, match,
      result = {done: false};
  pattern = cloneRegExp(pattern);
  return function(){
    match = pattern.exec(str);
    if(match){
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

// From underscore.js
var toString = Object.prototype.toString;
function isString(value){
  return toString.call(value) === '[object String]';
}
function isRegExp(value){
  return toString.call(value) === '[object RegExp]';
}

function isNumber(value){
  return toString.call(value) === '[object Number]';
}

function cloneRegExp(regexp){
  // From https://github.com/aheckmann/regexp-clone
  var flags = [];
  if (regexp.global) flags.push('g');
  if (regexp.multiline) flags.push('m');
  if (regexp.ignoreCase) flags.push('i');
  return new RegExp(regexp.source, flags.join(''));
}

},{"transduce-protocol":6}],18:[function(require,module,exports){
"use strict";
/*global transducers */
var libs = ['transducers-js', 'transducers.js'];

function load(lib){
  return transducers;
}

module.exports = {
  load: load,
  libs: libs
};

},{}],19:[function(require,module,exports){
"use strict";
var protocol = require('transduce-protocol'),
    lib = require('./load'),
    loadLib = lib.load,
    libs = lib.libs,
    transformer = protocol.transformer,
    transduceToArray = protocol.transduceToArray,
    implFns = [
      'into', 'transduce', 'reduce', 'toArray',
      'map', 'filter', 'remove', 'take', 'takeWhile',
      'drop', 'dropWhile', 'cat', 'mapcat', 'partitionAll', 'partitionBy'],
    protocolFns = [
      'protocols', 'compose',
      'isIterable', 'isIterator', 'iterable', 'iterator',
      'isTransformer', 'transformer',
      'isReduced', 'reduced', 'unreduced', 'deref',
      'isFunction', 'isArray', 'arrayPush', 'identity'];

function exportImpl(impl, overrides){
  var i = 0, len = implFns.length, fn;
  for(; i < len; i++){
    fn = implFns[i];
    exports[fn] = ((fn in overrides) ? overrides : impl)[fn];
  }
  exports.toArray = transduceToArray(exports);
}

function exportProtocol(){
  var i = 0, len = protocolFns.length, fn;
  for(; i < len; i++){
    fn = protocolFns[i];
    exports[fn] = protocol[fn];
  }
}

function load(){
  exportProtocol();
  var i = 0, len = libs.length;
  for(; i < len; i++){
    try {
      if(loader[libs[i]]()){
        return;
      }
    } catch(e){}
  }
  throw new Error('Must install one of: '+libs.join());
}

var undef, loader = {
  'transducers-js': function(){
    var impl = loadLib('transducers-js'),
        // if no Wrap exported, probably transducers.js
        loaded =  !!impl.Wrap;
    if(loaded){
      exportImpl(impl, {});
    }
    return loaded;
  },
  'transducers.js': function(){
    //adapt methods to match transducers-js API
    var impl = loadLib('transducers.js');

    exportImpl(impl, {
      transduce: function(xf, f, init, coll){
        f = transformer(f);
        return impl.transduce(coll, xf, f, init);
      },
      reduce: function(f, init, coll){
        f = transformer(f);
        return impl.reduce(coll, f, init);
      },
      partitionAll: impl.partition
    });
    return true;
  }
};

load();

},{"./load":18,"transduce-protocol":6}],20:[function(require,module,exports){
"use strict";
var undef;

var _r = function(obj, transform) {
  if (_r.as(obj)){
    if(transform === undef){
      return obj;
    }
    var wrappedFns = _.clone(obj._wrappedFns);
    wrappedFns.push(transform);
    var copy = new _r(obj._wrapped, wrappedFns);
    copy._opts = _.clone(obj._opts);
    return copy;
  }

  if (!(_r.as(this))) return new _r(obj, transform);

  if(_r.as(transform)){
    this._opts = _.clone(transform._opts);
    transform = transform._wrappedFns;
  } else {
    this._opts = {};
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

_r.VERSION = '0.1.3';

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
}
module.exports = _r;

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

// import libraries
_.each([
  require('./lib/dispatch'),
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

},{"./lib/array":7,"./lib/base":8,"./lib/dispatch":9,"./lib/iterator":10,"./lib/math":11,"./lib/push":12,"./lib/string":13,"underscore":4}],21:[function(require,module,exports){
"use strict";
var _r = require('underscore-transducer');
module.exports = _r;

_r.UNDERARM_VERSION = '0.1.1';

var _ = _r._;

// import libraries
_.each([
  require('./lib/async'),
  require('./lib/sample')],
  function(lib){
    // only import if included in build
    if(_.isFunction(lib)){
      lib(_r);
    }
  });

},{"./lib/async":1,"./lib/sample":2,"underscore-transducer":20}]},{},[21]);
