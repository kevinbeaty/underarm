"use strict";

var _r = exports
  , u = require('./util')
  , Underarm = require('./underarm')
  , Producer = require('./producer')
  , Consumer = require('./consumer')
  , produce = Underarm.produce
  , produceOnComplete = Underarm.produceOnComplete
  , produceWithIterator = Underarm.produceWithIterator
  , resolveSingleValue = Consumer.resolveSingleValue
  , resolveValue = Consumer.resolveValue
  , resolveUndefined = Consumer.resolveUndefined
  , resolveFalse = Consumer.resolveFalse
  , resolveTrue = Consumer.resolveTrue
  , seqNext = Consumer.seqNext
  , _push = u.push
  , _slice = u.slice
  , _splice = u.splice
  , _sortedIndex = u.sortedIndex
  , predicateEqual = u.predicateEqual
  , identity = u.identity
  , lookupIterator = u.lookupIterator
  , isFunction = u.isFunction
  , isUndefined = u.isUndefined

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
      , resolveValue(memo))
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
var reduceArray = _r._reduceArray = reduceMemoType(Array)
var reduceObject = _r._reduceObject = reduceMemoType(Object)

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
          resolveSingleValue(consumer, memo)
        })
}

_r.find = _r.detect = find
function find(producer, iterator, context){
  return produceWithIterator(
        producer
      , context
      , iterator
      , function(consumer, value, found){
          if(found) resolveSingleValue(consumer, value)
        }
      , resolveUndefined)
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
        if(!passes) resolveFalse(consumer)
      }
    , resolveTrue)
}

_r.any = _r.some = any
function any(producer, iterator, context){
  return produceWithIterator(
      producer
    , context
    , iterator
    , function(consumer, value, passes){
        if(passes) resolveTrue(consumer)
      }
    , resolveFalse)
}

_r.include = _r.contains = include
function include(producer, obj, context){
  return any(producer, predicateEqual(obj), context)
}

_r.invoke = _r.call = invoke
function invoke(producer, method){
  var args = _slice.call(arguments, 2)
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
    , resolveValue(mx))
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
    , resolveValue(mn))
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

