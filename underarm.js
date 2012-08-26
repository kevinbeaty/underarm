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
  , _min = Math.min
  , _max = Math.max
  , _has = function(obj, key) {
    return obj && hasOwnProp.call(obj, key)
  }
  , _push = ArrayProto.push
  , _slice = ArrayProto.slice
  , _splice = ArrayProto.splice
  , _unshift = ArrayProto.unshift
  , _indexOf = ArrayProto.indexOf || function(obj){
    var i = 0
      , len = this.length
    for(; i < len; i++){
      if(this[i] === obj){
        return i
      }
    }
    return -1
  }
  , _removeFrom = function(array, value){
      var idx = _indexOf.call(array, value)
      if(idx >= 0){
        _splice.call(array, idx, 1)
      }
  }
  , _sortedIndex = function(array, obj, iterator) {
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
  P.producesObject = false

  P.subscribe = subscribe
  function subscribe(next, complete, error){
    var consumer = new Consumer(next, complete, error)
      , producer = this

    _push.call(producer.consumers, consumer)
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
    _removeFrom(this.consumers, consumer)
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
      _push.call(this.onDisposes, onDispose)
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

function isProducer(producer){
  return producer instanceof Producer
      || producer instanceof Promise
      || producer instanceof Underarm
}

function producerWrap(delegate){
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

    if(isObject(delegate)){
      producer.producesObject = true
    }
  }
  return producer
}

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
            if(isFunction(iterator)){
              result = iterator.call(context, value)
            } else {
              result = chain(iterator).attach(value)
            }

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
    , self = produce(
        producer
      , context
      , function(consumer, value){
          if(!initial){
            memo = value
            initial = true
          } else {
            memo = iterator.call(context, memo, value)
          }
        }
      , function(consumer){
          self.producesObject = isObject(memo)
          consumer.next(memo)
          consumer.complete()
        })
  return self
}

_r.reduceRight = _r.foldr = reduceRight
function reduceRight(producer, iterator, memo, context){
  var initial = arguments.length > 2
    , values = []
    , self = produce(
        producer
      , context
      , function(consumer, value){
          _push.call(values, value)
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
          }
          self.producesObject = isObject(memo)
          consumer.next(memo)
          consumer.complete()
        })
  return self
}

_r.find = _r.detect = find
function find(producer, iterator, context){
  var self = produceWithIterator(
        producer
      , context
      , iterator
      , function(consumer, value, found){
          if(found){
            self.producesObject = isObject(value)
            consumer.next(value)
            consumer.complete()
          }
        })
  return self
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
        if(!passes){
          consumer.next(false)
          consumer.complete()
        }
      }
    , function(consumer){
        consumer.next(true)
        consumer.complete()
      })
}

_r.any = _r.some = any
function any(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, passes){
        if(passes){
          consumer.next(true)
          consumer.complete()
        }
      }
    , function(consumer){
        consumer.next(false)
        consumer.complete()
      })
}

_r.include = _r.contains = include
function include(producer, obj, context){
  return any(producer, function(value){return value === obj}, context)
}

_r.invoke = _r.call = invoke
function invoke(producer, method){
  var args = _slice.call(arguments, 2);
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
      }
    , function(consumer){
        consumer.next(max.value)
        consumer.complete()
      })
}

_r.min = min
function min(producer, iterator, context){
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
      }
    , function(consumer){
        consumer.next(min.value)
        consumer.complete()
      })
}

_r.sortBy = sortBy
function sortBy(producer, val, context){
  var values = []
  return produce(
      producer
    , context
    , function(consumer, value){
        var iterator = lookupIterator(value, val)
        _splice.call(values, _sortedIndex(values, value, iterator), 0, value)
      }
    , function(consumer){
        var i = 0
          , len = values.length
        for(; i < len; i++){
          consumer.next(values[i])
        }
        consumer.complete()
      })
}

_r.sort = sort
function sort(producer, context){
  return sortBy(producer, identity, context)
}

_r.groupBy = groupBy
function groupBy(producer, val, context){
  var groups = {}
    , self = produce(
        producer
      , context
      , function(consumer, value){
          var iterator = lookupIterator(value, val)
            , key = iterator.call(context, value)
            , group = groups[key]
          if(isUndefined(group)){
            group = []
            groups[key] = group
          }
          _push.call(group, value)
        }
      , function(consumer){
          consumer.next(groups)
          consumer.complete()
        })
    self.producesObject = true
    return self
}

