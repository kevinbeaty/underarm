/* underarm v0.0.1 | http://simplectic.com/underarm | License: MIT */
;(function(root){
"use strict";

var _r = function(obj) {
  return chain(obj)
}

_r.VERSION = '0.0.1';

var old_r = root._r

if (typeof exports !== 'undefined') {
  exports._r = _r
} else {
  root['_r'] = _r
}

_r.noConflict = noConflict
function noConflict(){
  root._r = old_r
  return _r
}

_r.identity = identity
function identity(value){
  return value
}

var ObjectProto = Object.prototype
  , ArrayProto = Array.prototype
  , toString = ObjectProto.toString
  , hasOwnProp = ObjectProto.hasOwnProperty
  , isArray = Array.isArray || function(obj) {
      return toString.call(obj) == '[object Array]'
  }
  , isUndefined = function(obj) {
      return obj === void 0
  }
  , isObject = function(obj) {
      return obj === Object(obj)
  }
  , isFunction = function(obj){
      return toString.call(obj) == '[object Function]'
  }
  , has = function(obj, key) {
    return obj && hasOwnProp.call(obj, key)
  }
  , push = ArrayProto.push
  , slice = ArrayProto.slice
  , splice = ArrayProto.splice
  , unshift = ArrayProto.unshift
  , indexOf = ArrayProto.indexOf || function(obj){
    var i = 0
      , len = this.length
    for(; i < len; i++){
      if(this[i] === obj){
        return i
      }
    }
    return -1
  }
  , removeFrom = function(array, value){
      var idx = indexOf.call(array, value)
      if(idx >= 0){
        splice.call(array, idx, 1)
      }
  }
  , sortedIndex = function(array, obj, iterator) {
      iterator = iterator ? iterator : identity
      var value = iterator(obj)
        , low = 0
        , high = array.length
        , mid

      while (low < high) {
        mid = (low + high) >> 1
        if(iterator(array[mid]) < value){
          low = mid + 1
        } else {
          high = mid
        }
      }
      return low
  }
  , lookupIterator = function(obj, val) {
    return isFunction(val) ? val : function(obj){return obj[val]}
  }
  , console = root.console || {
        log:identity
      , error:identity
    }
  , errorHandler = function(err){
      if(isFunction(console.error)){
        console.error(err)
      } else if(isFunction(console.log)){
        console.log(err)
      }
    }

_r.defaultErrorHandler = defaultErrorHandler
function defaultErrorHandler(handler){
  errorHandler = handler
}

var Producer = (function(){
  function Producer(){
    this.consumers = []
  }
  var P = Producer.prototype

  P.onSubscribe = null

  P.subscribe = subscribe
  function subscribe(next, complete, error){
    var consumer = new Consumer(next, complete, error)
      , producer = this

    push.call(producer.consumers, consumer)
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
    removeFrom(this.consumers, consumer)
  }

  return Producer
})()

var Consumer = (function(){
  function Consumer(next, complete, error){
    appendToMethod(this, 'next', next)
    appendToMethod(this, 'complete', complete)
    appendToMethod(this, 'error', error)
    this.disposed = false
    this.onDisposes = []
  }
  var P = Consumer.prototype

  P.next = next
  function next(value){
  }

  P.error = error
  function error(err){
    errorHandler(err)
    this.dispose()
  }

  P.complete = complete
  function complete(){
    this.dispose()
  }

  P.resolve = resolve
  function resolve(value){
    if(!isUndefined(value)){
      this.next(value)
    }
    this.complete()
  }

  P.dispose = dispose
  function dispose(){
    var onDisposes = this.onDisposes
      onDispose = onDisposes.pop()
    while(onDispose){
      onDispose()
      onDispose = onDisposes.pop()
    }
    this.disposed = true
  }

  P.onDispose = onDispose
  function onDispose(onDispose){
    if(this.disposed){
      onDispose()
    } else {
      this.onDisposes.push(onDispose)
    }
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

  return Consumer
})()


var Promise = (function(){
  function Promise(){
    this.producer = new Producer()
  }
  var P = Promise.prototype

  P.disposed = false
  P.unfulfilled = true
  P.fulfilled = false
  P.failed = false

  P.subscribe = subscribe
  function subscribe(next, complete, error){
    return this.producer.subscribe(next, complete, error)
  }

  P.next = next
  function next(value){
    if(this.unfulfilled){
      eachConsumer(this, 'next', value)
      this.value = value
    }
  }

  P.error = error
  function error(error){
    if(this.unfulfilled){
      eachConsumer(this, 'error', error)
      this.unfulfilled = false
      this.failed = true
    }
  }

  P.complete = complete
  function complete(){
    if(this.unfulfilled){
      eachConsumer(this, 'complete')
      this.unfulfilled = false
      this.fulfilled = true
    }
  }

  P.resolve = resolve
  function resolve(value){
    if(!isUndefined(value)){
      this.next(value)
    }
    this.complete()
  }

  P.dispose = dispose
  function dispose(){
    this.disposed = true
    eachConsumer(this, 'dispose')
  }

  function eachConsumer(target, action, val){
    var i = 0
      , consumers = target.producer.consumers
    for(; i < consumers.length; i++){
      consumers[i][action](val)
    }
  }

  return Promise
})()

_r.promise = promise
function promise(producer){
  var promise = new Promise()
  if(!isUndefined(producer)){
    producer = producerWrap(producer)
    producer.subscribe(
        function(value){
          promise.next(value)
        }
      , function(){
          promise.complete()
        }
      , function(err){
          promise.error(err)
        })
  }
  return chain(promise)
}

function isProducer(producer){
  return (producer instanceof Producer || producer instanceof Promise)
}

function producerWrap(delegate){
  delegate = unwrap(delegate)
  var producer
  if(isProducer(delegate)){
    producer = delegate
  } else if(isFunction(delegate)){
    producer = new Producer()
    producer.onSubscribe = delegate
  } else if(isArray(delegate)){
    producer = new Producer()
    producer.onSubscribe = function(consumer){
      var i = 0
        , len = delegate.length
      for(; i < len; i++){
        consumer.next(delegate[i])
      }
      consumer.complete()
    }
  } else {
    producer = new Producer()
    producer.onSubscribe = function(consumer){
      consumer.next(delegate)
      consumer.complete()
    }
  }
  return producer
}

function produce(delegate, context, next, complete, error){
  var producer = new Producer()
    , delegate = producerWrap(delegate)

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

function produceWithIterator(producer, context, iterator, iterate, iterComplete, error){
  if(!isFunction(iterComplete)){
    iterComplete = produce.defaults.complete
  }

  var promisesCount = 0
    , completeConsumer
    , completeContext
    , complete = function(consumer){
        completeContext = this
        completeConsumer = consumer
        if(promisesCount === 0){
          iterComplete.call(completeContext, consumer)
        }
      }
    , promiseCountdown = function(){
        promisesCount--
        if(promisesCount === 0 && !isUndefined(completeConsumer)){
          complete.call(completeContext, completeConsumer)
        }
      }
    , next = function(consumer, value){
        var result

        if(!consumer.disposed){
          try {
            result = unwrap(iterator.call(context, value))
            if(!isProducer(result)){
              iterate(consumer, value, result)
            } else {
              promisesCount++
              chain(result)
                .then(
                    function(resolved){iterate(consumer, value, resolved)}
                  , function(err){consumer.error(err)})
                .then(promiseCountdown)
            }
          } catch(e){
            consumer.error(e)
          }
        }
      }
  return produce(producer, context, next, complete, error)
}

_r.each = _r.forEach = each
function each(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value){
        consumer.next(value)
      })
}

_r.map = _r.collect = map
function map(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, result){
        consumer.next(result)
      })
}

