;(function(root){
"use strict";

var _r = function(obj) {
  return new Underarm(obj)
}

if (typeof exports !== 'undefined') {
  exports._r = _r
} else {
  root['_r'] = _r
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


var Producer = (function(){
  function Producer(){
    this.subscribers = []
  }
  var P = Producer.prototype

  P.onSubscribe = null

  P.subscribe = subscribe
  function subscribe(next, complete, error){
    var subscriber = new Subscriber(next, complete, error)
      , producer = this

    push.call(producer.subscribers, subscriber)
    subscriber.onDispose(function(){
      producer.unsubscribe(subscriber)
    })

    if(producer.onSubscribe){
      var disposable = producer.onSubscribe(subscriber)
      if(!isUndefined(disposable)){
        if(isFunction(disposable)){
          subscriber.onDispose(disposable)
        } else if(isFunction(disposable.dispose)){
          subscriber.onDispose(function(){
            disposable.dispose()
          })
        }
      }
    }

    return subscriber
  }

  P.unsubscribe = unsubscribe
  function unsubscribe(subscriber){
    removeFrom(this.subscribers, subscriber)
  }

  return Producer
})()

var Subscriber = (function(){
  function Subscriber(next, complete, error){
    appendToMethod(this, 'next', next)
    appendToMethod(this, 'complete', complete)
    appendToMethod(this, 'error', error)
    this.disposed = false
    this.onDisposes = []
  }
  var P = Subscriber.prototype

  P.next = next
  function next(value){
  }

  P.error = error
  function error(err){
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

  return Subscriber
})()


var Subject = (function(){
  function Subject(){
    this.producer = new Producer()
    this.disposed = false
  }
  var P = Subject.prototype

  P.subscribe = subscribe
  function subscribe(next, complete, error){
    return this.producer.subscribe(next, complete, error)
  }

  P.next = next
  function next(value){
    eachSubscriber(this, 'next', value)
  }

  P.error = error
  function error(error){
    eachSubscriber(this, 'error', error)
  }

  P.complete = complete
  function complete(){
    eachSubscriber(this, 'complete')
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
    eachSubscriber(this, 'dispose')
  }

  function eachSubscriber(target, action, val){
    var i = 0
      , subscribers = target.producer.subscribers
    for(; i < subscribers.length; i++){
      subscribers[i][action](val)
    }
  }

  return Subject
})()
_r.subject = function(){return new Subject()}

_r.then = then
function then(subject, callback, errback, progback, context){
  var lastResult
    , promise = new Subject()

  subject.subscribe(
      function(result){
        if(isFunction(progback)){
          progback(result)
        }
        lastResult = result
      }
    , function(){
        if(isFunction(callback)){
          callback(lastResult)
        }
        promise.resolve(lastResult)
      }
    , function(err){
        if(isFunction(errback)){
          errback(err)
        }
        promise.error(err)
      })

  return chain(promise)
}

function isProducer(producer){
  return !isUndefined(producer) && (producer instanceof Producer || producer instanceof Subject)
}

function producerWrap(delegate){
  delegate = unwrap(delegate)
  var producer
  if(isProducer(delegate)){
    producer = delegate
  } else if(isUndefined(delegate)){
    producer = new Subject()
  } else if(isFunction(delegate)){
    producer = new Producer()
    producer.onSubscribe = delegate
  } else {
    producer = new Producer()
    producer.onSubscribe = function(subscriber){
      subscriber.next(delegate)
      subscriber.complete()
    }
  }
  return producer
}

function produce(delegate, context, next, complete, error){
  var producer = new Producer()
    , delegate = producerWrap(delegate)

  producer.onSubscribe = function(subscriber){
    var wrap = function(wrapped){
        return function(value){
          wrapped.call(context, subscriber, value)
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
    next: function(subscriber, value){subscriber.next(value)}
  , complete: function(subscriber){subscriber.complete()}
  , error: function(subscriber, err){subscriber.error(err)}
}

function produceWithIterator(subject, context, iterator, iterate, complete, error){
  var next = function(subscriber, value){
    if(!subscriber.disposed){
      try {
          iterate(subscriber, value, iterator.call(context, value))
      } catch(e){
        subscriber.error(e)
      }
    }
  }
  return produce(subject, context, next, complete, error)
}

_r.each = _r.forEach = each
function each(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(subscriber, value){
        subscriber.next(value)
      })
}

_r.map = _r.collect = map
function map(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(subscriber, value, result){
        subscriber.next(result)
      })
}

_r.reduce = _r.foldl = _r.inject = reduce
function reduce(subject, iterator, memo, context){
  var initial = arguments.length > 2
  return produceWithIterator(
      subject
    , context
    , identity
    , function(subscriber, value){
        if(!initial){
          memo = value
          initial = true
        } else {
          memo = iterator.call(context, memo, value)
        }
        subscriber.next(memo)
      })
}

_r.reduceRight = _r.foldr = reduceRight
function reduceRight(subject, iterator, memo, context){
  var initial = arguments.length > 2
    , values = []
  return produceWithIterator(
      subject
    , context
    , identity
    , function(subscriber, value){
        values.push(value)
      }
    , function(subscriber){
        var i = values.length - 1
        for(; i >= 0; i--){
          if(!initial){
            memo = values[i]
            initial = true
          } else {
            memo = iterator.call(context, memo, values[i])
          }
          subscriber.next(memo)
        }
        subscriber.complete()
      })
}

_r.find = _r.detect = find
function find(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(subscriber, value, found){
        if(found){
          subscriber.next(value)
          subscriber.complete()
        }
      })
}

_r.filter = _r.select = filter
function filter(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(subscriber, value, keep){
        if(keep) subscriber.next(value)
      })
}

_r.reject = reject
function reject(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(subscriber, value, ignore){
        if(!ignore) subscriber.next(value)
      })
}

_r.every = _r.all = every
function every(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(subscriber, value, passes){
        subscriber.next(passes)
        if(!passes){
          subscriber.complete()
        }
      })
}

_r.any = _r.some = any
function any(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(subscriber, value, passes){
        subscriber.next(passes)
        if(passes){
          subscriber.complete()
        }
      })
}

