/* underarm v0.0.1 | http://kevinbeaty.net/projects/underarm | License: MIT */
;(function(root){
"use strict";
/*global setTimeout:true, clearTimeout:true */

var _r = function(obj) {
  return chain(obj)
}

_r.VERSION = '0.0.1';

var old_r = root._r

if (typeof exports !== 'undefined') {
  /*global exports:true */
  exports._r = _r
} else {
  root._r = _r
}

var ObjectProto = Object.prototype
  , ArrayProto = Array.prototype
  , toString = ObjectProto.toString
  , hasOwnProp = ObjectProto.hasOwnProperty
  , predicateEqual = function(obj){
      return function(value){
        return value === obj
      }
    }
  , predicateToString = function(str){
      return function(value){
        return toString.call(value) == str
      }
    }
  , isArray = Array.isArray || predicateToString('[object Array]')
  , isUndefined = predicateEqual()
  , isObject = function(obj){return obj === Object(obj)}
  , isFunction = predicateToString('[object Function]')
  , isRegExp = predicateToString('[object RegExp]')
  , _min = Math.min
  , _max = Math.max
  , _has = function(obj, key){return obj && hasOwnProp.call(obj, key)}
  , _pop = ArrayProto.pop
  , _push = ArrayProto.push
  , _slice = ArrayProto.slice
  , _splice = ArrayProto.splice
  , _shift = ArrayProto.shift
  , _unshift = ArrayProto.unshift
  , _concat = ArrayProto.concat
  , __breaker = {}
  , __each = function(iterator, context){
      var i = 0
        , len = this.length
      for(; i < len; i++){
        if(iterator.call(context || this, this[i], i, this) === __breaker){
          break
        }
      }
    }
  , _forEach = ArrayProto.forEach || __each
  , _forIn = function(iterator, context){
      var key
      for(key in this){
        if(_has(this, key)){
          if(iterator.call(context || this, this[key], key, this) === __breaker){
            break
          }
        }
      }
    }
  , _some = ArrayProto.some || function(iterator, context){
      var any = false
      __each.call(this, function(val, i, arr){
        if(iterator.call(context, val, i, arr)){
          any = true
          return __breaker
        }
      }, context)
      return any
    }
  , _every = ArrayProto.every || function(iterator, context){
      var all = true
      __each.call(this, function(val, i, arr){
        if(!iterator.call(context, val, i, arr)){
          all = false
          return __breaker
        }
      }, context)
      return all
    }
  , _indexOf = ArrayProto.indexOf || function(obj, context){
      var idx = -1
      __each.call(this, function(val, i){
        if(val === obj){
          idx = i
          return __breaker
        }
      }, context)
      return idx
    }
  , _inArray = function(array, value){
       return _indexOf.call(array, value) >= 0
    }
  , _removeFrom = function(array, predicate){
      if(!isFunction(predicate)){
        predicate = predicateEqual(predicate)
      }

      var i = 0
        , len = array.length
      for(; i < len; i++){
        if(predicate(array[i], i, array)){
          _splice.call(array, i--, 1)
          len--
        }
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
  , errorHandler = function(err){
      /*global console:true*/
      if(typeof console === 'object'){
        if(isFunction(console.error)){
          console.error(err)
        } else if(isFunction(console.log)){
          console.log(err)
        }
      }
    }
  , _nextTick = function(callback){setTimeout(callback, 0)}


var Producer = (function(){
  /*jshint validthis:true*/
  function Producer(onSubscribe){
    this.consumers = []
    this.onSubscribe = onSubscribe
  }
  var P = Producer.prototype

  P.subscribe = subscribe
  function subscribe(next, complete, error){
    var consumer = consumerWrap(next, complete, error)
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
  /*jshint validthis:true */
  function Consumer(next, complete, error){
    appendToMethod(this, 'next', next)
    appendToMethod(this, 'complete', complete)
    appendToMethod(this, 'error', error)

    this.onDisposes = []
    this.disposed = false
    this.resolveSingleValue = false
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

  P.dispose = dispose
  function dispose(){
    var onDisposes = this.onDisposes
      onDispose = _pop.call(onDisposes)
    while(onDispose){
      onDispose()
      onDispose = _pop.call(onDisposes)
    }
    this.disposed = true
  }

  P.onDispose = onDispose
  function onDispose(onDisp){
    if(isFunction(onDisp)){
      if(this.disposed){
        onDisp()
      } else {
        _push.call(this.onDisposes, onDisp)
      }
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

var Deferred = (function(){
  /*jshint validthis:true */
  function Deferred(){
    Consumer.call(this)

    this.producer = new Producer(function(consumer){
      consumer.resolveSingleValue = true
    })
    this.promise = chain(this.producer)
    this.resolveSingleValue = true

    this.disposed = false
    this.unfulfilled = true
    this.fulfilled = false
    this.failed = false
  }
  Deferred.prototype = new Consumer()

  var P = Deferred.prototype

  P.subscribe = subscribe
  function subscribe(next, complete, error){
    return this.producer.subscribe(next, complete, error)
  }

  P.next = next
  function next(value){
    if(this.unfulfilled){
      eachConsumer(this, 'next', value)
    }
  }

  P.error = error
  function error(err){
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
    this.resolve()
  }

  P.resolve = resolve
  function resolve(value){
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
    this.disposed = true
    eachConsumer(this, 'dispose')
  }

  function eachConsumer(target, action, val){
    var consumers = _slice.call(target.producer.consumers)
    _forEach.call(consumers, function(consumer){
      consumer[action](val)
    })
    Consumer.prototype[action].call(target, val)
  }

  Deferred.extend = function(wrapper, wrapped){
    if(wrapped instanceof Deferred){
      wrapper.promise = wrapped.promise
      _forEach.call(
          ['next', 'complete', 'error', 'resolve', 'dispose', 'onDispose']
        , function(prop){
            wrapper[prop] = function(){wrapped[prop].apply(wrapped, arguments)}
          })
    }
  }

  return Deferred
})()

function singleValueResolve(consumer, value){
  consumer.resolveSingleValue = true
  consumer.next(value)
  consumer.complete()
}

function singleValueResolveValue(obj){
  return function(consumer){
    singleValueResolve(consumer, obj.value)
  }
}

var singleValueResolveUndefined = singleValueResolveValue({})
  , singleValueResolveFalse = singleValueResolveValue({value:false})
  , singleValueResolveTrue = singleValueResolveValue({value:true})
  , singleValueResolveNegativeOne = singleValueResolveValue({value:-1})

function seqNext(consumer, value){
  if(isArray(value)){
    _forEach.call(value, function(val){
      consumer.next(val)
    })
  } else if(isObject(value)){
    _forIn.call(value, function(val, key){
      consumer.next([key, val])
    })
  } else {
    consumer.next(value)
  }
}

function seqNextResolve(value){
  return function(consumer){
    seqNext(consumer, value)
    consumer.complete()
  }
}

function isConsumer(consumer){
  return consumer instanceof Consumer
    || (consumer instanceof Underarm
        && consumer._wrapped instanceof Consumer)
}

function isProducer(producer){
  return producer instanceof Underarm
      || producer instanceof Producer
      || producer instanceof Deferred
}

function consumerWrap(next, complete, error){
  return isConsumer(next)
    ? next
    : new Consumer(next, complete, error)
}

function producerWrap(delegate){
  return isProducer(delegate)
    ? delegate
    : new Producer(
        isArray(delegate)
          ? seqNextResolve(delegate)
          : singleValueResolveValue({value:delegate}))
}

function produce(deleg, context, next, complete, error){
  var producer = new Producer()
    , delegate = producerWrap(deleg)

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

function produceOnComplete(producer, context, complete, error){
  var values = []
  return produce(
        producer
      , context
      , function(consumer, value){
          _push.call(values, value)
        }
      , function(consumer){
          complete(consumer, values)
        }
      , error)
}

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
    var defer = deferred()
      , results = []
      , count = iterator.length
    _forEach.call(iterator, function(it, i){
      chain(it).attach(value).then(function(res){
        results[i] = res
        if(!--count) defer.resolve(results)
      })
    })
    return defer
  }

  return iterator
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
            result = iteratorCall(iterator, value, context)

            if(!isProducer(result)){
              iterate(consumer, value, result)
            } else {
              promisesCount++
              when(result
                , function(resolved){
                    iterate(consumer, value, resolved)
                    promiseCountdown()
                  }
                , function(err){consumer.error(err)})
            }
          } catch(e){
            consumer.error(e)
          }
        }
      }
  return produce(producer, context, next, complete, error)
}

_r.seq = _r.entries = seq
function seq(producer, context){
  return produce(producer, context, seqNext)
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
function reduce(producer, iterator, mem, context){
  var initial = arguments.length > 2
    , memo = {value:mem}
  return produce(
        producer
      , context
      , function(consumer, value){
          if(!initial){
            memo.value = value
            initial = true
          } else {
            memo.value = iterator.call(context, memo.value, value)
          }
        }
      , singleValueResolveValue(memo))
}

function reduceMemoType(MemoType){
  return function(producer, func){
    return reduce(
        producer
      , function(memo, val){
          func.call(memo, val)
          return memo
        }
      , new MemoType())
  }
}
var reduceArray = reduceMemoType(Array)
var reduceObject = reduceMemoType(Object)

_r.reduceRight = _r.foldr = reduceRight
function reduceRight(producer, iterator, memo, context){
  var initial = arguments.length > 2
  return produceOnComplete(
        producer
      , context
      , function(consumer, values){
          var i = values.length - 1
          for(; i >= 0; i--){
            if(!initial){
              memo = values[i]
              initial = true
            } else {
              memo = iterator.call(context, memo, values[i])
            }
          }
          singleValueResolve(consumer, memo)
        })
}

_r.find = _r.detect = find
function find(producer, iterator, context){
  return produceWithIterator(
        producer
      , context
      , iterator
      , function(consumer, value, found){
          if(found) singleValueResolve(consumer, value)
        }
      , singleValueResolveUndefined)
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
        if(!passes) singleValueResolveFalse(consumer)
      }
    , singleValueResolveTrue)
}

_r.any = _r.some = any
function any(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, passes){
        if(passes) singleValueResolveTrue(consumer)
      }
    , singleValueResolveFalse)
}

_r.include = _r.contains = include
function include(producer, obj, context){
  return any(producer, predicateEqual(obj), context)
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
  var mx = {computed: -Infinity}
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, computed){
        if(computed > mx.computed){
          mx.value = value
          mx.computed = computed
        }
      }
    , singleValueResolveValue(mx))
}

_r.min = min
function min(producer, iterator, context){
  var mn = {computed: Infinity}
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, computed){
        if(computed < mn.computed){
          mn.value = value
          mn.computed = computed
        }
      }
    , singleValueResolveValue(mn))
}