_r.reduce = _r.foldl = _r.inject = reduce
function reduce(producer, iterator, memo, context){
  var initial = arguments.length > 2
  return produceWithIterator(
      producer
    , context
    , identity
    , function(consumer, value){
        if(!initial){
          memo = value
          initial = true
        } else {
          memo = iterator.call(context, memo, value)
        }
        consumer.next(memo)
      })
}

_r.reduceRight = _r.foldr = reduceRight
function reduceRight(producer, iterator, memo, context){
  var initial = arguments.length > 2
    , values = []
  return produceWithIterator(
      producer
    , context
    , identity
    , function(consumer, value){
        values.push(value)
      }
    , function(consumer){
        var i = values.length - 1
        for(; i >= 0; i--){
          if(!initial){
            memo = values[i]
            initial = true
          } else {
            memo = iterator.call(context, memo, values[i])
          }
          consumer.next(memo)
        }
        consumer.complete()
      })
}

_r.find = _r.detect = find
function find(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, found){
        if(found){
          consumer.next(value)
          consumer.complete()
        }
      })
}

_r.filter = _r.select = filter
function filter(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, keep){
        if(keep) consumer.next(value)
      })
}

_r.reject = reject
function reject(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, ignore){
        if(!ignore) consumer.next(value)
      })
}

_r.every = _r.all = every
function every(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, passes){
        consumer.next(passes)
        if(!passes){
          consumer.complete()
        }
      })
}

_r.any = _r.some = any
function any(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, passes){
        consumer.next(passes)
        if(passes){
          consumer.complete()
        }
      })
}

_r.include = _r.contains = include
function include(producer, obj, context){
  return any(producer, function(value){return value === obj}, context)
}

_r.invoke = _r.call = invoke
function invoke(producer, method){
  var args = slice.call(arguments, 2);
  return map(producer, function(value){
      return (isFunction(method) ? method : value[method]).apply(value, args)
  })
}

_r.pluck = _r.get = pluck
function pluck(producer, key){
  return map(producer, function(value){return value[key]})
}

_r.max = max
function max(producer, iterator, context){
  if(isUndefined(iterator)){
    iterator = identity
  }

  var max = {computed: -Infinity}
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, computed){
        if(computed > max.computed){
          max.value = value
          max.computed = computed
        }
        consumer.next(max.value)
      })
}

