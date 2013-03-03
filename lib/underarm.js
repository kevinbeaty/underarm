"use strict";
var Consumer = require('./consumer'),
    Producer = require('./producer'),
    funcs = require('./funcs'),
    arrays = require('./arrays'),
    forEach = arrays.forEach,
    slice = arrays.slice,
    isUndefined = funcs.isUndefined,
    isFunction = funcs.isFunction

module.exports = Underarm
function Underarm(obj, func, args) {
  Consumer.call(this)

  if(isUndefined(obj)){
    this._detached = true
  } else if(obj instanceof Underarm){
    this._parent = obj
    this._func = func
    this._args = args
  } else {
    var wrapped = Producer.wrap(obj)
    this._wrapped = wrapped
  }

  this.producer = new Producer(function(consumer){
    consumer.resolveSingleValue = true
  })

  this.resolveSingleValue = true

  this.disposed = false
  this.unfulfilled = true
  this.fulfilled = false
  this.failed = false
}
Underarm.prototype = new Consumer()
var P = Underarm.prototype

Producer.addProducerPredicate(function(producer){
  return producer instanceof Underarm
})

Consumer.addConsumerPredicate(function(consumer){
  return consumer instanceof Underarm
    && consumer._wrapped instanceof Consumer
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
    this.disposed = true

    this.producer.onSubscribe = function(consumer){
      consumer.resolveSingleValue = true
      consumer.error(err)
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
    this.disposed = true

    this.producer.onSubscribe = function(consumer){
      consumer.resolveSingleValue = true
      consumer.resolve(value)
    }
  }
}

function eachConsumer(target, action, val){
  /*jshint validthis:true*/
  var consumers = slice.call(target.producer.consumers)
  forEach.call(consumers, function(consumer){
    consumer[action](val)
  })
  Consumer.prototype[action].call(target, val)
}