_r.sortBy = sortBy
function sortBy(producer, val, context){
  return seq(reduceArray(producer, function(value){
    var iterator = lookupIterator(value, val)
    _splice.call(this, _sortedIndex(this, value, iterator), 0, value)
  }))
}

_r.sort = sort
function sort(producer, context){
  return sortBy(producer, identity, context)
}

_r.groupBy = groupBy
function groupBy(producer, val, context){
  return reduceObject(producer, function(value){
      var iterator = lookupIterator(value, val)
        , key = iterator.call(context, value)
        , group = this[key]
      if(isUndefined(group)){
        group = []
        this[key] = group
      }
      _push.call(group, value)
  })
}

_r.toArray = toArray
function toArray(producer){
  return reduceArray(producer, _push)
}

_r.size = size
function size(producer){
  return reduce(producer, function(memo, val){return memo+1}, 0)
}

_r.reverse = reverse
function reverse(producer){
  return seq(reduceArray(producer, _unshift))
}

_r.slice = slice
function slice(producer, begin, end){
  return sliceWithSingleValueOption(producer, false, begin, end)
}

function sliceWithSingleValueOption(producer, singleValueOption, begin, end){
  var index = 0
    , hasEnd = !isUndefined(end)

  if(begin >= 0 && (!hasEnd || end >= 0)){
    if(singleValueOption && hasEnd && (end - begin === 1)){
      return produce(producer, null, singleValueResolve)
    }

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

  return produceOnComplete(
        producer
      , null
      , function(consumer, results){
          var i = 0
            , len = results.length

          begin = begin < 0 ? len + begin : begin
          end = !hasEnd ? len : (end < 0 ? len + end : end)

          if(singleValueOption && (!hasEnd && begin === len - 1)
              || (hasEnd && (end - begin === 1))){
            singleValueResolve(consumer, results[begin])
          } else {
            for(i = _max(0, begin); i < _min(len, end); i++){
              consumer.next(results[i])
            }
            consumer.complete()
          }
        })
}

_r.first = _r.head = first
function first(producer, n){
  var hasN = isUndefined(n)
  return sliceWithSingleValueOption(producer, hasN, 0, hasN ? 1 : n)
}

_r.initial = initial
function initial(producer, n){
  return slice(producer, 0, isUndefined(n) ? -1 : -n);
}

_r.last = last
function last(producer, n){
  var hasN = isUndefined(n)
  return sliceWithSingleValueOption(producer, hasN, hasN ? -1 : -n)
}

_r.rest = _r.tail = rest
function rest(producer, n){
  return slice(producer, isUndefined(n) ? 1 : n)
}

_r.splice = splice
function splice(producer, index, howMany){
  var idx = 0
    , removeAll = isUndefined(howMany)
    , toAdd = _slice.call(arguments, 3)
    , addToAdd = function(consumer, next){
        if(idx === index
          || (!next && idx < index)){
          seqNext(consumer, toAdd)
        }
        if(!next){
          consumer.complete()
        }
      }
    , consumerNext = function(consumer, value){
        if(idx < index || (!removeAll && idx >= index + howMany)){
          consumer.next(value)
        }
      }

  if(index >= 0){
    return produce(
        producer
      , null
      , function(consumer, value){
          addToAdd(consumer, true)
          consumerNext(consumer, value)

          if(removeAll && idx === index){
            consumer.complete()
          }
          idx++
        }
      , addToAdd)
  }

  return produceOnComplete(
        producer
      , null
      , function(consumer, results){
          var len = results.length
          index = len + index

          for(; idx < len; idx++){
            addToAdd(consumer, true)
            consumerNext(consumer, results[idx])

            if(removeAll && idx === index){
              break
            }
          }
          consumer.complete()
        })
}

_r.pop = pop
function pop(producer){
  return splice(producer, -1, 1)
}

_r.push = push
function push(producer){
  var toPush = _slice.call(arguments, 1)
  return produce(producer, null, null, seqNextResolve(toPush))
}

_r.shift = shift
function shift(producer){
  return splice(producer, 0, 1)
}

_r.unshift = unshift
function unshift(producer){
  /*jshint validthis:true */
  return splice.apply(this
    , _concat.call([producer, 0, 0], _slice.call(arguments, 1)))
}

_r.join = join
function join(producer, separator){
  separator = isUndefined(separator) ? ',' : separator += ''
  return reduce(producer, function(memo, val){return memo+separator+val})
}

_r.indexOf = indexOf
function indexOf(producer, value){
  var idx = 0
  return produceWithIterator(
        producer
      , null
      , predicateEqual(value)
      , function(consumer, value, found){
          if(found) singleValueResolve(consumer, idx)
          idx++
        }
      , singleValueResolveNegativeOne)
}

_r.lastIndexOf = lastIndexOf
function lastIndexOf(producer, value){
  var idx = 0
    , lastIdx = {value: -1}
  return produceWithIterator(
        producer
      , null
      , predicateEqual(value)
      , function(consumer, value, found){
          if(found) lastIdx.value = idx
          idx++
        }
      , singleValueResolveValue(lastIdx))
}

_r.concat = concat
function concat(producer){
  var toConcat = _slice.call(arguments, 1)
    , i = 0
    , len = toConcat.length
    , countdown = function(consumer){
        if(i < len){
          produce(toConcat[i++], null, null, countdown)
            .subscribe(consumer)
        }
        if(i === len){
          consumer.complete()
        }
      }

  return produce(producer, null, null, countdown)
}

_r.compact = compact
function compact(producer){
  return filter(producer, function(val){return !!val})
}

_r.flatten = flatten
function flatten(producer, shallow){
  return produceWithIterator(
      producer
    , null
    , function(val){
        if(isArray(val) || isProducer(val)){
          if(shallow){
            return concat(val)
          }
          return flatten(val)
        }
        return val
      }
    , function(consumer, value, result){
        seqNext(consumer, result)
      })
}

_r.without = without
function without(producer){
  var values = _slice.call(arguments, 1)
  return reject(producer, function(val){return _inArray(values, val)})
}

_r.uniq = _r.unique = unique
function unique(producer, isSorted, iterator, context){
  var last = []
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, result){
        if(!_inArray(last, result)){
          consumer.next(result)
        }
        if(isSorted){
          last[0] = result
        } else {
          _push.call(last, result)
        }
      })
}