_r.toArray = toArray
function toArray(producer){
  return reduce(
      producer
    , function(memo, val){
        _push.call(memo, val)
        return memo
      }
    , [])
}

_r.size = size
function size(producer){
  return reduce(producer, function(memo, val){return memo+1}, 0)
}

_r.slice = slice
function slice(producer, begin, end){
  var index = 0
    , hasEnd = !isUndefined(end)

  if(begin >= 0 && (!hasEnd || end >= 0)){
    return produce(
        producer
      , null
      , function(consumer, value){
          if(index++ >= begin){
            consumer.next(value)
          }

          if(hasEnd && index === end){
            consumer.complete()
          }
        })
  }

  var results = []
  return produce(
        producer
      , null
      , function(consumer, value){
          _push.call(results, value)
        }
      , function(consumer){
          var i = 0
            , len = results.length

          begin = begin < 0 ? len + begin : begin
          end = !hasEnd ? len : (end < 0 ? len + end : end)

          for(i = _max(0, begin); i < _min(len, end); i++){
            consumer.next(results[i])
          }
          consumer.complete()
        })
}

_r.first = _r.head = first
function first(producer, n){
  return slice(producer, 0, isUndefined(n) ? 1 : n)
}

_r.initial = initial
function initial(producer, n){
  return slice(producer, 0, isUndefined(n) ? -1 : -n);
}

_r.last = last
function last(producer, n){
  return slice(producer, isUndefined(n) ? -1 : -n)
}

_r.rest = _r.tail = rest
function rest(producer, n){
  return slice(producer, isUndefined(n) ? 1 : n)
}

_r.compact = compact
function compact(producer){
  return filter(producer, function(val){return !!val})
}

_r.without = without
function without(producer){
  var values = _slice.call(arguments, 1)
  return reject(function(val){return _indexOf.call(values, val) >= 0})
}

_r.seq = seq
function seq(producer, context){
  return produce(
      producer
    , context
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
            if(_has(value, key)){
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
    , self = produce(
        producer
      , context
      , function(consumer, value){
          var iterator = lookupIterator(value, val)
            , entry = iterator.call(context, value)
          if(isArray(entry)){
            if(entry.length === 2){
              zipped[entry[0]] = entry[1]
            } else {
              zipped[entry[0]] = _slice.call(entry, 1)
            }
          } else {
            zipped[entry] = value
          }
        }
      , function(consumer){
          consumer.next(zipped)
          consumer.complete()
        })
  self.producesObject = true
  return self
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
          var args = _slice.call(arguments)
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
      _push.call(stack, node)
      node = node._parent
      if(!isUndefined(node._wrapped)){
        result = node._wrapped
        attached = !node._detached
        break
      }
    }

    while(node = stack.pop()){
      args = _slice.call(node._args)
      _unshift.call(args, result)
      result = node._func.apply(_r, args)
      if(attached){
        node._wrapped = producerWrap(result)
      }
    }
  }
  return result
}

UnderProto.subscribe = function(next, complete, error){
  return unwrap(this).subscribe(next, complete, error)
}

UnderProto.resolve = function(result){
  return unwrap(this).resolve(result)
}

UnderProto.error = function(result){
  return unwrap(this).error(result)
}

UnderProto.next = function(result){
  return unwrap(this).next(result)
}

UnderProto.complete = function(){
  return unwrap(this).complete()
}

_r.then = then
function then(producer, callback, errback, progback, context){
  return chain(producer).then(callback, errback, progback, context)
}

UnderProto.then = function(callback, errback, progback, context){
  var nextPromise = promise()
    , lastResult

  unwrap(this).subscribe(
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

_r.each = _r.forEach = each
function each(producer, iterator, context){
  return chain(producer).each(iterator, context)
}

UnderProto.each = UnderProto.forEach = function(iterator, context){
  var self = unwrap(this)
    , result = []
  return self.subscribe(
      function(next){
        _push.call(result, next)
      }
    , function(){
        var key = 0
          , len = result.length
        if(!self.producesObject){
          for(; key < len; key++){
            iterator.call(context, result[key], key, result)
          }
        } else if(len){
          result = result[0]
          for(key in result){
            if(_has(result, key)){
              iterator.call(context, result[key], key, result)
            }
          }

        }
      })
}

})(this)
