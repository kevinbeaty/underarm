(function() {
  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_r` variable.
  var previous_r = root._r;

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
  _r.VERSION = '0.0.9';

  // Reference to Underscore from browser
  var _ = root._,
      t = root.transducers;
  if (typeof _ === 'undefined' && typeof require !== 'undefined'){
    _ = require('underscore');
    t = require('transducers.js');
  }

  // Collection Functions
  // --------------------
  function initDefault(){
    return this.xform.init();
  }

  function stepDefault(res, input){
    return this.xform.step(res, input)
  }

  function resultDefault(res){
    return this.xform.result(res);
  }

  // Executes the iteratee with iteratee(input, idx, result) for each item
  // passed through transducer without changing the result.
  _r.each = _r.forEach = function(iteratee) {
    return function(xform){
      return new Each(iteratee, xform);
    }
  }

  function Each(f, xform) {
    this.xform = xform;
    this.f = f;
    this.i = 0;
  }
  Each.prototype.init = initDefault;
  Each.prototype.result = resultDefault;
  Each.prototype.step = function(res, input) {
    this.f(input, this.i++);
    return this.xform.step(res, input);
  }

  // Return the results of applying the iteratee to each element.
  // Stateless transducer
  _r.map = _r.collect = function(iteratee) {
    return t.map(null, _r.iteratee(iteratee));
  }

  // Return the first value which passes a truth test. Aliased as `detect`.
  // Stateless transducer
  _r.find = _r.detect = function(predicate) {
    predicate = _r.iteratee(predicate);
    _r.resolveSingleValue(this);
    return function(xform){
      return new Find(predicate, xform);
    }
  };

  function Find(f, xform) {
    this.xform = xform;
    this.f = f;
  }
  Find.prototype.init = initDefault;
  Find.prototype.result = resultDefault;
  Find.prototype.step = function(result, input) {
    if(this.f(input)){
      return _r.reduced(this.xform.step(result, input))
    }
    return result;
  }

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  // Stateless transducer
  _r.filter = _r.select = function(predicate) {
    return t.filter(null, _r.iteratee(predicate));
  }

  // Return all the elements for which a truth test fails.
  // Stateless transducer
  _r.reject = function(predicate) {
    return _r.filter(_.negate(_r.iteratee(predicate)));
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  // Stateful transducer (found).  Early termination if item
  // does not match predicate.
  _r.every = _r.all = function(predicate) {
    predicate = _r.iteratee(predicate);
    _r.resolveSingleValue(this);
    return function(xform){
      return new Every(predicate, xform);
    }
  };
  function Every(f, xform) {
    this.xform = xform;
    this.f = f;
    this.found = false;
  }
  Every.prototype.init = initDefault;
  Every.prototype.result = function(result){
    if(!this.found){
      result = this.xform.step(result, true);
    }
    return this.xform.result(result);
  }
  Every.prototype.step = function(result, input) {
    if(!this.f(input)){
      found = true;
      return _r.reduced(this.xform.step(result, false));
    }
    return result;
  }

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  // Stateful transducer (found).  Early termination if item matches predicate.
  _r.some = _r.any = function(predicate) {
    predicate = _r.iteratee(predicate);
    _r.resolveSingleValue(this);
    return function(xform){
      return new Some(predicate, xform);
    }
  };
  function Some(f, xform) {
    this.xform = xform;
    this.f = f;
    this.found = false;
  }
  Some.prototype.init = initDefault;
  Some.prototype.result = function(result){
    if(!this.found){
      result = this.xform.step(result, false);
    }
    return this.xform.result(result);
  }
  Some.prototype.step = function(result, input) {
    if(this.f(input)){
      found = true;
      return _r.reduced(this.xform.step(result, true));
    }
    return result;
  }

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

    return function(xform){
      return new Max(iteratee, xform);
    }
  };
  function Max(f, xform) {
    this.xform = xform;
    this.f = f;
    this.computedResult = -Infinity;
    this.lastComputed = -Infinity
  }
  Max.prototype.init = initDefault;
  Max.prototype.result = function(result){
    result = this.xform.step(result, this.computedResult);
    return this.xform.result(result);
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
  // Stateful transducer (current min value and computed result)
  _r.min = function(iteratee) {
    iteratee = _r.iteratee(iteratee);
    _r.resolveSingleValue(this);

    return function(xform){
      return new Min(iteratee, xform);
    }
  };
  function Min(f, xform) {
    this.xform = xform;
    this.f = f;
    this.computedResult = Infinity;
    this.lastComputed = Infinity
  }
  Min.prototype.init = initDefault;
  Min.prototype.result = function(result){
    result = this.xform.step(result, this.computedResult);
    return this.xform.result(result);
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

  // Array Functions
  // ---------------

  // Adds one or more items to the end of the sequence, like Array.prototype.push.
  _r.push = function(){
    var toPush = _.toArray(arguments);
    return function(xform){
      return new Push(toPush, xform);
    }
  }
  function Push(toPush, xform) {
    this.xform = xform;
    this.toPush = toPush;
  }
  Push.prototype.init = initDefault;
  Push.prototype.result = function(result){
    var idx, toPush = this.toPush, len = toPush.length;
    for(idx = 0; idx < len; idx++){
      result = this.xform.step(result, toPush[idx]);
    }
    return this.xform.result(result);
  }
  Push.prototype.step = stepDefault;

  // Adds one or more items to the beginning of the sequence, like Array.prototype.unshift.
  _r.unshift = function(){
    var toUnshift = _.toArray(arguments);
    return function(xform){
      return new Unshift(toUnshift, xform);
    }
  }
  function Unshift(toUnshift, xform) {
    this.xform = xform;
    this.toUnshift = toUnshift;
  }
  Unshift.prototype.init = initDefault;
  Unshift.prototype.result = resultDefault;
  Unshift.prototype.step = function(result, input){
    var toUnshift = this.toUnshift;
    if(toUnshift){
      var idx, len = toUnshift.length;
      for(idx = 0; idx < len; idx++){
        result = this.xform.step(result, toUnshift[idx]);
      }
    }
    this.toUnshift = null;
    return this.xform.step(result, input);
  }

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
    return t.take(null, n);
  };

  // Returns everything but the last entry. Passing **n** will return all the values
  // excluding the last N.
  // Stateful transducer (count and buffer).
  // Note that no items will be sent and all items will be buffered until completion.
  _r.initial = function(n) {
    n = (n === undef) ? 1 : (n > 0) ? n : 0;
    return function(xform){
      return new Initial(n, xform);
    }
  };
  function Initial(n, xform) {
    this.xform = xform;
    this.n = n;
    this.idx = 0;
    this.buffer = [];
  }
  Initial.prototype.init = initDefault;
  Initial.prototype.result = function(result){
    var idx = 0, count = this.idx - this.n, buffer = this.buffer;
    for(idx = 0; idx < count; idx++){
      result = this.xform.step(result, buffer[idx]);
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
    return function(xform){
      return new Last(n, xform);
    }
  };
  function Last(n, xform) {
    this.xform = xform;
    this.n = n;
    this.idx = 0;
    this.buffer = [];
  }
  Last.prototype.init = initDefault;
  Last.prototype.result = function(result){
    var n = this.n, count = n, buffer=this.buffer, idx=this.idx;
    if(idx < count){
      count = idx;
      idx = 0;
    }
    while(count--){
      result = this.xform.step(result, buffer[idx++ % n]);
    }
    return this.xform.result(result);
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
    return t.drop(null, n);
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

    if(isSorted){
      return t.dedupe();
    }

    return function(xform){
      return new Uniq(iteratee, xform);
    }
  };

  function Uniq(f, xform) {
    this.xform = xform;
    this.f = f;
    this.seen = [];
    this.i = 0;
  }
  Uniq.prototype.init = initDefault;
  Uniq.prototype.result = resultDefault;
  Uniq.prototype.step = function(result, input){
    var seen = this.seen;
    if (this.f) {
      var computed = this.f(input);
      if (_.indexOf(seen, computed) < 0) {
        seen.push(computed);
        result = this.xform.step(result, input);
      }
    } else if (_.indexOf(seen, input) < 0) {
      seen.push(input);
      result = this.xform.step(result, input);
    }
    return result;
  }

  // Invokes interceptor with each result and input, and then passes through input.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  // Executes interceptor with current result and input
  // Stateless transducer
  _r.tap = function(interceptor) {
    return function(xform){
      return new Tap(interceptor, xform);
    }
  };
  function Tap(f, xform) {
    this.xform = xform;
    this.f = f;
    this.i = 0;
  }
  Tap.prototype.init = initDefault;
  Tap.prototype.result = resultDefault;
  Tap.prototype.step = function(result, input) {
    this.f(result, input, this.i++);
    return this.xform.step(result, input);
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
    return value instanceof _r ? _r : null;
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

  // Resolves the value of the wrapped object, similar to underscore.
  // Returns an array, or single value (to match underscore API)
  // depending on whether the chained transformation resolves to single value.
  _r.prototype.value = function(){
    var ret = this.seq();
    if(this._resolveSingleValue){
      var it = t.iterator(ret);
      if(it){
        ret = it.next();
        ret = ret.done ? undef : ret.value;
      }
    }
    return ret;
  }

  // Dispatchers
  // -----------
  _r.protocols = t.protocols;

  var dispatch = _.reduce(
    ['iteratee', 'wrap', 'unwrap'],
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
      throw new TypeError('cannot find match for '+item+' '+_.toArray(args));
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
  // Default returns value, or [] if undefined.
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
    if(value === undef){
      value = [];
    }
    return value;
  });

  // Unwraps (deref) a possibly wrapped value
  // Default unwraps values created with _r.reduced,
  // or calls value() on chained _r transformations,
  // or calls result on objects with transformer protocol
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
    if(_r.isReduced(value)){
      return value.val;
    } else if(_r.as(value)){
      return r.value();
    }
    return value;
  });

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

  // Transducer Functions
  // --------------------

  // Wrapper to return from iteratee of reduce to terminate
  // _r.reduce early with the provided value
  _r.reduced = function(value){
    return new t.Reduced(value);
  }
  _r.isReduced = function(value){
    return value instanceof t.Reduced;
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.  This implementation extends underscores implementation by
  // allowing early termination using _r.reduced and accepts iterators (ES6 or any object
  // that defines a next method)
  _r.reduce = _r.foldl = _r.inject = t.reduce;

  _r.seq = _r.sequence = function(coll, xform){
    if(_r.as(xform)){
      xform = xform.transducer();
    }
    return t.seq(coll, xform);
  }

  _r.prototype.seq = _r.prototype.sequence = function(coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return _r.seq(coll, this);
  }

  _r.transduce = function(coll, xform, reducer, init){
    if(_r.as(xform)){
      xform = xform.transducer();
    }
    return t.transduce(coll, xform, reducer, init);
  }

  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  _r.into = function(to, xform, from){
    if(_r.as(xform)){
      xform = xform.transducer();
    }
    return t.into(to, xform, from);
  }

  // Calls into using the chained transformation
  _r.prototype.into = function(to, from){
    if(from === undef){
      from = this._wrapped;
    }

    return _r.into(to, this, from);
  }

  _r.toArray = function(coll, xform){
    if(_r.as(xform)){
      xform = xform.transducer();
    }
    return t.toArray(coll, xform);
  }
  _r.prototype.toArray = function(coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return _r.toArray(coll, this);
  }

  _r.toObj = _r.toObject = function(coll, xform){
    if(_r.as(xform)){
      xform = xform.transducer();
    }
    return t.toObj(coll, xform);
  }
  _r.prototype.toObj = _r.prototype.toObject = function(coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return _r.toObj(coll, this);
  }

  _r.toIter = _r.toIterator = function(coll, xform){
    if(_r.as(xform)){
      xform = xform.transducer();
    }
    return t.toIterator(coll, xform);
  }
  _r.prototype.toIter = _r.prototype.toIterator = function(coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return _r.toObj(coll, this);
  }


  // Reducer that maintains last value
  function LastValue(){}
  LastValue.prototype.init = _.identity;
  LastValue.prototype.result = _.identity;
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
  // This will maintain only last value and not buffer results
  _r.asCallback = function(transform){
    var done = false, memo,
        stepper = transform(new LastValue());

    return function(item){
      if(done) return memo;

      if(item === undef){
        // complete
        memo = stepper.result(memo);
        done = true;
      } else {
        // step to next result.
        memo = stepper.step(memo, item);

        // check if exhausted
        if(_r.isReduced(memo)){
          memo = _r.unwrap(memo);
          done = true;
        }
      }

      if(done) return memo;
    }
  }

  // Calls asCallback with the chained transformation
  _r.prototype.asCallback = function(memo){
    return _r.asCallback(this.transducer(),  memo);
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
  // This will maintain only last value and not buffer results
  _r.asyncCallback = function(transform, continuation){
    var done = false, memo,
        stepper = transform(new LastValue());

    function checkDone(err, item){
      if(done){
        return true;
      }

      err = err || null;

      // check if exhausted
      if(_r.isReduced(memo)){
        memo = _r.unwrap(memo);
        done = true;
      }

      if(err || done || item === undef){
        memo = stepper.result(memo);
        done = true;
      }

      // notify if done
      if(done){
        if(continuation){
          continuation(err, memo);
          continuation = null;
        } else if(err){
          throw err;
        }
        memo = null;
      }

      return done;
    }

    return function(err, item){
      if(!checkDone(err, item)){
        try {
          // step to next result.
          memo = stepper.step(memo, item);
          checkDone(err, item);
        } catch(err2){
          checkDone(err2, item);
        }
      }
    }
  }

  // Calls asyncCallback with the chained transformation
  _r.prototype.asyncCallback = function(continuation, memo){
    return _r.asyncCallback(this.transducer(), continuation, memo);
  }

  // Creates an (duck typed) iterator that calls the provided next callback repeatedly
  // and uses the return value as the next value of the iterator.
  // Marks iterator as done if the next callback returns undefined (returns nothing)
  // Can be used to as a source obj to reduce, transduce etc
  _r.generate = function(callback, callToInit){
    return new Generate(callback, callToInit);
  }

  // Transduces the current chained object by using the chained trasnformation
  // and an iterator created with the callback
  _r.prototype.generate = function(callback, callToInit){
    return this.withSource(_r.generate(callback, callToInit));
  }

  function Generate(callback, callToInit){
    this.cb = callback;
    this.init = callToInit;
  }
  Generate.prototype[t.protocols.iterator] = function(){
    var callback = this.cb, callToInit = this.init;
    var next = callToInit ? callback() : callback;
    return {
      next: function(){
        var value = next();
        return (value === undef) ? {done: true} : {done: false, value: value};
      }
    }
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