_r.union = union
function union(){
  return unique(flatten(_slice.call(arguments), true))
}

_r.intersection = intersection
function intersection(producer){
  var intersected = []
  var toIntersect = _slice.call(arguments, 1)
    , i = 0
    , len = toIntersect.length
    , countdown = function(consumer){
        if(i < len){
          produceOnComplete(
              toIntersect[i++]
            , null
            , function(consumer, values){
                _removeFrom(intersected, function(val){return !_inArray(values, val)})
                if(!intersected.length){
                  consumer.complete()
                } else {
                  countdown(consumer)
                }
              })
            .subscribe(consumer)
        }
        if(i === len){
          seqNext(consumer, intersected)
          consumer.complete()
        }
      }

  return produce(
      producer
    , null
    , function(consumer, value){
        if(!_inArray(intersected, value)){
          _push.call(intersected, value)
        }
      }
    , countdown)
}

_r.difference = difference
function difference(producer){
  var toSubtract = _slice.call(arguments, 1)
    , i = 0
    , len = toSubtract.length
    , diffed
    , countdown = function(consumer, result){
        if(result) diffed = result

        if(i < len){
          produce(
              toSubtract[i++]
            , null
            , function(consumer, value){
                _removeFrom(diffed, value)
                if(!diffed.length) consumer.complete()
              }
            , countdown)
          .subscribe(diffed)
        }
        if(i === len){
          seqNext(consumer, diffed)
          consumer.complete()
        }
      }
  return produceOnComplete(producer, null, countdown)
}

