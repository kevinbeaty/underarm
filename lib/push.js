var push = require('transduce-push'),
    undef;

module.exports = function(_r){

  _r.mixin({tap: push.tap});

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
  _r.asCallback = function(xf, init){
    if(_r.as(xf)){
      xf = xf.compose();
    }

    var reducer;
    if(init !== undef){
      reducer = _r.dispatch();
    }
    return push.asCallback(xf, reducer);
  }

  _r.prototype.asCallback = function(init){
    return _r.asCallback(this, init);
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
  _r.asyncCallback = function(xf, continuation, init){
    if(_r.as(xf)){
      xf = xf.compose();
    }

    var reducer;
    if(init !== undef){
      reducer = _r.dispatch();
    }
    return push.asyncCallback(xf, continuation, reducer);
  }

  _r.prototype.asyncCallback = function(continuation, init){
    return _r.asyncCallback(this, continuation, init);
  }
}
