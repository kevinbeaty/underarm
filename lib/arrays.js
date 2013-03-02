"use strict";
var funcs = require('./funcs')
  , has = funcs.has
  , predicateEqual = funcs.predicateEqual
  , isFunction = funcs.isFunction
  , identity = funcs.identity
  , ArrayProto = Array.prototype
  , breaker = {}

exports.pop = ArrayProto.pop
exports.push = ArrayProto.push
exports.slice = ArrayProto.slice
var splice = exports.splice = ArrayProto.splice
exports.shift = ArrayProto.shift
exports.unshift = ArrayProto.unshift
exports.concat = ArrayProto.concat

exports.forEach = ArrayProto.forEach || each
function each(iterator, context){
  /*jshint validthis:true*/
  var i = 0
    , len = this.length
  for(; i < len; i++){
    if(iterator.call(context || this, this[i], i, this) === breaker){
      break
    }
  }
}

exports.some = ArrayProto.some || some
function some(iterator, context){
  /*jshint validthis:true */
  var any = false
  each.call(this, function(val, i, arr){
    if(iterator.call(context, val, i, arr)){
      any = true
      return breaker
    }
  }, context)
  return any
}

exports.every =  ArrayProto.every || every
function every(iterator, context){
  /*jshint validthis:true*/
  var all = true
  each.call(this, function(val, i, arr){
    if(!iterator.call(context, val, i, arr)){
      all = false
      return breaker
    }
  }, context)
  return all
}

exports.indexOf = ArrayProto.indexOf || indexOf
function indexOf(obj, context){
  /*jshint validthis:true*/
  var idx = -1
  each.call(this, function(val, i){
    if(val === obj){
      idx = i
      return breaker
    }
  }, context)
  return idx
}
exports.inArray = inArray
function inArray(array, value){
   return indexOf.call(array, value) >= 0
}

exports.removeFrom = removeFrom
function removeFrom(array, predicate){
  if(!isFunction(predicate)){
    predicate = predicateEqual(predicate)
  }

  var i = 0
    , len = array.length
  for(; i < len; i++){
    if(predicate(array[i], i, array)){
      splice.call(array, i--, 1)
      len--
    }
  }
}

exports.sortedIndex = sortedIndex
function sortedIndex(array, obj, iterator) {
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
