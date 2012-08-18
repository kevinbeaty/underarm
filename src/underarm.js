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
    return hasOwnProp.call(obj, key)
  }
  , push = ArrayProto.push
  , slice = ArrayProto.slice
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
        array.splice(idx, 1)
      }
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

  P.dispose = dispose
  function dispose(){
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

function producerWrap(delegate){
  var producer
  if(delegate instanceof Producer || delegate instanceof Subject){
    producer = delegate
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

_r.identity = identity
function identity(value){
  return value
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
      }
    , function(subscriber){
        subscriber.next(memo)
        subscriber.complete()
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
        }
        subscriber.next(memo)
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
        if(!passes){
          subscriber.next(false)
          subscriber.complete()
        }
      }
    , function(subscriber){
        subscriber.next(true)
        subscriber.complete()
    })
}

_r.any = _r.some = any
function any(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(subscriber, value, passes){
        if(passes){
          subscriber.next(true)
          subscriber.complete()
        }
      }
    , function(subscriber){
        subscriber.next(false)
        subscriber.complete()
    })
}

_r.include = _r.contains = include
function include(subject, obj, context){
  return any(subject, function(value){return value === obj}, context)
}

_r.invoke = invoke
function invoke(subject, method){
  var args = slice.call(arguments, 2);
  return map(subject, function(value){
      return (isFunction(method) ? method : value[method]).apply(value, args)
  })
}

_r.pluck = pluck
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
      }
    , function(subscriber){
        subscriber.next(max.value)
        subscriber.complete()
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
      }
    , function(subscriber){
        subscriber.next(min.value)
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

function Underarm(obj) {
  this._wrapped = producerWrap(obj)
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

_r.chain = function(obj) {
  return _r(obj).chain()
}

var UnderProto = Underarm.prototype
UnderProto.chain = function() {
  this._chain = true
  return this
}

UnderProto.value = function() {
  return this._wrapped
}

UnderProto.subscribe = function(next, complete, error) {
  return this._wrapped.subscribe(next, complete, error)
}

})(this)
