'use strict'
var tap = require('transduce/push/tap'),
    _asCallback = require('transduce/push/asCallback'),
    _asyncCallback = require('transduce/push/asyncCallback')

module.exports = function(_r){

  _r.mixin({tap: tap})
  _r.asCallback = asCallback
  _r.asyncCallback = asyncCallback

  var as = _r.as,
      dispatch = _r.dispatch,
      transducer = _r.transducer

  // Creates a callback that starts a transducer process and accepts
  // parameter as a new item in the process. Each item advances the state
  // of the transducer. If the transducer exhausts due to early termination,
  // all subsequent calls to the callback will no-op and return the computed result.
  //
  // If the callback is called with no argument, the transducer terminates,
  // and all subsequent calls will no-op and return the computed result.
  //
  // The callback returns undefined until completion. Once completed, the result
  // is always returned.
  //
  // If init is defined, maintains last value and does not buffer results.
  // If init is provided, it is dispatched
  function asCallback(xf, init){
    if(as(xf)){
      xf = transducer(xf)
    }

    var reducer
    if(init !== void 0){
      reducer = dispatch()
    }
    return _asCallback(xf, reducer)
  }

  _r.prototype.asCallback = function(init){
    return asCallback(this, init)
  }

  // Creates an async callback that starts a transducer process and accepts
  // parameter cb(err, item) as a new item in the process. The returned callback
  // and the optional continuation follow node conventions with  fn(err, item).
  //
  // Each item advances the state  of the transducer, if the continuation
  // is provided, it will be called on completion or error. An error will terminate
  // the transducer and be propagated to the continuation.  If the transducer
  // exhausts due to early termination, any further call will be a no-op.
  //
  // If the callback is called with no item, it will terminate the transducer process.
  //
  // If init is defined, maintains last value and does not buffer results.
  // If init is provided, it is dispatched
  function asyncCallback(xf, continuation, init){
    if(as(xf)){
      xf = transducer(xf)
    }

    var reducer
    if(init !== void 0){
      reducer = dispatch()
    }
    return _asyncCallback(xf, continuation, reducer)
  }

  _r.prototype.asyncCallback = function(continuation, init){
    return asyncCallback(this, continuation, init)
  }
}
