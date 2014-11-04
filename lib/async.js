"use strict";
var async = require('transduce-async'),
    Prom = require('promise'),
    undef;

module.exports = function(_r){
  var empty = _r.empty,
      append = _r.append,
      unwrap = _r.unwrap,
      IGNORE = _r.IGNORE;

  _r.mixin({
    defer: async.defer,
    delay: async.delay,
  });
  _r.reduceAsync = reduceAsync;
  _r.foldlAsync = reduceAsync;
  _r.injectAsync = reduceAsync;
  _r.transduceAsync = transduceAsync;
  _r.intoAsync = intoAsync;
  _r.sequenceAsync = sequenceAsync;

  _r.prototype.then = function(resolve, reject){
    var r = this,
        promise;
    if(!r._resolveSingleValue){
      promise = r.intoAsync();
    } else {
      promise = r
        .intoAsync(IGNORE)
        .then(doThenIgnore);
    }
    return promise
      .then(resolve, reject);
  };

  function doThenIgnore(result){
    return result === IGNORE ? undef : result;
  }

  _r.prototype.transducerAsync = _r.prototype.composeAsync = function(){
    return async.compose.apply(null, this._wrappedFns);
  };

  function asXf(xf){
    if(_r.as(xf)){
      xf = xf.composeAsync();
    }
    return xf;
  }

  function reduceAsync(xf, init, coll) {
    if (coll === null || coll === undef) coll = empty(coll);
    return async
      .reduce(asXf(xf), init, coll)
      .then(unwrap);
  }

  function transduceAsync(xf, f, init, coll){
    return async
      .transduce(asXf(xf), f, init, coll)
      .then(unwrap);
  }

  // Calls transduce using the chained transformation
  _r.prototype.transduceAsync = function(f, init, coll){
    var r = this;
    if(coll === undef){
      coll = r._wrapped;
    }
    return transduceAsync(r, f, init, coll);
  };

  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  function intoAsync(to, xf, from){
    if(from === undef){
      from = xf;
      xf = undef;
    }

    xf = asXf(xf);
    return Prom
      .all([to, from])
      .then(doInto(xf));
  }

  // Calls into using the chained transformation
  _r.prototype.intoAsync = function(to, from){
    var r = this;

    if(from === undef){
      from = r._wrapped;
    }

    return intoAsync(to, r, from);
  };

  function doInto(xf){
    return function(toFrom){
      var to = toFrom[0],
          from = toFrom[1];
      if(from === undef){
        from = empty();
      }

      if(to === undef){
        to = empty(from);
      }

      if(xf === undef){
        return reduceAsync(append, to, from);
      }

      return transduceAsync(xf, append, to, from);
    };
  }

  // Returns a new collection of the empty value of the from collection
  function sequenceAsync(xf, from){
    return Prom
      .resolve(from)
      .then(doSequence(xf));
  }

  // calls sequence with chained transformation and optional wrapped object
  _r.prototype.sequenceAsync = function(from){
    var r = this;
    if(from === undef){
      from = r._wrapped;
    }
    return sequenceAsync(r, from);
  };

  function doSequence(xf){
    return function(from){
      return intoAsync(empty(from), xf, from);
    };
  }
};
