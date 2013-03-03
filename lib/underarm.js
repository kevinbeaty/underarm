"use strict";
var when = require('when'),
    Consumer = require('./consumer'),
    Producer = require('./producer'),
    funcs = require('./funcs'),
    arrays = require('./arrays'),
    objects = require('./objects'),
    forIn = objects.forIn,
    forEach = arrays.forEach,
    push = arrays.push,
    pop = arrays.pop,
    unshift = arrays.unshift,
    slice = arrays.slice,
    isUndefined = funcs.isUndefined,
    isFunction = funcs.isFunction,
    isObject = funcs.isObject

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

Underarm.chain = chain
function chain(obj){
  return (obj instanceof Underarm) ? obj : new Underarm(obj)
}

function unwrap(obj){
  return (obj instanceof Underarm) ? obj.value() : obj
}

Underarm.mixin = mixin
function mixin(obj) {
  var name
    , func
    , addToWrapper = function(name, func){
        P[name] = function() {
          var args = slice.call(arguments)
          return new Underarm(this, func, args)
        }
      }

  for(name in obj){
    if(isFunction(obj[name])){
      func = obj[name]
      if(Underarm._r !== obj){
        Underarm._r[name] = func
      }
      addToWrapper(name, func)
    }
  }
}

P.attach = attach
function attach(producer){
  /*jshint validthis:true, boss:true */
  var node = this
  do {
    if(node._detached){
      node._wrapped = Producer.wrap(producer)
      break
    }
  } while(node = node._parent)
  return this
}

P.value = value
function value(){
  /*jshint validthis:true, boss:true */
  var result = this._wrapped
  if(isUndefined(result)){
    var stack = []
      , node = this
      , args
      , attached = true

    while(node._parent){
      push.call(stack, node)
      node = node._parent
      if(!isUndefined(node._wrapped)){
        result = node._wrapped
        attached = !node._detached
        break
      }
    }

    while(node = pop.call(stack)){
      args = slice.call(node._args)
      unshift.call(args, result)
      result = node._func.apply(Underarm._r, args)
      if(attached){
        node._wrapped = Producer.wrap(result)
      }
    }
  }
  return result
}

P.subscribe = subscribe
function subscribe(next, complete, error){
  /*jshint validthis:true*/
  return unwrap(this).subscribe(next, complete, error)
}

P.then = then
function then(resolve, error, progress){
  /*jshint validthis:true*/
  return Producer.prototype.then.call(unwrap(this), resolve, error, progress)
}

P.callback = callback
function callback(){
  /*jshint validthis:true*/
  return this.callbackWithBoundDeferred(function(val){this.notify(val)})
}

P.ncallback = ncallback
function ncallback(){
  /*jshint validthis:true*/
  return this.callbackWithBoundDeferred(
    function(err, val){
      if(err){
        this.reject(err)
      } else {
        this.notify(val)
      }
    })
}

P.callbackWithBoundDeferred = callbackWithBoundDeferred
function callbackWithBoundDeferred(callback){
  /*jshint validthis:true*/
  var d = when.defer()
    , cb = function(){callback.apply(d, arguments)}

  cb.resolver = d.resolver
  cb.promise = when(this.attach(d))

  return cb
}

Underarm.each = each
function each(producer, iterator, context){
  return chain(producer).each(iterator, context)
}

P.each = P.forEach = function(iterator, context){
  var result = []
    , consumer = new Consumer(
      function(next){
        push.call(result, next)
      }
    , function(){
        var key = 0
          , len = result.length
          , resolveSingleValue = consumer.resolveSingleValue
        if(len){
          if(!resolveSingleValue){
            forEach.call(result, iterator, context)
          } else {
            var singleValue = result[0]
            if(singleValue && singleValue.length === +singleValue.length){
              len = singleValue.length
              forEach.call(result, iterator, context)
            } else if(isObject(singleValue)){
              forIn.call(singleValue, iterator, context)
            } else {
              iterator.call(context, singleValue, 0, result)
            }
          }
        }
      })
  return unwrap(this).subscribe(consumer)
}
