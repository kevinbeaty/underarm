'use strict'
var Prom = require('any-promise'),
    async = require('transduce-x/async')

module.exports = function(_r){
  var empty = _r.empty,
      append = _r.append,
      unwrap = _r.unwrap,
      IGNORE = _r.IGNORE,
      transducer = _r.transducer,
      as = _r.as,
      _ = _r._

  _r.resolveAsync = resolveAsync
  _r.mixin({
    defer: defer,
    delay: delay
  })

  // Helper to mark transducer to resolve as a Promise
  //  Only valid when chaining, but this should be passed
  // when called as a function
  function resolveAsync(self){
    if(as(self)){
      self._opts.resolveAsync = true
    }
  }
  _r.prototype.async = function(){
    resolveAsync(this)
    return this
  }

  function isAsync(self){
    return as(self) && self._opts.resolveAsync
  }

  // Resolve async values as a promise
  _r.value.register(function(r){
    var promise
    if(r._opts.resolveAsync){
      if(!r._opts.resolveSingleValue){
        promise = r.into()
      } else {
        promise = r
          .into(IGNORE)
          .then(_value)
      }
      return promise
    }
  })

  function _value(result){
    return result === IGNORE ? void 0 : result
  }

  _r.wrap.register(function(value){
    if(value && typeof value.then === 'function'){
      /*jshint validthis:true*/
      resolveAsync(this)
    }
  })

  _r.prototype.then = function(resolve, reject){
    resolveAsync(this)
    return this.value()
      .then(resolve, reject)
  }

  function defer(){
    /*jshint validthis:true*/
    resolveAsync(this)
    return async.defer()
  }

  function delay(wait){
    /*jshint validthis:true*/
    resolveAsync(this)
    return async.delay(wait)
  }

  _r.transducer.register(function(self){
    if(isAsync(self)){
      return async.compose.apply(null, self._wrappedFns)
    }
  })

  function asXf(xf){
    if(as(xf)){
      xf = transducer(xf)
    }
    return xf
  }

  _r.reduce.register(function(xf, init, coll) {
    if(isAsync(xf)){
      return reduceAsync(xf, init, coll)
    }
  })

  function reduceAsync(xf, init, coll) {
    if (coll === null || coll === void 0) coll = empty(coll)
    return async.reduce(asXf(xf), init, coll)
      .then(unwrap)
  }

  _r.transduce.register(function(xf, f, init, coll){
    if(isAsync(xf)){
      return transduceAsync(xf, f, init, coll)
    }
  })

  function transduceAsync(xf, f, init, coll){
    return async.transduce(asXf(xf), f, init, coll)
      .then(unwrap)
  }

  _r.into.register(function(to, xf, from){
    if(isAsync(xf)){
      return intoAsync(to, xf, from)
    }
  })

  function intoAsync(to, xf, from){
    if(from === void 0){
      from = xf
      xf = void 0
    }
    xf = asXf(xf)
    return Prom
      .all([to, from])
      .then(_into(xf))
  }

  function _into(xf){
    return function(toFrom){
      var to = toFrom[0],
          from = toFrom[1]
      if(from === void 0){
        from = empty()
      }

      if(to === void 0){
        to = empty(from)
      }

      if(xf === void 0){
        return reduceAsync(append, to, from)
      }

      return transduceAsync(xf, append, to, from)
    }
  }

  // Returns a new collection of the empty value of the from collection
  _r.toArray.register(function(xf, from){
    if(isAsync(xf)){
      return Prom
        .all([from])
        .then(_toArray(xf))
    }
  })

  function _toArray(xf){
    return function(from){
      from = from[0]
      return intoAsync(empty(from), xf, from)
    }
  }
}
