"use strict";
var seq = require('transduce-sequence'),
    ip = require('iterator-protocol'),
    undef;

module.exports = function(_r){
  // Returns a new collection of the empty value of the from collection
  _r.sequence = sequence;
  function sequence(xf, from){
    if(_r.as(xf)){
      xf = _r.transducer(xf);
    }
    return seq(xf, from);
  }

  // calls sequence with chained transformation and optional wrapped object
  _r.prototype.sequence = function(from){
    if(from == undef){
      from = this._wrapped;
    }
    return sequence(this, from);
  };

  _r.prototype[ip.symbol] = function(){
    return _r.iterator(this.sequence());
  };
};
