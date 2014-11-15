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
    at: at,
    slice: array.slice,
    initial: array.initial,
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

  // Retrieves the value at the given index. Resolves as single value.
  function at(idx){
     /*jshint validthis:true*/
    resolveSingleValue(this);
    return array.slice(idx, idx+1);
  }

  // Get the last element. Passing **n** will return the last N  values.
  // Note that no items will be sent until completion.
  function last(n) {
    if(n === undef){
     /*jshint validthis:true*/
      resolveSingleValue(this);
    }
    return array.last(n);
  }

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
