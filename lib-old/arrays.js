"use strict";

var _r = exports
  , Underarm = require('./underarm')
  , Consumer = require('./consumer')
  , Producer = require('./producer')
  , collections = require('./collections')
  , u = require('./util')
  , reduce = collections.reduce
  , reduceArray = collections._reduceArray
  , filter = collections.filter
  , reject = collections.reject
  , seq = collections.seq
  , seqNext = Consumer.seqNext
  , seqNextResolve = Consumer.seqNextResolve
  , resolveValue = Consumer.resolveValue
  , resolveSingleValue = Consumer.resolveSingleValue
  , resolveNegativeOne = Consumer.resolveNegativeOne
  , isProducer = Producer.isProducer
  , produce = Underarm.produce
  , produceWithIterator = Underarm.produceWithIterator
  , produceOnComplete = Underarm.produceOnComplete
  , _unshift = u.unshift
  , _slice = u.slice
  , _push = u.push
  , _forEach = u.forEach
  , _concat = u.concat
  , _inArray = u.inArray
  , _removeFrom = u.removeFrom
  , _every = u.every
  , _shift = u.shift
  , predicateEqual = u.predicateEqual
  , isUndefined = u.isUndefined
  , isArray = u.isArray

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
      return produce(producer, null
        , function(consumer, value){resolveSingleValue(consumer, value)})
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
            resolveSingleValue(consumer, results[begin])
          } else {
            for(i = Math.max(0, begin); i < Math.min(len, end); i++){
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
  return slice(producer, 0, isUndefined(n) ? -1 : -n)
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
          if(found) resolveSingleValue(consumer, idx)
          idx++
        }
      , resolveNegativeOne)
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
      , resolveValue(lastIdx))
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
            producer: Producer.wrap(toZip)
          , values: []
          , depth: 0
          }
      delegate.producer.subscribe(
          function(val){next(delegate, val)}
        , function(){complete(delegate)}
        , function(err){consumer.error(err)}
        )
    })
  }
  return producer
}
