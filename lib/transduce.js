var transduce = require('transduce'), undef;

module.exports = function(_r){
  // Transducer Functions
  // --------------------

  // Wrapper to return from iteratee of reduce to terminate
  // _r.reduce early with the provided value
  _r.reduced = transduce.reduced;
  _r.isReduced = transduce.isReduced;

  _r.reduce = _r.foldl = _r.inject = function(xf, init, coll) {
    if (coll == null) coll = _r.empty(coll);
    return transduce.reduce(xf, init, coll);
  };

  _r.transduce = function(xf, f, init, coll){
    if(_r.as(xf)){
      xf = xf.compose();
    }

    return _r.unwrap(transduce.transduce(xf, f, init, coll));
  }

  // Calls transduce using the chained transformation
  _r.prototype.transduce = function(f, init, coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return _r.transduce(this, f, init, coll);
  }

  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  _r.into = function(to, xf, from){
    var f = _r.append;

    if(from === undef){
      from = xf;
      xf = undef;
    }

    if(from === undef){
      from = _r.empty();
    }

    if(_r.as(xf)){
      xf = xf.compose();
    }

    if(xf === undef){
      return _r.reduce(f, to, from);
    }

    return _r.transduce(xf, f, to, from);
  }

  // Calls into using the chained transformation
  _r.prototype.into = function(to, from){
    if(from === undef){
      from = this._wrapped;
    }

    if(from === undef){
      from = _r.empty();
    }

    if(to === undef){
      to = _r.empty(from);
    }

    return _r.into(to, this, from);
  }

  // Returns a new collection of the empty value of the from collection
  _r.sequence = function(xf, from){
    return _r.into(_r.empty(from), xf, from);
  }

  // calls sequence with chained transformation and optional wrapped object
  _r.prototype.sequence = function(from){
    return this.into(_r.empty(from), from);
  }
}
