"use strict";
var arrays = require('./arrays'),
    funcs = require('./funcs'),
    Consumer = require('./consumer'),
    some = arrays.some,
    isArray = funcs.isArray,
    isUndefined = funcs.isUndefined,
    isFunction = funcs.isFunction,
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
  return isProducer(delegate)
    ? delegate
    : new Producer(
        isArray(delegate)
          ? Consumer.seqNextResolve(delegate)
          : Consumer.resolveValue({value:delegate}))
}


P.subscribe = subscribe
function subscribe(next, complete, error){
  /*jshint validthis:true*/
  var consumer = Consumer.wrap(next, complete, error)
    , producer = this

  producer.consumers.push(consumer)
  consumer.onDispose(function(){
    producer.unsubscribe(consumer)
  })

  if(producer.onSubscribe){
    var disposable = producer.onSubscribe(consumer)
    if(!isUndefined(disposable)){
      if(isFunction(disposable)){
        consumer.onDispose(disposable)
      } else if(isFunction(disposable.dispose)){
        consumer.onDispose(function(){
          disposable.dispose()
        })
      }
    }
  }

  return consumer
}

P.unsubscribe = unsubscribe
function unsubscribe(consumer){
  /*jshint validthis:true*/
  removeFrom(this.consumers, consumer)
}
