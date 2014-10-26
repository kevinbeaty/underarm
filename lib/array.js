var array = require('transduce-array'), undef;

module.exports = function(_r){
  // Array Functions
  // ---------------

  // Executes the iteratee with iteratee(input, idx, result) for each item
  // passed through transducer without changing the result.
  _r.each = _r.forEach = array.forEach;

  // Return the first value which passes a truth test. Aliased as `detect`.
  // Stateless transducer
  _r.find = _r.detect = function(predicate) {
     predicate = _r.iteratee(predicate);
     _r.resolveSingleValue(this);
     return array.find(predicate);
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

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  // Stateful transducer (found). Early termination when found.
  _r.findWhere = function(attrs) {
    return _r.find.call(this, _r._.matches(attrs));
  };

  // Adds one or more items to the end of the sequence, like Array.prototype.push.
  _r.push = array.push;

  // Adds one or more items to the beginning of the sequence, like Array.prototype.unshift.
  _r.unshift = array.unshift;

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

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  // Steteful transducer (index and all seen items if not sorted, last seen item if sorted).
  _r.uniq = _r.unique = function(isSorted, iteratee) {
     if (!_r._.isBoolean(isSorted)) {
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
      if (_r._.indexOf(seen, computed) < 0) {
        seen.push(computed);
        result = this.xf.step(result, input);
      }
    } else if (_r._.indexOf(seen, input) < 0) {
        seen.push(input);
        result = this.xf.step(result, input);
    }
    return result;
  }
}