_r.zip = zip
function zip(){
  var producer = new Producer()
    , toZips = _slice.call(arguments)

  producer.onSubscribe = function(consumer){
    var delegates = []
      , completeDepth = Infinity
      , checkComplete = function(){
          var readyForComplete = delegates.length === toZips.length
            && _every.call(delegates, function(other){
                  return other.depth >= completeDepth
                })
          if(readyForComplete){
            consumer.complete()
          }
        }
      , next = function(delegate, val){
          _push.call(delegate.values, val)
          delegate.depth++

          var readyForNext = delegates.length === toZips.length
            && _every.call(delegates, function(other){
                  return other.values.length
                })

          if(readyForNext){
            var zipped = []
            _forEach.call(delegates, function(delegate){
              _push.call(zipped, _shift.call(delegate.values))
            })
            consumer.next(zipped)
          }
          checkComplete()
        }
      , complete = function(delegate){
          if(delegate.depth < completeDepth){
            completeDepth = delegate.depth
          }
          checkComplete()
        }

    _forEach.call(toZips, function(toZip, i){
      var delegate = delegates[i] = {
            producer: producerWrap(toZip)
          , values: []
          , depth: 0
          }
       , dispose = delegate.producer.subscribe(
          function(val){next(delegate, val)}
        , function(){complete(delegate)}
        , function(err){consumer.error(err)}
        )
      consumer.onDispose(dispose)
    })
  }
  return producer
}

