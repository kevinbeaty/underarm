"use strict";
var when = require('when'),
    Consumer = require('./consumer'),
    u = require('./util')

module.exports = Producer
function Producer(onSubscribe){
  this.onSubscribe = onSubscribe
}
var P = Producer.prototype

Producer.isProducer = isProducer
function isProducer(producer){
 return  producer instanceof Producer
}

Producer.wrap = wrap
function wrap(delegate){
  return isProducer(delegate) ? delegate
    : new Producer(
        u.isStream(delegate) ? Consumer.stream(delegate)
      : u.isArray(delegate) ? Consumer.seqNextResolve(delegate)
      : Consumer.resolveValue({value:delegate}))
}


P.subscribe = subscribe
function subscribe(next, complete, error){
  /*jshint validthis:true*/
  var consumer = Consumer.wrap(next, complete, error)
    , producer = this._unwrap()

  if(producer.onSubscribe){
    producer.onSubscribe(consumer)
  }

  return consumer
}

P._unwrap = _unwrap
function _unwrap(){
  /*jshint validthis:true*/
  return this
}

P.then = then
function then(resolve, error, progress){
  /*jshint validthis:true*/
  var deferred = when.defer()
    , resolver = deferred.resolver
    , self = this._unwrap()
    // no need to buffer if no resolve function
    , collectResults = u.isFunction(resolve)
    , results = []
    , consumer = new Consumer(
        function(result){
          if(collectResults){
            if(consumer.resolveSingleValue){
              results = [result]
            } else {
              u.push.call(results, result)
            }
          }
          resolver.notify(result)
        }
      , function(){
          var result = collectResults &&
                consumer.resolveSingleValue
                ? results[results.length - 1]
                : results
          resolver.resolve(result)
        }
      , function(err){
          resolver.reject(err)
        })
  self.subscribe(consumer)

  return deferred.promise
    .then(resolve, error, progress)
}

