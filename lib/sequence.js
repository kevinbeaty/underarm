'use strict'
var core = require('transduce/core'),
    seq = core.sequence,
    symbol = core.protocols.iterator

module.exports = function(_r){
  // Returns a new collection of the empty value of the from collection
  _r.sequence = sequence
  function sequence(xf, from){
    if(_r.as(xf)){
      xf = _r.transducer(xf)
    }
    return seq(xf, from)
  }

  // calls sequence with chained transformation and optional wrapped object
  _r.prototype.sequence = function(from){
    if(from === void 0){
      from = this._wrapped
    }
    return sequence(this, from)
  }

  _r.prototype[symbol] = function(){
    return _r.iterator(this.sequence())
  }
}
