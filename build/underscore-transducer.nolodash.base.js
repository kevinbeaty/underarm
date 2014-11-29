(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var tr = require('transduce'),
    merge = tr.objectMerge,
    undef;

var _r = function(obj, transform) {
  if (_r.as(obj)){
    if(transform === undef){
      return obj;
    }
    var wrappedFns = obj._wrappedFns.slice();
    wrappedFns.push(transform);
    var copy = new _r(obj._wrapped, wrappedFns);
    copy._opts = merge({}, obj._opts);
    return copy;
  }

  if (!(_r.as(this))) return new _r(obj, transform);

  if(_r.as(transform)){
    this._opts = merge({}, transform._opts);
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

_r.VERSION = '0.3.0';

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

},{"transduce":27}],2:[function(require,module,exports){
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
    if(tr.isString(value)){
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

},{"redispatch":5,"transduce":27}],3:[function(require,module,exports){
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

},{"./base":1}],4:[function(require,module,exports){
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

},{"transduce":27}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";
module.exports = compose;
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

},{}],7:[function(require,module,exports){
"use strict";

module.exports = {
  isReduced: isReduced,
  reduced: reduced,
  unreduced: unreduced,
  deref: unreduced,
};

function isReduced(value){
  return !!(value instanceof Reduced || value && value.__transducers_reduced__);
}

function reduced(value, force){
  if(force || !isReduced(value)){
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

},{}],8:[function(require,module,exports){
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
  identity: identity,
  arrayPush: push,
  objectMerge: merge,
  stringAppend: append
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

function identity(result){
  return result;
}

function push(result, input){
  result.push(input);
  return result;
}

function merge(result, input){
  if(isArray(input) && input.length === 2){
    result[input[0]] = input[1];
  } else {
    var prop;
    for(prop in input){
      if(input.hasOwnProperty(prop)){
        result[prop] = input[prop];
      }
    }
  }
  return result;
}

function append(result, input){
  return result + input;
}

},{}],9:[function(require,module,exports){
"use strict";
/* global Symbol */
var util = require('transduce-util'),
    symbol = util.protocols.iterator,
    isFunction = util.isFunction,
    keys = Object.keys || _keys,
    undef;

module.exports = {
  symbol: symbol,
  isIterable: isIterable,
  isIterator: isIterator,
  iterable: iterable,
  iterator: iterator,
  toArray: toArray
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
  } else if(util.isArray(value) || util.isString(value)){
    it = new ArrayIterable(value);
  } else if(isFunction(value)){
    it = new FunctionIterable(value);
  } else {
    it = new ObjectIterable(value);
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

// Wrap an Object into an iterable. iterates [key, val]
function ObjectIterable(obj){
  this.obj = obj;
  this.keys = keys(obj);
}
ObjectIterable.prototype[symbol] = function(){
  var obj = this.obj,
      keys = this.keys,
      idx = 0;
  return {
    next: function(){
      if(idx >= keys.length){
        return {done: true};
      }
      var key = keys[idx++];
      return {done: false, value: [key, obj[key]]};
    }
  };
};

function _keys(obj){
  var prop, keys = [];
  for(prop in obj){
    if(obj.hasOwnProperty(prop)){
      keys.push(prop);
    }
  }
  return keys;
}

},{"transduce-util":8}],10:[function(require,module,exports){
"use strict";

var tp = require('transduce-reduced'),
    reduce = require('transduce-reduce');

module.exports = cat;
function cat(xf){
  return new Cat(xf);
}
function Cat(xf){
  this.xf = new PreserveReduced(xf);
}
Cat.prototype.init = function(){
  return this.xf.init();
};
Cat.prototype.result = function(value){
  return this.xf.result(value);
};
Cat.prototype.step = function(value, item){
  return reduce(this.xf, value, item);
};

function PreserveReduced(xf){
  this.xf = xf;
}
PreserveReduced.prototype.init = function(){
  return this.xf.init();
};
PreserveReduced.prototype.result = function(value){
  return this.xf.result(value);
};
PreserveReduced.prototype.step = function(value, item){
  value = this.xf.step(value, item);
  if(tp.isReduced(value)){
    value = tp.reduced(value, true);
  }
  return value;
};

},{"transduce-reduce":19,"transduce-reduced":7}],11:[function(require,module,exports){
"use strict";

module.exports = drop;
function drop(n){
  return function(xf){
    return new Drop(n, xf);
  };
}
function Drop(n, xf){
  this.xf = xf;
  this.n = n;
}
Drop.prototype.init = function(){
  return this.xf.init();
};
Drop.prototype.result = function(value){
  return this.xf.result(value);
};
Drop.prototype.step = function(value, item){
  if(--this.n < 0){
    value = this.xf.step(value, item);
  }
  return value;
};

},{}],12:[function(require,module,exports){
"use strict";
var undef;

module.exports = dropWhile;
function dropWhile(p){
  return function(xf){
    return new DropWhile(p, xf);
  };
}
function DropWhile(p, xf){
  this.xf = xf;
  this.p = p;
}
DropWhile.prototype.init = function(){
  return this.xf.init();
};
DropWhile.prototype.result = function(value){
  return this.xf.result(value);
};
DropWhile.prototype.step = function(value, item){
  if(this.p){
    if(this.p(item)){
      return value;
    }
    this.p = undef;
  }
  return this.xf.step(value, item);
};

},{}],13:[function(require,module,exports){
"use strict";
module.exports = filter;

function filter(predicate) {
  return function(xf){
    return new Filter(predicate, xf);
  };
}
function Filter(f, xf) {
  this.xf = xf;
  this.f = f;
}
Filter.prototype.init = function(){
  return this.xf.init();
};
Filter.prototype.result = function(result){
  return this.xf.result(result);
};
Filter.prototype.step = function(result, input) {
  if(this.f(input)){
    result = this.xf.step(result, input);
  }
  return result;
};

},{}],14:[function(require,module,exports){
"use strict";
var transduce = require('transduce-transduce');

module.exports = into;
function into(to, xf, from){
  return transduce(xf, to, to, from);
}

},{"transduce-transduce":25}],15:[function(require,module,exports){
"use strict";
module.exports = map;
function map(callback) {
  return function(xf){
    return new Map(callback, xf);
  };
}
function Map(f, xf) {
  this.xf = xf;
  this.f = f;
}
Map.prototype.init = function(){
  return this.xf.init();
};
Map.prototype.result = function(result){
  return this.xf.result(result);
};
Map.prototype.step = function(result, input) {
  return this.xf.step(result, this.f(input));
};

},{}],16:[function(require,module,exports){
"use strict";
var compose = require('transduce-compose'),
    map = require('transduce-map'),
    cat = require('transduce-cat');
module.exports = mapcat;
function mapcat(callback) {
  return compose(map(callback), cat);
}

},{"transduce-cat":10,"transduce-compose":6,"transduce-map":15}],17:[function(require,module,exports){
"use strict";
module.exports = partitionAll;
function partitionAll(n) {
  return function(xf){
    return new PartitionAll(n, xf);
  };
}
function PartitionAll(n, xf) {
  this.xf = xf;
  this.n = n;
  this.inputs = [];
}
PartitionAll.prototype.init = function(){
  return this.xf.init();
};
PartitionAll.prototype.result = function(result){
  var ins = this.inputs;
  if(ins.length){
    this.inputs = [];
    result = this.xf.step(result, ins);
  }
  return this.xf.result(result);
};
PartitionAll.prototype.step = function(result, input) {
  var ins = this.inputs,
      n = this.n;
  ins.push(input);
  if(n === ins.length){
    this.inputs = [];
    result = this.xf.step(result, ins);
  }
  return result;
};

},{}],18:[function(require,module,exports){
"use strict";
var tp = require('transduce-reduced'),
    undef;

module.exports = partitionBy;
function partitionBy(f) {
  return function(xf){
    return new PartitionBy(f, xf);
  };
}
function PartitionBy(f, xf) {
  this.xf = xf;
  this.f = f;
}
PartitionBy.prototype.init = function(){
  return this.xf.init();
};
PartitionBy.prototype.result = function(result){
  var ins = this.inputs;
  if(ins.length){
    this.inputs = [];
    result = this.xf.step(result, ins);
  }
  return this.xf.result(result);
};
PartitionBy.prototype.step = function(result, input) {
  var ins = this.inputs,
      curr = this.f(input),
      prev = this.prev;
  this.prev = curr;

  if(ins === undef){
    this.inputs = [input];
  } else if(prev === curr){
    ins.push(input);
  } else {
    this.inputs = [];
    result = this.xf.step(result, ins);
    if(!tp.isReduced(result)){
      this.inputs.push(input);
    }
  }
  return result;
};

},{"transduce-reduced":7}],19:[function(require,module,exports){
"use strict";
var iter = require('iterator-protocol'),
    trans = require('transformer-protocol'),
    red = require('transduce-reduced'),
    util = require('transduce-util'),
    isReduced = red.isReduced,
    deref = red.deref,
    transformer = trans.transformer,
    iterator = iter.iterator,
    isArray = util.isArray,
    undef;
module.exports = reduce;

function reduce(xf, init, coll){
  var iter = iterator(coll);
  xf = transformer(xf);
  if(isArray(coll)){
    return arrayReduce(xf, init, coll);
  }
  return iteratorReduce(xf, init, coll);
}

function arrayReduce(xf, init, arr){
  var value = init,
      i = 0,
      len = arr.length;
  for(; i < len; i++){
    value = xf.step(value, arr[i]);
    if(isReduced(value)){
      value = deref(value);
      break;
    }
  }
  return xf.result(value);
}

function iteratorReduce(xf, init, iter){
  var value = init, next;
  iter = iterator(iter);
  while(true){
    next = iter.next();
    if(next.done){
      break;
    }

    value = xf.step(value, next.value);
    if(isReduced(value)){
      value = deref(value);
      break;
    }
  }
  return xf.result(value);
}

},{"iterator-protocol":9,"transduce-reduced":7,"transduce-util":8,"transformer-protocol":26}],20:[function(require,module,exports){
"use strict";
var filter = require('transduce-filter');

module.exports = remove;
function remove(p){
  return filter(function(x){
    return !p(x);
  });
}


},{"transduce-filter":13}],21:[function(require,module,exports){
"use strict";

var tp = require('transduce-reduced');

module.exports = take;
function take(n){
  return function(xf){
    return new Take(n, xf);
  };
}
function Take(n, xf){
  this.xf = xf;
  this.n = n;
}
Take.prototype.init = function(){
  return this.xf.init();
};
Take.prototype.result = function(value){
  return this.xf.result(value);
};
Take.prototype.step = function(value, item){
  if(this.n-- > 0){
    value = this.xf.step(value, item);
  }
  if(this.n <= 0){
    value = tp.reduced(value);
  }
  return value;
};

},{"transduce-reduced":7}],22:[function(require,module,exports){
"use strict";
var reduced = require('transduce-reduced').reduced;

module.exports = takeWhile;
function takeWhile(p){
  return function(xf){
    return new TakeWhile(p, xf);
  };
}
function TakeWhile(p, xf){
  this.xf = xf;
  this.p = p;
}
TakeWhile.prototype.init = function(){
  return this.xf.init();
};
TakeWhile.prototype.result = function(value){
  return this.xf.result(value);
};
TakeWhile.prototype.step = function(value, item){
  if(this.p(item)){
    value = this.xf.step(value, item);
  } else {
    value = reduced(value);
  }
  return value;
};

},{"transduce-reduced":7}],23:[function(require,module,exports){
"use strict";
var util = require('transduce-util'),
    push = util.arrayPush,
    undef;

module.exports = transduceImplToArray;
function transduceImplToArray(impl){
  return function(xf, coll){
    var init = [];
    if(coll === undef){
      return impl.reduce(push, init, xf);
    }
    return impl.transduce(xf, push, init, coll);
  };
}

},{"transduce-util":8}],24:[function(require,module,exports){
"use strict";
var implToArray = require('transduce-impl-toarray');
module.exports = implToArray({
  transduce: require('transduce-transduce'),
  reduce: require('transduce-reduce')
});

},{"transduce-impl-toarray":23,"transduce-reduce":19,"transduce-transduce":25}],25:[function(require,module,exports){
"use strict";
var tp = require('transformer-protocol'),
    reduce = require('transduce-reduce'),
    transformer = tp.transformer;

module.exports = transduce;
function transduce(xf, f, init, coll){
  f = transformer(f);
  return reduce(xf(f), init, coll);
}

},{"transduce-reduce":19,"transformer-protocol":26}],26:[function(require,module,exports){
"use strict";
/* global Symbol */
var undef,
    util = require('transduce-util'),
    slice = Array.prototype.slice,
    symTransformer = util.protocols.transformer,
    isFunction = util.isFunction,
    identity = util.identity,
    merge = util.objectMerge;


module.exports = {
  symbol: symTransformer,
  isTransformer: isTransformer,
  transformer: transformer
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
  } else if(util.isArray(value)){
    xf = new ArrayTransformer(value);
  } else if(util.isString(value)){
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
function ArrayTransformer(arr){
  this.arrDefault = arr === undef ? [] : arr;
}
ArrayTransformer.prototype.init = function(){
  return slice.call(this.arrDefault);
};
ArrayTransformer.prototype.step = util.arrayPush;
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

// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function StringTransformer(str){
  this.strDefault = str === undef ? '' : str;
}
StringTransformer.prototype.init = function(){
  return this.strDefault;
};
StringTransformer.prototype.step = util.stringAppend;
StringTransformer.prototype.result = identity;

// Merges value into object, using optional constructor arg as default, or {} if not provided
// init will clone the default
// step will merge input into object and return result
// result is identity
function ObjectTransformer(obj){
  this.objDefault = obj === undef ? {} : merge({}, obj);
}
ObjectTransformer.prototype.init = function(){
  return merge({}, this.objDefault);
};
ObjectTransformer.prototype.step = merge;
ObjectTransformer.prototype.result = identity;

},{"transduce-util":8}],27:[function(require,module,exports){
"use strict";
var util = require('transduce-util'),
    compose = require('transduce-compose'),
    reduced = require('transduce-reduced'),
    iter = require('iterator-protocol'),
    transformer = require('transformer-protocol');

module.exports = {
  reduce: require('transduce-reduce'),
  transduce: require('transduce-transduce'),
  into: require('transduce-into'),
  toArray: require('transduce-toarray'),
  map: require('transduce-map'),
  filter: require('transduce-filter'),
  remove: require('transduce-remove'),
  take: require('transduce-take'),
  takeWhile: require('transduce-takewhile'),
  drop: require('transduce-drop'),
  dropWhile: require('transduce-dropwhile'),
  cat: require('transduce-cat'),
  mapcat: require('transduce-mapcat'),
  partitionAll: require('transduce-partitionall'),
  partitionBy: require('transduce-partitionby'),
  compose: compose,
  isIterable: iter.isIterable,
  isIterator: iter.isIterator,
  iterable: iter.iterable,
  iterator: iter.iterator,
  isTransformer: transformer.isTransformer,
  transformer: transformer.transformer,
  isReduced: reduced.isReduced,
  reduced: reduced.reduced,
  unreduced: reduced.unreduced,
  deref: reduced.unreduced,
  protocols: util.protocols,
  isFunction: util.isFunction,
  isArray: util.isArray,
  isString: util.isString,
  isRegExp: util.isRegExp,
  isNumber: util.isNumber,
  isUndefined: util.isUndefined,
  arrayPush: util.arrayPush,
  objectMerge: util.objectMerge,
  stringAppend: util.stringAppend,
  identity: util.identity,
};

},{"iterator-protocol":9,"transduce-cat":10,"transduce-compose":6,"transduce-drop":11,"transduce-dropwhile":12,"transduce-filter":13,"transduce-into":14,"transduce-map":15,"transduce-mapcat":16,"transduce-partitionall":17,"transduce-partitionby":18,"transduce-reduce":19,"transduce-reduced":7,"transduce-remove":20,"transduce-take":21,"transduce-takewhile":22,"transduce-toarray":24,"transduce-transduce":25,"transduce-util":8,"transformer-protocol":26}],28:[function(require,module,exports){
module.exports = require('./lib/load')([
  require('./lib/dispatch'),
  require('./lib/transduce')]);

},{"./lib/dispatch":2,"./lib/load":3,"./lib/transduce":4}]},{},[28]);