_r.min = min
function min(producer, iterator, context){
  if(isUndefined(iterator)){
    iterator = identity
  }

  var min = {computed: Infinity}
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, computed){
        if(computed < min.computed){
          min.value = value
          min.computed = computed
        }
        consumer.next(min.value)
      })
}

_r.sortBy = sortBy
function sortBy(producer, val, context){
  var values = []
  return produceWithIterator(
      producer
    , context
    , identity
    , function(consumer, value){
        var iterator = lookupIterator(value, val)
        splice.call(values, sortedIndex(values, value, iterator), 0, value)
        consumer.next(values)
      })
}

_r.sort = sort
function sort(producer, context){
  return sortBy(producer, identity, context)
}

_r.groupBy = groupBy
function groupBy(producer, val, context){
  var groups = {}
  return produceWithIterator(
      producer
    , context
    , identity
    , function(consumer, value){
        var iterator = lookupIterator(value, val)
          , key = iterator.call(context, value)
          , group = groups[key]
        if(isUndefined(group)){
          group = []
          groups[key] = group
        }
        group.push(value)
        consumer.next(groups)
      })
}

_r.seq = seq
function seq(producer, context){
  return produceWithIterator(
      producer
    , context
    , identity
    , function(consumer, value){
        if(isArray(value)){
          var i = 0
            , len = value.length
          for(; i < len; i++){
            consumer.next(value[i])
          }
        } else if(isObject(value)){
          var key
          for(key in value){
            if(has(value, key)){
              consumer.next([key, value[key]])
            }
          }
        } else {
          consumer.next(value)
        }
    })
}

_r.zipMapBy = zipMapBy
function zipMapBy(producer, val, context){
  var zipped = {}
  return produceWithIterator(
      producer
    , context
    , identity
    , function(consumer, value){
        var iterator = lookupIterator(value, val)
          , entry = iterator.call(context, value)
        if(isArray(entry)){
          if(entry.length === 2){
            zipped[entry[0]] = entry[1]
          } else {
            zipped[entry[0]] = slice.call(entry, 1)
          }
        } else {
          zipped[entry] = value
        }
        consumer.next(zipped)
      })
}

_r.zipMap = zipMap
function zipMap(producer, context){
  return zipMapBy(producer, identity, context)
}

function Underarm(obj, func, args) {
  if(isUndefined(obj)){
    this._detached = true
  } else if(obj instanceof Underarm){
    this._parent = obj
    this._func = func
    this._args = args
  } else {
    this._wrapped = producerWrap(obj)
  }
}

_r.chain = chain
function chain(obj){
  return (obj instanceof Underarm) ? obj : new Underarm(obj)
}

function unwrap(obj){
  return (obj instanceof Underarm) ? obj.value() : obj
}

_r.mixin = mixin
function mixin(obj) {
  var name
    , func
    , addToWrapper = function(name, func){
        Underarm.prototype[name] = function() {
          var args = slice.call(arguments)
          return new Underarm(this, func, args)
        }
      }

  for(name in obj){
    if(isFunction(obj[name])){
      func = obj[name]
      _r[name] = func
      addToWrapper(name, func)
    }
  }
}

_r.mixin(_r)

var UnderProto = Underarm.prototype

UnderProto.attach = function(producer){
  var node = this
  do {
    if(node._detached){
      node._wrapped = producerWrap(producer)
      break
    }
  } while(node = node._parent)
  return this
}

UnderProto.value = function(){
  var result = this._wrapped
  if(isUndefined(result)){
    var stack = []
      , node = this
      , result
      , args
      , attached = true

    while(node._parent){
      stack.push(node)
      node = node._parent
      if(!isUndefined(node._wrapped)){
        result = node._wrapped
        attached = !node._detached
        break
      }
    }

    while(node = stack.pop()){
      args = slice.call(node._args)
      unshift.call(args, result)
      result = node._func.apply(_r, args)
      if(attached){
        node._wrapped = producerWrap(result)
      }
    }
  }
  return result
}

UnderProto.subscribe = function(next, complete, error){
  return this.value().subscribe(next, complete, error)
}

UnderProto.resolve = function(result){
  return this.value().resolve(result)
}

UnderProto.error = function(result){
  return this.value().error(result)
}

UnderProto.next = function(result){
  return this.value().next(result)
}

UnderProto.complete = function(){
  return this.value().complete()
}

_r.then = then
function then(producer, callback, errback, progback, context){
  return chain(producer).then(callback, errback, progback, context)
}

UnderProto.then = function(callback, errback, progback, context){
  var nextPromise = promise()
    , lastResult

  this.subscribe(
      function(result){
        if(isFunction(progback)){
          progback(result)
        }
        nextPromise.next(result)
        lastResult = result
      }
    , function(){
        if(isFunction(callback)){
          callback(lastResult)
        }
        nextPromise.complete()
      }
    , function(err){
        if(isFunction(errback)){
          errback(err, lastResult)
        }
        nextPromise.error(err)
      })

  return nextPromise
}

})(this)