_r.zipObjectBy = zipObjectBy
function zipObjectBy(producer, val, context){
  return reduceObject(producer, function(value){
      var iterator = lookupIterator(value, val)
        , entry = iterator.call(context, value)
      if(isArray(entry)){
        if(entry.length === 2){
          this[entry[0]] = entry[1]
        } else {
          this[entry[0]] = _slice.call(entry, 1)
        }
      } else {
        this[entry] = value
      }
  })
}

_r.zipObject = zipObject
function zipObject(producer, context){
  return zipObjectBy(producer, identity, context)
}

_r.keys = keys
function keys(producer){
  return pluck(seq(producer), 0)
}

_r.values = values
function values(producer){
  return pluck(seq(producer), 1)
}

_r.extend = extend
function extend(producer){
  var sources = _slice.call(arguments, 1)
  return produce(
      producer
    , null
    , function(consumer, obj){
        _forEach.call(sources, function(source){
          var key
          for(key in source){
            obj[key] = source[key]
          }
        })
        consumer.next(obj)
      })
}

_r.pick = pick
function pick(producer){
  var args = _slice.call(arguments, 1)
    , keys = []

   _forEach.call(args, function(arg){
     _forEach.call(isArray(arg) ? arg : [arg], function(key){
       _push.call(keys, key)
     })
   })

  return produce(
      producer
    , null
    , function(consumer, obj){
        var result = {}
        _forEach.call(keys, function(key){
          if(key in obj) result[key] = obj[key]
        })
        consumer.next(result)
      })
}

