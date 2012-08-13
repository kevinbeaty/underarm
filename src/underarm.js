;(function(root){
"use strict";

var _r = {}
if(typeof exports === 'undefined'){
  var _rOld = root._r
  _r.noConflict = function(){
    root._r = _rOld
    return _r
  }
  root._r = _r
} else {
  _r = exports
}

var ObjProto = Object.prototype
  , toString = ObjProto.toString
  , hasOwnProperty = ObjProto.hasOwnProperty
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
    return hasOwnProperty.call(obj, key)
  }

var Producer = (function(){
  function Producer(){
    this.subscribers = []
  }
  var P = Producer.prototype

  P.subscribe = subscribe
  function subscribe(next, complete, error){
    var subscriber = new Subscriber(this, next, complete, error)
    return subscriber 
  }

  return Producer
})()

var Subscriber = (function(){
  function Subscriber(producer, next, complete, error){
    this.producer = producer
    producer.subscribers.push(this)

    if(next) this.next = this._wrap(this.next, next)
    if(complete) this.complete = this._wrap(this.complete, complete)
    if(error) this.error = this._wrap(this.error, error)
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
    var idx = this.producer.subscribers.indexOf(this)
    if(idx >= 0){
      this.producer.subscribers.splice(idx, 1)
    }
  }

  P._wrap = _wrap
  function _wrap(func, wrapped){
    var self = this
    return function(arg){
      wrapped.call(self, arg)
      func.call(self, arg) 
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
_r.subject = function(){return new Subject}


function produce(delegate, context, next, complete, error){
  var subj = new Subject() 
    , defaults = produce.defaults
    , wrap = function(wrapped){
        return function(value){
          wrapped.call(context, value, subj)
        }
      } 

  delegate.subscribe(
        wrap(next || defaults.next)
      , wrap(complete || defaults.complete)
      , wrap(error || defaults.error))

  return subj 
}
produce.defaults = {
    next: function(value, producer){producer.next(value)} 
  , complete: function(producer){producer.complete()} 
  , error: function(err, producer){producer.error(err)}
}

function produceWithIterator(subject, context, iterator, iterate, complete, error){
  var next = function(value, producer){
    var cb = function(result){
        try {
          iterate(value, producer, result)
        } catch (e){
          producer.error(e)
        }
      }
    , result
    
    try {
      result = iterator.call(context, value, cb) 
    } catch (e2){
      producer.error(e2)
    }

    if(!isUndefined(result)){
      cb(result)
    }
  }
  return produce(subject, context, next, complete, error)
}

_r.each = each
function each(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(value, producer){
        producer.next(value)
      })
}

_r.map = map
function map(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(value, producer, result){
        producer.next(result)
      })
}

_r.find = find
function find(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(value, producer, found){
        if(found){
          producer.next(value)
          producer.complete()
        }
      })
}

_r.filter = filter
function filter(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(value, producer, keep){
        if(keep) producer.next(value)
      })
}

_r.reject = reject
function reject(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(value, producer, ignore){
        if(!ignore) producer.next(value)
      })
}

_r.every = every
function every(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(value, producer, passes){
        if(!passes){
          producer.next(false)
          producer.complete()
        }
      }
    , function(producer){
        producer.next(true)
        producer.complete()
    })
}

_r.any = any
function any(subject, iterator, context){
  return produceWithIterator(
      subject
    , context
    , iterator
    , function(value, producer, passes){
        if(passes){
          producer.next(true)
          producer.complete()
        }
      }
    , function(producer){
        producer.next(false)
        producer.complete()
    })
}

_r.contains = contains
function contains(subject, obj, context){
  return any(subject, function(value){return value === obj}, context)
}

})(this)
