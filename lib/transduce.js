var tr = require('transduce'), undef;

module.exports = function(_r){
  // Transducer Functions
  // --------------------
  var as = _r.as,
      _ = _r._,
      empty = _r.empty,
      append = _r.append;

  _r.reduced = tr.reduced;
  _r.isReduced = tr.isReduced;
  _r.reduce = _r.foldl = _r.inject = reduce;
  _r.transduce = transduce;
  _r.into = into;

  function reduce(xf, init, coll) {
    if (coll == null) coll = empty(coll);
    return tr.reduce(xf, init, coll);
  }

  function transduce(xf, f, init, coll){
    if(_r.as(xf)){
      xf = xf.compose();
    }

    return _r.unwrap(tr.transduce(xf, f, init, coll));
  }

  // Calls transduce using the chained transformation
  _r.prototype.transduce = function(f, init, coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return transduce(this, f, init, coll);
  }

  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  function into(to, xf, from){
    if(from === undef){
      from = xf;
      xf = undef;
    }

    if(from === undef){
      from = empty();
    }

    if(as(xf)){
      xf = xf.compose();
    }

    if(xf === undef){
      return reduce(append, to, from);
    }

    return transduce(xf, append, to, from);
  }

  // Calls into using the chained transformation
  _r.prototype.into = function(to, from){
    if(from === undef){
      from = this._wrapped;
    }

    if(from === undef){
      from = empty();
    }

    if(to === undef){
      to = empty(from);
    }

    return into(to, this, from);
  }

  // Returns a new collection of the empty value of the from collection
  _r.sequence = function(xf, from){
    return into(empty(from), xf, from);
  }

  // calls sequence with chained transformation and optional wrapped object
  _r.prototype.sequence = function(from){
    return this.into(empty(from), from);
  }
}
