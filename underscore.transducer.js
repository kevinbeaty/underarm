(function() {
  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_r` variable.
  var previous_r = root._r;

  // Create quick reference variables for speed access to core prototypes.
  var slice = Array.prototype.slice;

  // Create a safe reference to the Underscore object for use below.
  var _r = function(obj) {
    if (obj instanceof _r) return obj;
    if (!(this instanceof _r)) return new _r(obj);
    this._wrapped = obj;
  };

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
  _r.VERSION = '0.0.1';

  // Reference to Underscore from browser
  var _ = root._;
  if (typeof _ === 'undefined' && typeof require !== 'undefined'){
    _ = require('underscore')._;
  }

  // Collection Functions
  // --------------------

  // Executes the iteratee with iteratee(input, idx, result) for each item
  // passed through transducer without changing the result. The input is the current
  // input, idx is a running index, and the result is current result. This is a
  // stateful transducer (the idx)
  _r.each = _.forEach = function(iteratee) {
    return function(step){
      var i = 0;
      return function(result, input){
        if(result === void 0) return step();
        if(input === void 0) return step(result);
        iteratee(input, i++, result);
        return step(result, input);
      }
    }
  };

  // Return the results of applying the iteratee to each element.
  // Stateless transducer
  _r.map = _r.collect = function(iteratee) {
    iteratee = _.iteratee(iteratee);
    return function(step){
      return function(result, input){
        return (result === void 0)  ? step()
          :    (input === void 0)   ? step(result)
          :    step(result, iteratee(input))
      }
    }
  };


  // Return the first value which passes a truth test. Aliased as `detect`.
  // Stateless transducer
  _r.find = _r.detect = function(predicate) {
    predicate = _.iteratee(predicate);
    return function(step){
      return function(result, input){
        return (result === void 0)  ? step()
          :    (input === void 0)   ? step(result)
          :    (predicate(input))   ? _r.reduced(step(result, input))
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
      return function(result, input){
        return (result === void 0)  ? step()
          :    (input === void 0)   ? step(result)
          :    (predicate(input))   ? step(result, input)
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
    return function(step){
      var found = false;
      return function(result, input){
        if(result === void 0) return step();

        if(input === void 0){
          if(!found){
            result = step(result, true);
          }
          return step(result);
        }

        if(!predicate(input)){
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
    return function(step){
      var found = false;
      return function(result, input){
        if(result === void 0) return step();

        if(input === void 0){
          if(!found){
            result = step(result, found);
          }
          return step(result);
        }

        if(predicate(input)){
          found = true;
          return _r.reduced(step(result, found));
        }
        return result;
      }
    }
  };

  // Determine if contains a given value (using `===`).
  // Aliased as `include`.
  // Stateful transducer (found). Early termination when item found.
  _r.contains = _r.include = function(target) {
    return _r.some(function(x){return x === target});
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
    return _r.find(_.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  // Stateful transducer (current max value and computed result)
  _r.max = function(iteratee) {
    iteratee = _.iteratee(iteratee);

    return function(step){
      var computedResult = -Infinity, lastComputed = -Infinity, computed;
      return function(result, input){
        if(result === void 0) return step();

        if(input === void 0){
          result = step(result, computedResult);
          return step(result);
        }

        computed = iteratee(input);
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
  _r.min = function(obj, iteratee) {
    iteratee = _.iteratee(iteratee);

    return function(step){
      var computedResult = Infinity, lastComputed = Infinity, computed;
      return function(result, input){
        if(result === void 0) return step();

        if(input === void 0){
          result = step(result, computedResult);
          return step(result);
        }

        computed = iteratee(input);
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
    n = (n > 0) ? n : 1;
    return function(step){
      var count = n;
      return function(result, input){
        if(result === void 0) return step();
        if(input === void 0) return step(result);

        step(result, input);

        return (!--count) ?  _r.reduced(result) : result;
      }
    }
  };

  /* TODO
  // Returns everything but the last entry. Passing **n** will return all the values
  // excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element. Passing **n** will return the last N  values.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry. Aliased as `tail` and `drop`.
  // Passing an **n** will return the rest N values.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };
  */

  // Trim out all falsy values from an array.
  // Stateless transducer
  _r.compact = function() {
    return _r.filter(_.identity);
  };

  /* TODO
  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };
  */


  // Invokes interceptor with each result and input, and then passes through input.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  // Executes interceptor with current result and input
  // Stateless transducer
  _r.tap = function(interceptor) {
    return function(step){
      return function(result, input){
        if(result === void 0) return step();
        if(input === void 0) return step(result);
        interceptor(result, input);
        return step(result, input);
      }
    }
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _r.chain(obj) : obj;
  };

  // Add your own custom transducers to the Underscore.transducer object.
  _r.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _r[name] = obj[name];
      _r.prototype[name] = function() {
        var method = func.apply(_r, arguments);
        if(_.isFunction(this._wrapped)){
          method = _.compose(this._wrapped, method);
        }
        return result(this, method);
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _r.mixin(_r);

  _r.chain = function(obj) {
    var instance = _r(obj);
    instance._chain = true;
    return instance;
  };

  // Extracts the result from a wrapped and chained object.
  _r.prototype.value = function() {
    return this._wrapped;
  };

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _r.noConflict = function() {
    root._r = previous_r;
    return this;
  };

  // Transducer Functions
  // --------------------

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
      return (result === void 0)  ? step()
        :    (input === void 0)   ? complete(result)
        :    step(result, input);
    }
  }

  // Appends (conjoins) the item to the collection, and returns collection
  _r.append = _r.conj = _r.conjoin = function(obj, item){
    if(obj === void 0){
      return [];
    }

    if(item === void 0){
      return obj;
    }

    // TODO objects
    obj.push(item);
    return obj;
  }

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
    if(step === void 0){
      step = _r.append;
    }

    if(memo === void 0){
      memo = step();
    }

    step = transform(step);
    return step(_r.reduce(obj, step, memo));
  }

  // Calls transduce using the chained transformation
  _r.prototype.transduce = function(obj, step, memo){
    return _r.transduce(this._wrapped, obj, step, memo);
  }

  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  _r.into = function(to, transform, from){
    var step = _r.append;

    if(from === void 0){
      from = transform
      return _r.reduce(from, step, to)
    }

    return _r.transduce(transform, from, step, to)
  }

  // Calls into using the chained transformation
  _r.prototype.into = function(to, from){
    return _r.into(to, this._wrapped, from);
  }

  // Creates an (duck typed) iterator that calls the provided next callback repeatedly
  // and uses the return value as the next value of the iterator.
  // Marks iterator as done if the next callback returns undefined (returns nothing)
  // Can be used to as a source obj to reduce, transduce etc
  _r.generate = function(next){
    return {
      next: function(){
        var value = next();
        return (value === void 0) ? {done: true} : {done: false, value: value};
      }
    }
  }

  // Transduces the current chained object by using the chained trasnformation
  // and an iterator created with the callback
  _r.prototype.generate = function(callback){
    return this.transduce(_r.generate(callback));
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