_r.defaults = defaults
function defaults(producer){
  var sources = _slice.call(arguments, 1)
  return produce(
      producer
    , null
    , function(consumer, obj){
        _forEach.call(sources, function(source){
          var key
          for(key in source){
            /*jshint eqnull:true */
            if(obj[key] == null) obj[key] = source[key]
          }
        })
        consumer.next(obj)
      })
}

_r.tap = tap
function tap(producer, doNext, doComplete, doError){
  return produce(
      producer
    , null
    , function(consumer, obj){
        if(isFunction(doNext)) doNext(obj)
        consumer.next(obj)
      }
    , function(consumer){
        if(isFunction(doComplete)) doComplete()
        consumer.complete()
      }
    , function(consumer, error){
        if(isFunction(doError)) doError(error)
        consumer.error(error)
      })
}

function delayConsumer(action, delayFun, arg){
  return function(consumer, val){
    var fun = function(){
      consumer[action](val)
    }
    delayFun(fun, arg)
  }
}

function produceDelayConsumer(producer, delayFun, arg){
  var args = _slice.call(arguments, 2)
  return produce(
      producer
    , null
    , delayConsumer('next', delayFun, arg)
    , delayConsumer('complete', delayFun, arg)
    , delayConsumer('error', delayFun, arg))
}


_r.delay = delay
function delay(producer, wait){
  return produceDelayConsumer(producer, setTimeout, wait)
}

_r.defer = defer
function defer(producer){
  return produceDelayConsumer(producer, _nextTick)
}

_r.debounce = debounce
function debounce(producer, wait, immediate){
  var timeout = null
    , sendIt = identity
  return produce(
      producer
    , null
    , function(consumer, obj){
        var callNow = immediate && !timeout
        sendIt = function(){
            timeout = null
            if(!immediate) consumer.next(obj)
          }
        clearTimeout(timeout)
        timeout = setTimeout(sendIt, wait)
        if(callNow) consumer.next(obj)
      }
    , function(consumer){
        clearTimeout(timeout)
        sendIt()
        consumer.complete()
      }
    , function(consumer, error){
        clearTimeout(timeout)
        consumer.error(error)
      })
}

function Underarm(obj, func, args) {
  if(isUndefined(obj)){
    this._detached = true
  } else if(obj instanceof Underarm){
    this._parent = obj
    this._func = func
    this._args = args
  } else {
    var wrapped = producerWrap(obj)
    this._wrapped = wrapped

    Deferred.extend(this, wrapped)
  }
}

