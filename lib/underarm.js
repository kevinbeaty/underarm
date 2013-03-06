"use strict";
var when = require('when'),
    Consumer = require('./consumer'),
    Producer = require('./producer'),
    u = require('./util'),
    forIn = u.forIn,
    forEach = u.forEach,
    push = u.push,
    pop = u.pop,
    unshift = u.unshift,
    slice = u.slice,
    isProducer = Producer.isProducer,
    isUndefined = u.isUndefined,
    isFunction = u.isFunction,
    isArray = u.isArray,
    isObject = u.isObject,
    isRegExp = u.isRegExp,
    identity = u.identity

module.exports = Underarm
function Underarm(obj, func, args) {
  Producer.call(this)

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
}
Underarm.prototype = new Producer()
var P = Underarm.prototype

var _r = function(obj) {
  return chain(obj)
}
Underarm._r = _r;

Underarm.chain = Producer.chain = chain
function chain(obj){
  return (obj instanceof Underarm) ? obj : new Underarm(obj)
}

P._unwrap = _unwrap
function _unwrap(){
  /*jshint validthis:true*/
  return (this instanceof Underarm) ? this.value() : this
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
      if(_r !== obj){
        _r[name] = func
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

Underarm.produce = produce
function produce(deleg, context, next, complete, error){
  var producer = new Producer()
    , delegate = Producer.wrap(deleg)

  producer.onSubscribe = function(consumer){
    var wrap = function(wrapped){
        return function(value){
          wrapped.call(context, consumer, value)
        }
      }
    , defaults = produce.defaults
    , nextW = wrap(isFunction(next) ? next : defaults.next)
    , completeW = wrap(isFunction(complete) ? complete : defaults.complete)
    , errorW = wrap(isFunction(error) ? error : defaults.error)

    return delegate.subscribe(nextW, completeW, errorW)
  }

  return producer
}
produce.defaults = {
    next: function(consumer, value){consumer.next(value)}
  , complete: function(consumer){consumer.complete()}
  , error: function(consumer, err){consumer.error(err)}
}

Underarm.produceOnComplete = produceOnComplete
function produceOnComplete(producer, context, complete, error){
  var values = []
  return produce(
        producer
      , context
      , function(consumer, value){
          push.call(values, value)
        }
      , function(consumer){
          complete(consumer, values)
        }
      , error)
}

Underarm.iteratorCall = iteratorCall
function iteratorCall(iterator, value, context){
  if(isFunction(iterator)){
    return iterator.call(context, value)
  }

  if(isProducer(iterator)){
    return chain(iterator).attach(value)
  }

  if(isRegExp(iterator)){
    return iterator.exec(value)
  }

  if(isArray(iterator)){
    var defer = when.defer()
      , results = []
      , count = iterator.length
    forEach.call(iterator, function(it, i){
      chain(it).attach(value).then(function(res){
        results[i] = res
        if(!--count) defer.resolve(results)
      })
    })
    return defer.promise
  }

  return iterator
}

Underarm.produceWithIterator = produceWithIterator
function produceWithIterator(producer, context, iterator, iterate, iterComplete, error){
  if(isUndefined(iterator)){
    iterator = identity
  }

  if(!isFunction(iterComplete)){
    iterComplete = produce.defaults.complete
  }

  var promisesCount = 0
    , completeConsumer
    , completeContext
    , complete = function(consumer){
        completeContext = this
        completeConsumer = consumer
        if(!promisesCount){
          iterComplete.call(completeContext, consumer)
        }
      }
    , promiseCountdown = function(){
        promisesCount--
        if(!promisesCount && !isUndefined(completeConsumer)){
          complete.call(completeContext, completeConsumer)
        }
      }
    , next = function(consumer, value){
        var result

        if(!consumer.disposed){
          try {
            result = iteratorCall(iterator, value, context)

            if(when.isPromise(result)){
              promisesCount++
              when(result, function(resolved){
                    iterate(consumer, value, resolved)
                    promiseCountdown()
                  }
                , function(err){consumer.error(err)})
            } else {
              iterate(consumer, value, result)
            }
          } catch(e){
            consumer.error(e)
          }
        }
      }
  return produce(producer, context, next, complete, error)
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
              forEach.call(result, iterator, context)
            } else if(isObject(singleValue)){
              forIn.call(singleValue, iterator, context)
            } else {
              iterator.call(context, singleValue, 0, result)
            }
          }
        }
      })
  return this.subscribe(consumer)
}
