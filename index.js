/* underarm v0.0.1 | http://kevinbeaty.net/projects/underarm | License: MIT */
"use strict";

var collections = require('./lib/collections')
  , arrays = require('./lib/arrays')
  , objects = require('./lib/objects')
  , when = require('when')
  , through = require('through')
  , u = require('./lib/util')
  , Consumer = require('./lib/consumer')
  , Producer = require('./lib/producer')
  , Underarm = require('./lib/underarm')
  , isArray = u.isArray
  , isUndefined = u.isUndefined
  , isObject = u.isObject
  , isFunction = u.isFunction
  , isRegExp = u.isRegExp
  , _min = Math.min
  , _max = Math.max
  , _has = u.has
  , _pop = u.pop
  , _push = u.push
  , _slice = u.slice
  , _splice = u.splice
  , _shift = u.shift
  , _unshift = u.unshift
  , _concat = u.concat
  , _forEach = u.forEach
  , _forIn = u.forIn
  , _some = u.some
  , _every = u.every
  , _indexOf = u.indexOf
  , _inArray = u.inArray
  , _removeFrom = u.removeFrom
  , _sortedIndex = u.sortedIndex
  , lookupIterator = u.lookupIterator
  , errorHandler = u.errorHandler
  , _nextTick = process.nextTick
  , identity = u.identity
  , predicateEqual = u.predicateEqual
  , resolveSingleValue = Consumer.resolveSingleValue
  , resolveValue = Consumer.resolveValue
  , resolveUndefined = Consumer.resolveUndefined
  , resolveFalse = Consumer.resolveFalse
  , resolveTrue = Consumer.resolveTrue
  , resolveNegativeOne = Consumer.resolveNegativeOne
  , seqNext = Consumer.seqNext
  , seqNextResolve = Consumer.seqNextResolve
  , isProducer = Producer.isProducer
  , produce = Underarm.produce
  , produceWithIterator = Underarm.produceWithIterator
  , produceOnComplete = Underarm.produceOnComplete
  , seq = collections.seq
  , reduce = collections.reduce
  , filter = collections.filter
  , reject = collections.reject
  , pluck = collections.pluck
  , reduceArray = collections._reduceArray
  , reduceObject = collections._reduceObject

var _r = Underarm._r
module.exports = _r

_r.VERSION = '0.0.2'

_r.pipe = pipe
function pipe(producer, write, options){
  var stream = through()
  stream.pipe(write, options)
  return produce(
        producer
      , null
      , function(consumer, value){
          stream.queue(value)
          consumer.next(value)
        }
      , function(consumer){
          stream.queue(null)
          consumer.complete()
        }
      , function(consumer, err){
          stream.emit('error', err)
          consumer.error(err)
        });
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

_r.mixin = Underarm.mixin
_r.mixin(_r)
_r.mixin(collections)
_r.mixin(arrays)
_r.mixin(objects)

_r.chain = Underarm.chain
_r.when = when
_r.identity = identity
_r.each = _r.forEach = Underarm.each

_r.defaultErrorHandler = defaultErrorHandler
function defaultErrorHandler(handler){
  errorHandler = handler
}

if(typeof window !== 'undefined'){
  (function(){
    var old_r
    /*global window*/
    old_r = window._r
    window._r = _r

    _r.noConflict = noConflict
    function noConflict(){
      window._r = old_r
      return _r
    }
  })()
}
