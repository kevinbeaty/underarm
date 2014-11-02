(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"transduce":6}],2:[function(require,module,exports){
"use strict";
var transduce = require('transduce'), undef;

module.exports = function(_r){
  var _ = _r._,
      IGNORE = _r.IGNORE,
      as = _r.as;

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
        ['iterator', 'iteratee', 'empty', 'append', 'wrap', 'unwrap'],
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
  function iterator(obj){
    return dispatch.iterator(obj);
  }

  iterator.register = function(fn){
    return dispatch.iterator.register(fn);
  };

  iterator.register(transduce.iterator);

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

},{"transduce":6}],3:[function(require,module,exports){
"use strict";
var tr = require('transduce'), undef;

module.exports = function(_r){
  // Transducer Functions
  // --------------------
  var as = _r.as,
      _ = _r._,
      empty = _r.empty,
      append = _r.append;

  _r.reduced = tr.reduced;
  _r.isReduced = tr.isReduced;
  _r.reduce = reduce;
  _r.foldl = reduce;
  _r.inject = reduce;
  _r.transduce = transduce;
  _r.into = into;

  function reduce(xf, init, coll) {
    if (coll === null || coll === undef) coll = empty(coll);
    return tr.reduce(xf, init, coll);
  }

  function transduce(xf, f, init, coll){
    if(_r.as(xf)){
      xf = xf.compose();
    }

    return _r.unwrap(tr.transduce(xf, f, init, coll));
  }

  // Calls transduce using the chained transformation
  _r.prototype.transduce = function(f, init, coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return transduce(this, f, init, coll);
  };

  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  function into(to, xf, from){
    if(from === undef){
      from = xf;
      xf = undef;
    }

    if(from === undef){
      from = empty();
    }

    if(as(xf)){
      xf = xf.compose();
    }

    if(xf === undef){
      return reduce(append, to, from);
    }

    return transduce(xf, append, to, from);
  }

  // Calls into using the chained transformation
  _r.prototype.into = function(to, from){
    if(from === undef){
      from = this._wrapped;
    }

    if(from === undef){
      from = empty();
    }

    if(to === undef){
      to = empty(from);
    }

    return into(to, this, from);
  };

  // Returns a new collection of the empty value of the from collection
  _r.sequence = function(xf, from){
    return into(empty(from), xf, from);
  };

  // calls sequence with chained transformation and optional wrapped object
  _r.prototype.sequence = function(from){
    return this.into(empty(from), from);
  };
};

},{"transduce":6}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
"use strict";
/* global Symbol */
var undef,
    symbolExists = typeof Symbol !== 'undefined',
    /* jshint newcap:false */
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
  compose: compose,
  isFunction: isFunction,
  isArray: (isFunction(Array.isArray) ? Array.isArray : isArray)
};

var toString = Object.prototype.toString;

function isFunction(value){
  return typeof value === 'function';
}

function isArray(value){
  return toString.call(value) === '[object Array]';
}

function isIterator(value){
  return (value[protocols.iterator] !== undef) ||
    (isFunction(value.next));
}

function iterator(value){
  var it;
  if(value[protocols.iterator]){
    it = value[protocols.iterator]();
  } else if(isFunction(value.next)){
    it = value;
  } else if(isArray(value)){
    it = new ArrayIterator(value);
  }
  return it;
}

function isTransformer(value){
  return (value[protocols.transformer] !== undef) ||
    (isFunction(value.init) && isFunction(value.step) && isFunction(value.result));
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
      xf = fns[i](xf);
    }
    return xf;
  };
}

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
FunctionTransformer.prototype.result = function(result){
  return result;
};

},{}],6:[function(require,module,exports){
"use strict";
var protocol = require('transduce-protocol'),
    implFns = [
      'into', 'transduce', 'reduce', 'map', 'filter', 'remove', 'take', 'takeWhile',
      'drop', 'dropWhile', 'cat', 'mapcat', 'partitionAll', 'partitionBy'],
    protocolFns = [
      'protocols', 'isIterator', 'iterator', 'isTransformer', 'transformer',
      'isReduced', 'reduced', 'unreduced', 'compose'];

function exportImpl(impl, overrides){
  var i = 0, len = implFns.length, fn;
  for(; i < len; i++){
    fn = implFns[i];
    exports[fn] = ((fn in overrides) ? overrides : impl)[fn];
  }
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
  var libs = ['transducers-js', 'transducers.js'], impl;
  if(typeof process !== 'undefined' && process.env && process.env.TRANSDUCE_IMPL){
    libs = [process.env.TRANSDUCE_IMPL];
  }
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
    var impl = loadFromBrowser(),
        loaded = true;
    if(impl){
      // if no Wrap exported, probably transducers.js
      loaded = !!impl.Wrap;
    } else {
      impl = require('transducers-js');
    }
    if(loaded){
      exportImpl(impl, {});
    }
    return loaded;
  },
  'transducers.js': function(){
    //adapt methods to match transducers-js API
    var impl = loadFromBrowser();
    if(!impl){
      impl = require('transducers.js');
    }
    exportImpl(impl, {
      transduce: function(xf, f, init, coll){
        f = protocol.transformer(f);
        return impl.transduce(coll, xf, f, init);
      },
      reduce: function(f, init, coll){
        f = protocol.transformer(f);
        return impl.reduce(coll, f, init);
      },
      partitionAll: impl.partition
    });
    return true;
  }
};

function loadFromBrowser(){
  if(typeof window !== 'undefined'){
    /* global window */
    return window.transducers;
  }
}

load();

},{"transduce-protocol":5,"transducers-js":4,"transducers.js":4}],7:[function(require,module,exports){
"use strict";
var undef;

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
_r.VERSION = '0.1.1';

// sentinel to ignore wrapped objects (maintain only last item)
var IGNORE = _r.IGNORE = {};

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
  module.exports = _r;
}

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

// Composes and returns the underlying wrapped functions
_r.prototype.transducer = _r.prototype.compose = function() {
  var fns = this._wrappedFns;
  return fns.length ? _.compose.apply(null, fns) : _.identity;
};


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

// Helper to mark transducer to expect single value when
// resolving. Only valid when chaining, but this should be passed
// when called as a function
_r.resolveSingleValue = function(self){
  resolveSingleValue(self, true);
};

// Helper to mark transducer to expect multiple values when
// resolving. Only valid when chaining, but this should be passed
// when called as a function.
_r.resolveMultipleValues = function(self){
  resolveSingleValue(self, false);
};

function resolveSingleValue(self, single){
  if(_r.as(self)){
    self._resolveSingleValue = single;
  }
}

// Resolves the value of the wrapped object, similar to underscore.
// Returns an array, or single value (to match underscore API)
// depending on whether the chained transformation resolves to single value.
_r.prototype.value = function(){
  if(!this._resolveSingleValue){
    return this.into();
  }

  var ret =  this.into(IGNORE);
  return ret === IGNORE ? undef : ret;
};

// import libraries
_.each([
  require('./lib/dispatch'),
  require('./lib/transduce'),
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

},{"./lib/array":4,"./lib/base":1,"./lib/dispatch":2,"./lib/iterator":4,"./lib/math":4,"./lib/push":4,"./lib/string":4,"./lib/transduce":3,"underscore":4}]},{},[7]);
