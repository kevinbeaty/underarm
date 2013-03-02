"use strict";
var Consumer = require('./consumer'),
    Producer = require('./producer'),
    funcs = require('./funcs'),
    arrays = require('./arrays'),
    forEach = arrays.forEach,
    slice = arrays.slice,
    isUndefined = funcs.isUndefined,
    isFunction = funcs.isFunction

module.exports = Deferred
function Deferred(){
  Consumer.call(this)

  this.producer = new Producer(function(consumer){
    consumer.resolveSingleValue = true
  })

  /* makePromise is injected */
  this.promise = Deferred.makePromise(this.producer)
  this.resolveSingleValue = true

  this.disposed = false
  this.unfulfilled = true
  this.fulfilled = false
  this.failed = false
}
Deferred.prototype = new Consumer()
var P = Deferred.prototype

Producer.addProducerPredicate(function(producer){
  return producer instanceof Deferred
})


P.subscribe = subscribe
function subscribe(next, complete, error){
  /*jshint validthis:true*/
  return this.producer.subscribe(next, complete, error)
}

P.next = next
function next(value){
  /*jshint validthis:true*/
  if(this.unfulfilled){
    eachConsumer(this, 'next', value)
  }
}

P.error = error
function error(err){
  /*jshint validthis:true*/
  if(this.unfulfilled){
    eachConsumer(this, 'error', err)
    this.unfulfilled = false
    this.failed = true

    this.producer.onSubscribe = function(consumer){
      consumer.resolveSingleValue = true
      consumer.error(err)
      consumer.complete()
    }
  }
}

P.complete = complete
function complete(){
  /*jshint validthis:true*/
  this.resolve()
}

P.resolve = resolve
function resolve(value){
  /*jshint validthis:true*/
  if(this.unfulfilled){
    if(!isUndefined(value)){
      this.resolvedValue = value
      this.producer.resolvedValue = value
    }
    eachConsumer(this, 'complete')
    this.unfulfilled = false
    this.fulfilled = true

    this.producer.onSubscribe = function(consumer){
      consumer.resolveSingleValue = true
      if(isFunction(consumer.resolve)){
        consumer.resolve(value)
      } else {
        if(!isUndefined(value)){
          consumer.next(value)
        }
        consumer.complete()
      }
    }
  }
}

P.dispose = dispose
function dispose(){
  /*jshint validthis:true*/
  this.disposed = true
  eachConsumer(this, 'dispose')
}

function eachConsumer(target, action, val){
  /*jshint validthis:true*/
  var consumers = slice.call(target.producer.consumers)
  forEach.call(consumers, function(consumer){
    consumer[action](val)
  })
  Consumer.prototype[action].call(target, val)
}

Deferred.extend = function(wrapper, wrapped){
  /*jshint validthis:true*/
  if(wrapped instanceof Deferred){
    wrapper.promise = wrapped.promise
    forEach.call(
        ['next', 'complete', 'error', 'resolve', 'dispose', 'onDispose']
      , function(prop){
          wrapper[prop] = function(){wrapped[prop].apply(wrapped, arguments)}
        })
  }
}

