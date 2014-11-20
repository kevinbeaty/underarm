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
    if(value && typeof value.then === 'function'){
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

},{"any-promise":2,"transduce-async":3}],2:[function(require,module,exports){
module.exports = Promise;

},{}],3:[function(require,module,exports){
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

},{"any-promise":2,"transduce-protocol":5}],4:[function(require,module,exports){
"use strict";
/* global Symbol */
var util = require('transduce-util'),
    symbol = util.protocols.iterator,
    isFunction = util.isFunction,
    isArray = util.isArray,
    undef;

module.exports = {
  symbol: symbol,
  isIterable: isIterable,
  isIterator: isIterator,
  iterable: iterable,
  iterator: iterator,
  toArray: toArray,
  isFunction: isFunction,
  isArray: isArray
};

function toArray(iter){
  iter = iterator(iter);
  var next = iter.next(),
      arr = [];
  while(!next.done){
    arr.push(next.value);
    next = iter.next();
  }
  return arr;
}

function isIterable(value){
  return (value[symbol] !== undef);
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
    it = it[symbol]();
  } else if(isFunction(value.next)){
    // handle non-well-formed iterators that only have a next method
    it = value;
  }
  return it;
}

// Wrap an Array into an iterable
function ArrayIterable(arr){
  this.arr = arr;
}
ArrayIterable.prototype[symbol] = function(){
  var arr = this.arr,
      idx = 0;
  return {
    next: function(){
      if(idx >= arr.length){
        return {done: true};
      }

      return {done: false, value: arr[idx++]};
    }
  };
};

// Wrap an function into an iterable that calls function on every next
function FunctionIterable(fn){
  this.fn = fn;
}
FunctionIterable.prototype[symbol] = function(){
  var fn = this.fn;
  return {
    next: function(){
      return {done: false, value: fn()};
    }
  };
};

},{"transduce-util":6}],5:[function(require,module,exports){
"use strict";
/* global Symbol */
var undef,
    util = require('transduce-util'),
    iter = require('iterator-protocol'),
    slice = Array.prototype.slice,
    protocols = util.protocols,
    symTransformer = protocols.transformer,
    isFunction = util.isFunction,
    isArray = util.isArray,
    identity = util.identity,
    push = util.arrayPush;


module.exports = {
  protocols: protocols,
  isIterable: iter.isIterable,
  isIterator: iter.isIterator,
  iterable: iter.iterable,
  iterator: iter.iterator,
  isTransformer: isTransformer,
  transformer: transformer,
  isReduced: util.isReduced,
  reduced: util.reduced,
  unreduced: util.unreduced,
  deref: util.unreduced,
  compose: util.compose,
  isFunction: isFunction,
  isArray: isArray,
  toArray: iter.toArray,
  arrayPush: push,
  identity: identity,
  transduceToArray: transduceToArray
};

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

function transduceToArray(impl){
  return function(xf, coll){
    var init = [];
    if(coll === undef){
      return impl.reduce(push, init, xf);
    }
    return impl.transduce(xf, push, init, coll);
  };
}

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

},{"iterator-protocol":4,"transduce-util":6}],6:[function(require,module,exports){
"use strict";
var undef,
    Arr = Array,
    toString = Object.prototype.toString,
    isArray = (isFunction(Arr.isArray) ? Arr.isArray : predicateToString('Array')),
    /* global Symbol */
    symbolExists = typeof Symbol !== 'undefined',
    symIterator = symbolExists ? Symbol.iterator : '@@iterator',
    /* jshint newcap:false */
    symTransformer = symbolExists ? Symbol('transformer') : '@@transformer',
    protocols = {
      iterator: symIterator,
      transformer: symTransformer
    };

module.exports = {
  protocols: protocols,
  isFunction: isFunction,
  isArray: isArray,
  isString: predicateToString('String'),
  isRegExp: predicateToString('RegExp'),
  isNumber: predicateToString('Number'),
  isUndefined: isUndefined,
  isReduced: isReduced,
  reduced: reduced,
  unreduced: unreduced,
  deref: unreduced,
  compose: compose,
  arrayPush: push,
  identity: identity
};

function isFunction(value){
  return typeof value === 'function';
}

function isUndefined(value){
  return value === undef;
}

function predicateToString(type){
  var str = '[object '+type+']';
  return function(value){
    return toString.call(value) === str;
  };
}

function isReduced(value){
  return !!(value instanceof Reduced || value && value.__transducers_reduced__);
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
  this.__transducers_reduced__ = true;
}

function identity(result){
  return result;
}

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

function push(result, input){
  result.push(input);
  return result;
}

},{}],7:[function(require,module,exports){
"use strict";
var tr = require('transduce'), undef;

var _r = function(obj, transform) {
  var _ = _r._;
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

  if(tr.isFunction(transform)){
    this._wrappedFns = [transform];
  } else if(tr.isArray(transform)){
    this._wrappedFns = transform;
  } else {
    this._wrappedFns = [];
  }

  this._wrapped = _r.wrap.call(this, obj);
};

_r.VERSION = '0.2.1';

// Export for browser or Common-JS
// Save the previous value of the `_r` variable.
var previous_r, root;
if(typeof window !== 'undefined'){
  /*global window*/
  var root = window;
  previous_r = root._r;
  root._r = _r;
  _r._ = root._;
} else {
  root = {};
}
module.exports = _r;

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
  var name, fn;
  for(name in obj){
    fn = obj[name];
    if(typeof fn === 'function'){
      _r[name] = fn;
      _r.prototype[name] = _method(fn); 
    }
  }
};

function _method(func){
  return function() {
    var method = func.apply(this, arguments);
    return _r(this, method);
  };
}

},{"transduce":13}],8:[function(require,module,exports){
"use strict";
var tr = require('transduce'),
    dispatcher = require('redispatch'),
    undef;

module.exports = function(_r){
  var _ = _r._,
      as = _r.as,
      // sentinel to ignore wrapped objects (maintain only last item)
      IGNORE = _r.IGNORE = {};

  // Transducer Functions
  // --------------------
  var value = _r.value = dispatcher(),
      wrap = _r.wrap = dispatcher(),
      unwrap = _r.unwrap = dispatcher(),
      empty = _r.empty = dispatcher(),
      append = _r.append = dispatcher(),
      reduce = _r.reduce = dispatcher(),
      transduce = _r.transduce = dispatcher(),
      into = _r.into = dispatcher(),
      transducer = _r.transducer = dispatcher(),
      iterator = _r.iterator = dispatcher(),
      sequence = _r.sequence = dispatcher(),
      iteratee = _r.iteratee = dispatcher();
  _r.resolveSingleValue = resolveSingleValue;
  _r.resolveMultipleValues = resolveMultipleValues;
  _r.reduced = tr.reduced;
  _r.isReduced = tr.isReduced;
  _r.foldl = reduce;
  _r.inject = reduce;
  _r.deref = unwrap;
  _r.conj = append;
  _r.conjoin = append;
  _r.dispatch = dispatch;

  // Dispatchers
  // -----------

  // Resolves the value of the wrapped object, similar to underscore.
  // Returns an array, or single value (to match underscore API)
  // depending on whether the chained transformation resolves to single value.
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
    if(as(self)){
      self._opts.resolveSingleValue = single;
    }
  }

  // Composes and returns the underlying wrapped functions for give chained object
  transducer.register(function(self){
    var fns = self._wrappedFns;
    return fns.length ? tr.compose.apply(null, fns) : tr.identity;
  });

  _r.prototype.transducer = _r.prototype.compose = function() {
    return transducer(this);
  };

  reduce.register(function(xf, init, coll) {
    if(as(xf)){
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

  transduce.register(function(xf, f, init, coll){
    if(as(xf)){
      xf = transducer(xf);
    }

    return unwrap(tr.transduce(xf, f, init, coll));
  });

  // Calls transduce using the chained transformation
  _r.prototype.transduce = function(f, init, coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return transduce(this, f, init, coll);
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
  // Default returns [] if isArray or undefined, {} if _.isObject
  // and an internal sentinel to ignore otherwise
  //
  // Dispatch function. To support different types
  // call _r.empty.register and supply function that returns
  // an empty object after checking the input using appropriate
  // predicates. Return undefined if not supported, so other
  // dispatched functions can be checked
  empty.register(function(obj){
    if(obj === undef || tr.isArray(obj) || iterator(obj)){
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
  append.register(function(obj, item){
    if(tr.isArray(obj)){
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

  function dispatch(){
    return new Dispatch();
  }
};

},{"redispatch":11,"transduce":13}],9:[function(require,module,exports){
"use strict";
var undef;
module.exports = function(libs, _r){
  var i = 0, len = libs.length, lib;
  if(_r === undef){
    _r = require('./base');
  }

  for(; i < len; i++){
    lib = libs[i];
    // only import if included in build
    if(typeof lib === 'function'){
      lib(_r);
    }
  }

  return _r;
};

},{"./base":7}],10:[function(require,module,exports){
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
    var isFunc = transduce.isFunction(method);
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

},{"transduce":13}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./load":12,"transduce-protocol":5}],14:[function(require,module,exports){
module.exports = require('./lib/load')([
  require('./lib/dispatch'),
  require('./lib/transduce')]);

},{"./lib/dispatch":8,"./lib/load":9,"./lib/transduce":10}],15:[function(require,module,exports){
module.exports = require('underscore-transducer/lib/load')([
  require('./lib/async')],
  require('underscore-transducer/underscore-transducer.nolodash.base'));

},{"./lib/async":1,"underscore-transducer/lib/load":9,"underscore-transducer/underscore-transducer.nolodash.base":14}]},{},[15]);
