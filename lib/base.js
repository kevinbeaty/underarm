var transduce = require('transduce'),
    slice = Array.prototype.slice, undef;

module.exports = function(_r){
  // Base Transducers
  // ----------------
 
  // Return the results of applying the iteratee to each element.
  // Stateless transducer
  _r.map = _r.collect = function(iteratee) {
    return transduce.map(_r.iteratee(iteratee));
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

  // takes items until predicate returns false
  _r.takeWhile = function(pred) {
     pred = _r.iteratee(pred);
     return transduce.takeWhile(pred);
  };

  // Returns everything but the first entry. Aliased as `tail` and `drop`.
  // Passing an **n** will return the rest N values.
  // Stateful transducer (count of items)
  _r.rest = _r.tail = _r.drop = function(n) {
    n = (n === undef) ? 1 : (n > 0) ? n : 0;
    return transduce.drop(n);
  };

  // Drops items while the predicate returns true
  _r.dropWhile = function(pred) {
     pred = _r.iteratee(pred);
     return transduce.dropWhile(pred);
  };

  // Concatenating transducer.
  // NOTE: unlike libraries, cat should be called as a function to use.
  // _r.cat() not _r.cat
  _r.cat = function(){
    return transduce.cat;
  }

  // mapcat.
  // Composition of _r.map(f) and _r.cat()
  _r.mapcat = function(f){
    return transduce.mapcat(_r.iteratee(f));
  }

  // Partitions the source into arrays of size n
  // When transformer completes, the array will be stepped with any remaining items.
  // Alias chunkAll
  _r.partitionAll = _r.chunkAll = function(n){
    return transduce.partitionAll(n);
  }

  // Partitions the source into sub arrays while the value of the function
  // changes equality.
  _r.partitionBy = function(f){
    return transduce.partitionBy(_r.iteratee(f));
  }

  // Trim out all falsy values from an array.
  // Stateless transducer
  _r.compact = function() {
    return _r.filter(_r._.identity);
  };

  // Invoke a method (with arguments) on every item in a collection.
  // Stateless transducer
  _r.invoke = function(method) {
    var args = slice.call(arguments, 2);
    var isFunc = _r._.isFunction(method);
    return _r.map(function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  // Stateless transducer.
  _r.pluck = function(key) {
    return _r.map(_r._.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  // Stateless transducer
  _r.where = function(attrs) {
    return _r.filter(_r._.matches(attrs));
  };

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

}
