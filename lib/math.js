var undef,
    math = require('transduce-math');

module.exports = function(_r){
  // Math Functions
  // --------------------

  // Return the maximum element (or element-based computation).
  // Stateful transducer (current max value and computed result)
  _r.max = function(iteratee) {
    iteratee = _r.iteratee(iteratee);
    _r.resolveSingleValue(this);
    return math.max(iteratee);
  };

  // Return the minimum element (or element-based computation).
  // Stateful transducer (current min value and computed result)
  _r.min = function(iteratee) {
    iteratee = _r.iteratee(iteratee);
    _r.resolveSingleValue(this);
    return math.min(iteratee);
  };
}
