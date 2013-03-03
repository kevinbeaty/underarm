"use strict";
var through = require('through'),
    funcs = require('./funcs'),
    arrays = require('./arrays'),
    objects = require('./objects'),
    forEach = arrays.forEach,
    forIn = objects.forIn,
    isArray = funcs.isArray,
    isUndefined = funcs.isUndefined,
    isObject = funcs.isObject,
    some = arrays.some,
    isFunction = funcs.isFunction,
    errorHandler = funcs.errorHandler,
    consumerPredicates = [function(val){return val instanceof Consumer}];

module.exports = Consumer
function Consumer(next, complete, error){
  appendToMethod(this, 'next', next)
  appendToMethod(this, 'complete', complete)
  appendToMethod(this, 'error', error)

  this.disposed = false
  this.resolveSingleValue = false
}
var P = Consumer.prototype

Consumer.addConsumerPredicate = addConsumerPredicate
function addConsumerPredicate(predicate){
  consumerPredicates.push(predicate)
}

Consumer.isConsumer = isConsumer
function isConsumer(consumer){
  return some.call(consumerPredicates, function(pred){
    return pred(consumer)
  })
}

Consumer.wrap = wrap
function wrap(next, complete, error){
  return isConsumer(next)
    ? next
    : new Consumer(next, complete, error)
}

P.next = next
function next(value){
}

P.error = error
function error(err){
  /*jshint validthis:true */
  errorHandler(err)
  this.disposed = true
}

P.complete = complete
function complete(){
  /*jshint validthis:true */
  this.disposed = true
}

function appendToMethod(obj, method, toAppend){
  if(isFunction(toAppend)){
    var func = obj[method]
    obj[method] = function(arg){
      if(!this.disposed){
        toAppend.call(obj, arg)
        func.call(obj, arg)
      }
    }
  }
}

P.resolve = resolve
function resolve(value){
  /*jshint validthis:true */
  this.resolveSingleValue = true
  if(!isUndefined(value)){
    this.next(value)
  }
  this.complete()
}

Consumer.resolveValue = resolveValue
function resolveValue(obj){
  return function(consumer){
    consumer.resolve(obj.value)
  }
}

Consumer.resolveUndefined = resolveValue({})
Consumer.resolveFalse = resolveValue({value:false})
Consumer.resolveTrue = resolveValue({value:true})
Consumer.resolveNegativeOne = resolveValue({value:-1})

Consumer.seqNext = seqNext
function seqNext(consumer, value){
  if(isArray(value)){
    forEach.call(value, function(val){
      consumer.next(val)
    })
  } else if(isObject(value)){
    forIn.call(value, function(val, key){
      consumer.next([key, val])
    })
  } else {
    consumer.next(value)
  }
}

Consumer.seqNextResolve = seqNextResolve
function seqNextResolve(value){
  return function(consumer){
    Consumer.seqNext(consumer, value)
    consumer.complete()
  }
}

Consumer.stream = stream
function stream(read){
  return function(consumer){
    var stream = through(
            function(data){consumer.next(data)}
          , function(){consumer.complete()})
    stream.on('error', function(err){
      consumer.error(err)
    })

    read.pipe(stream)
  }
}