_r.include = _r.contains = include
function include(subject, obj, context){
  return any(subject, function(value){return value === obj}, context)
}

_r.invoke = _r.call = invoke
function invoke(subject, method){
  var args = slice.call(arguments, 2);
  return map(subject, function(value){
      return (isFunction(method) ? method : value[method]).apply(value, args)
  })
}

_r.pluck = _r.get = pluck
function pluck(subject, key){
  return map(subject, function(value){return value[key]})
}

_r.max = max
function max(subject, iterator, context){
  if(isUndefined(iterator)){
    iterator = identity
  }

  var max = {computed: -Infinity}
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(subscriber, value, computed){
        if(computed > max.computed){
          max.value = value
          max.computed = computed
        }
        subscriber.next(max.value)
      })
}

_r.min = min
function min(subject, iterator, context){
  if(isUndefined(iterator)){
    iterator = identity
  }

  var min = {computed: Infinity}
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(subscriber, value, computed){
        if(computed < min.computed){
          min.value = value
          min.computed = computed
        }
        subscriber.next(min.value)
      })
}

_r.sortBy = sortBy
function sortBy(subject, val, context){
  var values = []
  return produceWithIterator(
      subject
    , context
    , identity
    , function(subscriber, value){
        var iterator = lookupIterator(value, val)
        splice.call(values, sortedIndex(values, value, iterator), 0, value)
      }
    , function(subscriber){
        var i = 0
          , len = values.length
        for(; i < len; i++){
          subscriber.next(values[i])
        }
        subscriber.complete()
      })
}

_r.sort = sort
function sort(subject, context){
  return sortBy(subject, identity, context)
}

_r.groupBy = groupBy
function groupBy(subject, val, context){
  var groups = {}
  return produceWithIterator(
      subject
    , context
    , identity
    , function(subscriber, value){
        var iterator = lookupIterator(value, val)
          , key = iterator.call(context, value)
          , group = groups[key]
        if(isUndefined(group)){
          group = []
          groups[key] = group
        }
        group.push(value)
      }
    , function(subscriber){
        var key
        for(key in groups){
          if(has(groups, key)){
            subscriber.next([key, groups[key]])
          }
        }
        subscriber.complete()
      })
}

_r.seq = seq
function seq(subject, context){
  return produceWithIterator(
      subject
    , context
    , identity
    , function(subscriber, value){
        if(isArray(value)){
          var i = 0
            , len = value.length
          for(; i < len; i++){
            subscriber.next(value[i])
          }
        } else if(isObject(value)){
          var key
          for(key in value){
            if(has(value, key)){
              subscriber.next([key, value[key]])
            }
          }
        } else {
          subscriber.next(value)
        }
    })
}

_r.zipMap = zipMap
function zipMap(subject, context){
  var zipped = {}
  return produceWithIterator(
      subject
    , context
    , identity
    , function(subscriber, value){
        zipped[value[0]] = value[1]
    }
    , function(subscriber){
      subscriber.next(zipped)
      subscriber.complete()
    })
}

function Underarm(obj) {
  this._wrapped = producerWrap(obj)
}

function unwrap(obj){
  return (obj instanceof Underarm) ? obj._wrapped : obj
}

_r.mixin = mixin
function mixin(obj) {
  var name
    , func
    , addToWrapper = function(name, func){
        Underarm.prototype[name] = function() {
          var args = slice.call(arguments)
            , result
          unshift.call(args, this._wrapped)
          result = func.apply(_r, args)
          return (this._chain ? _r(result).chain() : result)
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

_r.chain = chain
function chain(obj){
  return _r(obj).chain()
}

var UnderProto = Underarm.prototype
UnderProto.chain = function(){
  this._chain = true
  return this
}

UnderProto.value = function(){
  return this._wrapped
}

UnderProto.subscribe = function(next, complete, error){
  return this._wrapped.subscribe(next, complete, error)
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

})(this)
