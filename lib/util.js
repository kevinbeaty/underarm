"use strict";
var ObjectProto = Object.prototype
  , ArrayProto = Array.prototype
  , toString = ObjectProto.toString
  , hasOwnProp = ObjectProto.hasOwnProperty
  , Stream = require('stream')
  , breaker = {}

exports.identity = identity
function identity(value){
  return value
}

exports.has = has
function has(obj, key){
  return obj && hasOwnProp.call(obj, key)
}

exports.predicateEqual = predicateEqual;
function predicateEqual(obj){
  return function(value){
    return value === obj
  }
}

exports.isArray = Array.isArray || predicateToString('[object Array]')
exports.isUndefined = predicateEqual()
exports.isObject = function(obj){return obj === Object(obj)}
var isFunction = exports.isFunction = predicateToString('[object Function]')
exports.isRegExp = predicateToString('[object RegExp]')
exports.isStream = function(obj){return obj instanceof Stream}

function predicateToString(str){
  return function(value){
    return toString.call(value) == str
  }
}

exports.lookupIterator = lookupIterator
function lookupIterator(obj, val) {
  return isFunction(val) ? val : function(obj){return obj[val]}
}

exports.errorHandler = errorHandler
function errorHandler(err){
  if(typeof console === 'object'){
    if(isFunction(console.error)){
      console.error(err)
    } else if(isFunction(console.log)){
      console.log(err)
    }
  }
}


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

exports.forIn = forIn
function forIn(iterator, context){
  /*jshint validthis:true*/
  var key
  for(key in this){
    if(has(this, key)){
      if(iterator.call(context || this, this[key], key, this) === breaker){
        break
      }
    }
  }
}
