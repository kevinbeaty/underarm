"use strict";

var _r = exports
  , Underarm = require('./underarm')
  , collections = require('./collections')
  , u = require('./util')
  , reduceObject = collections._reduceObject
  , seq = collections.seq
  , pluck = collections.pluck
  , produce = Underarm.produce
  , _slice = u.slice
  , _push = u.push
  , _forEach = u.forEach
  , isArray = u.isArray
  , identity = u.identity
  , lookupIterator = u.lookupIterator

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
