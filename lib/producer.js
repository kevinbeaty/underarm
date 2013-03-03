"use strict";
var when = require('when'),
    arrays = require('./arrays'),
    funcs = require('./funcs'),
    Consumer = require('./consumer'),
    some = arrays.some,
    push = arrays.push,
    has = funcs.has,
    isArray = funcs.isArray,
    isUndefined = funcs.isUndefined,
    isFunction = funcs.isFunction,
    isStream = funcs.isStream,
    removeFrom = arrays.removeFrom,
    producerPredicates = [function(val){return val instanceof Producer}];

module.exports = Producer
function Producer(onSubscribe){
  this.consumers = []
  this.onSubscribe = onSubscribe
}
var P = Producer.prototype

Producer.addProducerPredicate = addProducerPredicate
function addProducerPredicate(predicate){
  producerPredicates.push(predicate)
}

Producer.isProducer = isProducer
function isProducer(producer){
  return some.call(producerPredicates, function(pred){
    return pred(producer)
  })
}

Producer.wrap = wrap
function wrap(delegate){
  return isProducer(delegate) ? delegate
    : new Producer(
        isStream(delegate) ? Consumer.stream(delegate)
      : isArray(delegate) ? Consumer.seqNextResolve(delegate)
      : Consumer.resolveValue({value:delegate}))
}


P.subscribe = subscribe
function subscribe(next, complete, error){
  /*jshint validthis:true*/
  var consumer = Consumer.wrap(next, complete, error)
    , producer = this

  producer.consumers.push(consumer)

  if(producer.onSubscribe){
    producer.onSubscribe(consumer)
  }

  return consumer
}

P.unsubscribe = unsubscribe
function unsubscribe(consumer){
  /*jshint validthis:true*/
  removeFrom(this.consumers, consumer)
}

P.then = then
function then(resolve, error, progress){
  /*jshint validthis:true*/
  var deferred = when.defer()
    , resolver = deferred.resolver
    , self = this
    // no need to buffer if no resolve function
    , collectResults = isFunction(resolve)
    , results = []
    , consumer = new Consumer(
        function(result){
          if(collectResults){
            if(consumer.resolveSingleValue){
              results = [result]
            } else {
              push.call(results, result)
            }
          }
          resolver.notify(result)
        }
      , function(){
          var result = collectResults &&
                  has(self, 'resolvedValue')
                ? self.resolvedValue
                : consumer.resolveSingleValue
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

