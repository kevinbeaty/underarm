"use strict";
var ObjectProto = Object.prototype
  , toString = ObjectProto.toString
  , hasOwnProp = ObjectProto.hasOwnProperty

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