var UnderProto = Underarm.prototype

_r.chain = chain
function chain(obj){
  return (obj instanceof Underarm) ? obj : new Underarm(obj)
}

function unwrap(obj){
  return (obj instanceof Underarm) ? obj.value() : obj
}

function mixin(obj) {
  var name
    , func
    , addToWrapper = function(name, func){
        UnderProto[name] = function() {
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

mixin(_r)
_r.mixin = mixin

_r.noConflict = noConflict
function noConflict(){
  root._r = old_r
  return _r
}

_r.identity = identity
function identity(value){
  return value
}

_r.deferred = deferred
function deferred(){
  return chain(new Deferred())
}

_r.defaultErrorHandler = defaultErrorHandler
function defaultErrorHandler(handler){
  errorHandler = handler
}

UnderProto.attach = function(producer){
  /*jshint boss:true */
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
  /*jshint boss:true */
  var result = this._wrapped
  if(isUndefined(result)){
    var stack = []
      , node = this
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

    while(node = _pop.call(stack)){
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

_r.when = when
function when(producer, resolve, error, progress, context){
  return chain(producer).then(resolve, error, progress, context)
}

function nextDeferredSend(deferred, action, callback, result, context){
  var nextResult = iteratorCall(callback, result, context)

  if(isProducer(nextResult)){
    when(nextResult
        , function(val){deferred[action](val)}
        , function(error){deferred.error(error)})
  } else {
    if(isUndefined(nextResult)) nextResult = result
    deferred[action](nextResult)
  }
}

UnderProto.then = function(resolve, error, progress, context){
  var nextDeferred = deferred()
    , self = unwrap(this)
    , results = []
    , consumer = new Consumer(
        function(result){
          if(consumer.resolveSingleValue){
            results = [result]
          } else {
            _push.call(results, result)
          }
          nextDeferredSend(nextDeferred, 'next', progress, result, context)
        }
      , function(){
          var result =
                  _has(self, 'resolvedValue')
                ? self.resolvedValue
                : consumer.resolveSingleValue
                  ? results[results.length - 1]
                  : results
          nextDeferredSend(nextDeferred, 'resolve', resolve, result, context)
        }
      , function(err){
          nextDeferredSend(nextDeferred, 'error', error, err, context)
        })
  self.subscribe(consumer)

  return nextDeferred
}

UnderProto.callback = function(){
  return this.callbackWithBoundDeferred(function(val){this.next(val)})
}

UnderProto.ncallback = function(){
  return this.callbackWithBoundDeferred(
    function(err, val){
      if(err){
        this.error(err)
      } else {
        this.next(val)
      }
    })
}

UnderProto.callbackWithBoundDeferred = function(callback){
  var d = deferred()
    , cb = function(){callback.apply(d, arguments)}

  cb.next = function(next){d.next(next)}
  cb.resolve = function(val){d.resolve(val)}
  cb.complete = function(){d.complete()}
  cb.error = function(err){d.error(err)}

  var nextD = this.attach(d).then()
  cb.then = function(resolve, error, progress){
    return nextD.then(resolve, error, progress)
  }

  return cb
}

_r.each = _r.forEach = each
function each(producer, iterator, context){
  return chain(producer).each(iterator, context)
}

UnderProto.each = UnderProto.forEach = function(iterator, context){
  var result = []
    , consumer = new Consumer(
      function(next){
        _push.call(result, next)
      }
    , function(){
        var key = 0
          , len = result.length
          , resolveSingleValue = consumer.resolveSingleValue
        if(len){
          if(!resolveSingleValue){
            _forEach.call(result, iterator, context)
          } else {
            var singleValue = result[0]
            if(singleValue && singleValue.length === +singleValue.length){
              len = singleValue.length
              _forEach.call(result, iterator, context)
            } else if(isObject(singleValue)){
              _forIn.call(singleValue, iterator, context)
            } else {
              iterator.call(context, singleValue, 0, result)
            }
          }
        }
      })
  return unwrap(this).subscribe(consumer)
}

})(this)
