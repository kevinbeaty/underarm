(function() {
  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_r` variable.
  var previous_r = root._r;

  // Create quick reference variables for speed access to core prototypes.
  var slice = Array.prototype.slice, undef;

  // Create a safe reference to the Underscore object for use below.
  var _r = function(obj, transform) {
    if (obj instanceof _r){
      if(transform === undef){
        return obj;
      }
      var copy = new _r(obj._wrapped, _r.append(obj._wrappedFns, transform));
      copy._resolveSingleValue = obj._resolveSingleValue;
      return copy;
    }

    if (!(this instanceof _r)) return new _r(obj, transform);

    this._wrapped = obj;

    if(transform instanceof _r){
      transform = transform._wrappedFns;
      this._resolveSingleValue = transform._resolveSingleValue;
    }

    if(_.isFunction(transform)){
      this._wrappedFns = [transform];
    } else if(_.isArray(transform)){
      this._wrappedFns = _.filter(transform, _.isFunction);
    } else {
      this._wrappedFns = [];
    }
  };

  // sentinel to ignore wrapped objects (maintain only last item)
  var IGNORE = {};

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_r` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _r;
    }
    exports._r = _r;
  } else {
    root._r = _r;
  }

  // Current version.
  _r.VERSION = '0.0.5';

  // Reference to Underscore from browser
  var _ = root._;
  if (typeof _ === 'undefined' && typeof require !== 'undefined'){
    _ = require('underscore')._;
  }

  // Collection Functions
  // --------------------

  // Executes the iteratee with iteratee(input, idx, result) for each item
  // passed through transducer without changing the result.
  _r.each = _r.forEach = function(iteratee) {
    return function(step){
      return function(result, input, key){
        if(result === undef) return step();
        if(input === undef) return step(result);
        iteratee(input, key);
        return step(result, input, key);
      }
    }
  };

  // Return the results of applying the iteratee to each element.
  // Stateless transducer
  _r.map = _r.collect = function(iteratee) {
    iteratee = _.iteratee(iteratee);
    return function(step){
      return function(result, input, key){
        return (result === undef)  ? step()
          :    (input === undef)   ? step(result)
          :    step(result, iteratee(input, key), key)
      }
    }
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  // Stateless transducer
  _r.find = _r.detect = function(predicate) {
    predicate = _.iteratee(predicate);
    _r.resolveSingleValue(this);
    return function(step){
      return function(result, input, key){
        return (result === undef)  ? step()
          :    (input === undef)   ? step(result)
          :    (predicate(input, key))   ? _r.reduced(step(result, input, key))
          :    result;
      }
    }
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  // Stateless transducer
  _r.filter = _r.select = function(predicate) {
    predicate = _.iteratee(predicate);
    return function(step){
      return function(result, input, key){
        return (result === undef)  ? step()
          :    (input === undef)   ? step(result)
          :    (predicate(input, key))   ? step(result, input, key)
          :    result;
      }
    }
  };

  // Return all the elements for which a truth test fails.
  // Stateless transducer
  _r.reject = function(predicate) {
    return _r.filter(_.negate(_.iteratee(predicate)));
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  // Stateful transducer (found).  Early termination if item
  // does not match predicate.
  _r.every = _r.all = function(predicate) {
    predicate = _.iteratee(predicate);
    _r.resolveSingleValue(this);
    return function(step){
      var found = false;
      return function(result, input, key){
        if(result === undef) return step();

        if(input === undef){
          if(!found){
            result = step(result, true);
          }
          return step(result);
        }

        if(!predicate(input, key)){
          found = true;
          return _r.reduced(step(result, false));
        }
        return result;
      }
    }
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  // Stateful transducer (found).  Early termination if item matches predicate.
  _r.some = _r.any = function(predicate) {
    predicate = _.iteratee(predicate);
    _r.resolveSingleValue(this);
    return function(step){
      var found = false;
      return function(result, input, key){
        if(result === undef) return step();

        if(input === undef){
          if(!found){
            result = step(result, found);
          }
          return step(result);
        }

        if(predicate(input, key)){
          found = true;
          return _r.reduced(step(result, found, key));
        }
        return result;
      }
    }
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
    iteratee = _.iteratee(iteratee);
    _r.resolveSingleValue(this);

    return function(step){
      var computedResult = -Infinity, lastComputed = -Infinity, computed;
      return function(result, input, key){
        if(result === undef) return step();

        if(input === undef){
          result = step(result, computedResult);
          return step(result);
        }

        computed = iteratee(input, key);
        if (computed > lastComputed || computed === -Infinity && computedResult === -Infinity) {
          computedResult = input;
          lastComputed = computed;
        }
        return result;
      }
    }
  };

  // Return the minimum element (or element-based computation).
  // Stateful transducer (current min value and computed result)
  _r.min = function(iteratee) {
    iteratee = _.iteratee(iteratee);
    _r.resolveSingleValue(this);

    return function(step){
      var computedResult = Infinity, lastComputed = Infinity, computed;
      return function(result, input, key){
        if(result === undef) return step();

        if(input === undef){
          result = step(result, computedResult);
          return step(result);
        }

        computed = iteratee(input, key);
        if (computed < lastComputed || computed === Infinity && computedResult === Infinity) {
          computedResult = input;
          lastComputed = computed;
        }
        return result;
      }
    }
  };

  // Array Functions
  // ---------------

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
    return function(step){
      var count = n;
      return function(result, input, key){
        if(result === undef) return step();
        if(input === undef) return step(result);

        if(count > 0){
          result = step(result, input, key);
        }

        return (!--count) ?  _r.reduced(result) : result;
      }
    }
  };

  // Returns everything but the last entry. Passing **n** will return all the values
  // excluding the last N.
  // Stateful transducer (count and buffer).
  // Note that no items will be sent and all items will be buffered until completion.
  _r.initial = function(n) {
    n = (n === undef) ? 1 : (n > 0) ? n : 0;
    return function(step){
      var count = 0, buffer = [], idx = 0;
      return function(result, input){
        if(result === undef) return step();
        if(input === undef){
          count = idx - n;
          for(idx = 0; idx < count; idx++){
            result = step(result, buffer[idx]);
          }
          return step(result);
        }

        buffer[idx++] = input;
        return result;
      }
    }

  };

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
    return function(step){
      var count = n, buffer = [], idx = 0;
      return function(result, input){
        if(result === undef) return step();
        if(input === undef){
          while(count--){
            result = step(result, buffer[idx++ % n]);
          }
          return step(result);
        }

        buffer[idx++ % n] = input;
        return result;
      }
    }
  };

  // Returns everything but the first entry. Aliased as `tail` and `drop`.
  // Passing an **n** will return the rest N values.
  // Stateful transducer (count of items)
  _r.rest = _r.tail = _r.drop = function(n) {
    n = (n === undef) ? 1 : (n > 0) ? n : 0;
    return function(step){
      var count = n;
      return function(result, input, key){
        if(result === undef) return step();
        if(input === undef) return step(result);

        if(count > 0){
          count--;
          return result;
        } else {
          return step(result, input, key);
        }
      }
    }
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
    if (iteratee != null) iteratee = _.iteratee(iteratee);

    return function(step){
      var seen = [],
          i = 0;
      return function(result, input, key){
        if(result === undef) return step();
        if(input === undef) return step(result);

        if (isSorted) {
          if (!i || seen !== input){
            result = step(result, input, key);
          }
          seen = input;
        } else if (iteratee) {
          var computed = iteratee(input, i, result);
          if (_.indexOf(seen, computed) < 0) {
            seen.push(computed);
            result = step(result, input, key);
          }
        } else if (_.indexOf(seen, input) < 0) {
          seen.push(input);
          result = step(result, input, key);
        }
        ++i;
        return result;
      }
    }
  };

  // Invokes interceptor with each result and input, and then passes through input.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  // Executes interceptor with current result and input
  // Stateless transducer
  _r.tap = function(interceptor) {
    return function(step){
      return function(result, input, key){
        if(result === undef) return step();
        if(input === undef) return step(result);
        interceptor(result, input, key);
        return step(result, input, key);
      }
    }
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

  // Add all of the Underscore functions to the wrapper object.
  _r.mixin(_r);

  // Returns a new chained instance using current transformation, but
  // wrapping the given object
  _r.prototype.wrap = function(obj){
    return _r(obj, this);
  }

  // Helper to mark transducer to expect single value when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function
  _r.resolveSingleValue = function(self){
    if(self instanceof _r){
      self._resolveSingleValue = true;
    }
  }

  // Resolves the value of the wrapped object, similar to underscore.
  // Returns an array, or single value (to match underscore API)
  // depending on whether the chained transformation resolves to single value.
  _r.prototype.value = function(){
    if(!this._resolveSingleValue){
      return this.into([]);
    }

    var ret =  this.into(IGNORE);
    return ret === IGNORE ? undef : ret;
  }

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _r.noConflict = function() {
    root._r = previous_r;
    return this;
  };

  // Transducer Functions
  // --------------------

  _r.prototype.transducer = _r.prototype.compose = function() {
    return _.compose.apply(null, this._wrappedFns);
  }

  // Wrapper to return from iteratee of reduce to terminate
  // _r.reduce early with the provided value
  function Reduced(value){this.value = value};
  _r.reduced = function(value){
    return new Reduced(value);
  }
  var reduceError = 'Reduce of empty array with no initial value',
      Symbol_iterator = (typeof Symbol !== 'undefined' && Symbol.iterator || '@@iterator');

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.  This implementation extends underscores implementation by
  // allowing early termination using _r.reduced and accepts iterators (ES6 or any object
  // that defines a next method)
  _r.reduce = _r.foldl = _r.inject = function(obj, iteratee, memo) {
    if (obj == null) obj = [];
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey,
        iterator = (keys && (obj[Symbol_iterator] && obj[Symbol_iterator]() || obj));

    if(_.isFunction(iterator.next)){
      // Detected an iterator
      for(;;){
        currentKey = iterator.next();
        if(currentKey.done){
          return memo;
        }
        memo = iteratee(memo, currentKey.value, index++, obj);
        if(memo instanceof Reduced){
          return memo.value;
        }
      }
    }  else {
      // underscore behavior + Reduced if not iterator
      if (arguments.length < 3) {
        if (!length) throw new TypeError(reduceError);
        memo = obj[keys ? keys[index++] : index++];
      }
      for (; index < length; index++) {
        currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
        if(memo instanceof Reduced){
          return memo.value;
        }
      }
    }
    return memo;
  };

  // Takes a reducing step function of 2 args and returns a function suitable for
  // transduce by adding an arity-1 signature that calls complete
  // (default - identity) on the result argument.
  _r.completing = function(step, complete){
    complete = complete || _.identity;
    return function(result, input){
      return (result === undef)  ? step()
        :    (input === undef)   ? complete(result)
        :    step(result, input);
    }
  }

  // Dispatchers
  // -----------
  var dispatch = _.reduce(['empty', 'append'], function(memo, item){
    var d = function(){
      var args = arguments, fns = d._fns, i = fns.length, result;
      for(; i-- ;){
        result = fns[i].apply(null, args);
        if(result !== undef){
          return result;
        }
      }
      throw new TypeError('cannot find match for '+item+' '+_.toArray(args));
    };

    d._fns = [];

    d.register = function(fn){
      d._fns.push(fn);
    };

    memo[item] = d;
    return memo;
  }, {});

  // Returns empty object of the same type as argument.
  //
  // Dispatch function. To support different types
  // call _r.empty.register and supply function that returns
  // an empty object after checking the input using appropriate
  // predicates. Return undefined if not supported, so other
  // dispatched functions can be checked
  _r.empty = function(obj){
    if(obj === undef){
      return []; // arrays by default
    }
    return dispatch.empty(obj);
  }

  _r.empty.register = function(fn){
    return dispatch.empty.register(fn);
  }

  _r.empty.register(function(obj){
    if(obj !== IGNORE && obj !== undef){
      if(_.isArray(obj)){
        return [];
      } else if(_.isObject(obj)){
        return {};
      }
    }

    // ignore by default. Default append just maintains last item
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
  _r.append = _r.conj = _r.conjoin = function(obj, item, key){
    if(obj === undef){
      return []; // arrays by default
    }

    if(item === undef){
      return obj;
    }

    return dispatch.append(obj, item, key);
  }

  _r.append.register = function(fn){
    return dispatch.append.register(fn);
  }

  _r.append.register(function(obj, item, key){
    if(obj !== IGNORE){
      if(_.isArray(obj)){
        obj.push(item);
        return obj;
      } else if(key !== undef && _.isObject(obj)){
        obj[key] = item;
        return obj;
      }
    }

    // just maintain last item
    return item;
  });

  // Reduce with a transformation of step (transform). If memo is not
  // supplied, step() will be called to produce it. step should be a reducing
  // step function that accepts both 1 and 2 arguments, if it accepts
  // only 2 you can add the arity-1 with _r.completing. Returns the result
  // of applying (the transformed) transform to memo and the first item in collection,
  // then applying transform to that result and the 2nd item, etc. If collection
  // contains no items, returns memo and step is not called. Note that
  // certain transforms may inject or skip items.
  // The default step function is _r.append (with default value [])
  _r.transduce = function(transform, obj, step, memo){
    if(step === undef){
      step = _r.append;
    }

    if(memo === undef){
      memo = step();
    }

    if(transform instanceof _r){
      transform = transform.transducer();
    }

    if(transform !== undef){
      step = transform(step);
    }
    return step(_r.reduce(obj, step, memo));
  }

  // Calls transduce using the chained transformation
  _r.prototype.transduce = function(obj, step, memo){
    if(this._wrapped === undef){
      return _r.transduce(this.transducer(), obj, step, memo);
    }
    return _r.transduce(this.transducer(), this._wrapped, obj, step);
  }

  // Creates a callback that starts a transducer process and accepts
  // parameter as a new item in the process. Each item advances the state
  // of the transducer. If the transducer exhausts due to early termination,
  // all subsequent calls to the callback will return the last value.
  // If the callback is called with no argument, the transducer terminates,
  // and all subsequent calls will return the last computed result.
  // The default step function is _r.append with default memo of null.
  // (This will maintain only last value and not buffer results)
  _r.asCallback = function(transform, step, memo){
    var reduced;
    if(step === undef){
      step = _r.append;
    }

    if(memo === undef){
      memo = null;
    }

    if(transform !== undef){
      step = transform(step);
    }

    return function(item){
      if(item === undef){
        // complete
        reduced = step(reduced);
      }

      // we have exhausted process return result
      if(reduced) return reduced;

      // step to next result.
      memo = step(memo, item);

      // check if exhausted
      if(memo instanceof Reduced){
        reduced = memo.value;
        step(reduced); // notify completion
        return reduced;
      }

      // return current value
      return memo;
    }
  }

  // Calls asCallback with the chained transformation
  _r.prototype.asCallback = function(step, memo){
    return _r.asCallback(this.transducer(), step, memo);
  }

  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  _r.into = function(to, transform, from){
    var step = _r.append;

    if(from === undef){
      from = transform
      return _r.reduce(from, step, to)
    }

    return _r.transduce(transform, from, step, to)
  }

  // Calls into using the chained transformation
  _r.prototype.into = function(to, from){
    return _r.into(to, this.transducer(), from !== undef ? from : this._wrapped);
  }

  // Returns a new collection of the empty value of the from collection
  _r.sequence = function(transform, from){
    if(from == undef){
      from = transform
      return _r.into(_r.empty(from), from);
    }
    return _r.into(_r.empty(from), transform, from);
  }

  // calls sequence with chained transformation and optional wrapped object
  _r.prototype.sequence = function(from){
    if(from == undef){
      from = this._wrapped;
    }
    return this.into(_r.empty(from), from);
  }

  // Creates an (duck typed) iterator that calls the provided next callback repeatedly
  // and uses the return value as the next value of the iterator.
  // Marks iterator as done if the next callback returns undefined (returns nothing)
  // Can be used to as a source obj to reduce, transduce etc
  _r.generate = function(callback, callToInit){
    var gen = {};
    gen[Symbol_iterator] = function(){
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
    return this.wrap(_r.generate(callback, callToInit));
  }

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore.transducer', [], function() {
      return _r;
    });
  }
}.call(this));
