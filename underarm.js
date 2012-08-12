;(function(root){
"use strict";

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

    if(next) this.next = next
    if(complete) this.complete = complete
    if(error) this.error = error
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
exports.subject = function(){return new Subject}

function produce(delegate, next, complete, error){
  var subj = new Subject() 
    , defaults = produce.defaults
    , wrap = function(wrapped){
        return function(value){
          wrapped.call(subj, value)
        }
      } 

  delegate.subscribe(
        wrap(next || defaults.next)
      , wrap(complete || defaults.complete)
      , wrap(error || defaults.error))

  return subj 
}
produce.defaults = {
    next: function(value){this.next(value)} 
  , complete: function(){this.complete()} 
  , error: function(err){this.error(err)}
}

exports.each = each
function each(subject, iterator, context){
  return produce(subject, function(value){
    iterator.call(context, value)
    this.next(value)
  })
}

exports.map = map
function map(subject, iterator, context){
  return produce(subject, function(value){
    this.next(iterator.call(context, value))
  })
}

exports.reduce = reduce
function reduce(subject, iterator, memo, context){
  return produce(
      subject
    , function(value){
        memo = iterator.call(context, memo, value)
    }
    , function(){
        this.next(memo)
        this.complete()
    })
}

exports.reduceRight = reduceRight
function reduceRight(subject, iterator, memo, context){
  var values = []
  return produce(
      subject
    , function(value){
        values.push(value)
    }
    , function(){
        var len = values.length
          , i = len - 1
        for(; i >=0; i--){
          memo = iterator.call(context, memo, values[i])
        }
        this.next(memo)
        this.complete()
        values = null
    })
}

exports.find = find
function find(subject, iterator, context){
  return produce(subject, function(value){
    if(iterator.call(context, value)){
      this.next(value)
      this.complete()
    }
  })
}

exports.filter = filter
function filter(subject, iterator, context){
  return produce(subject, function(value){
    if(iterator.call(context, value)){
      this.next(value)
    }
  })
}

exports.reject = reject
function reject(subject, iterator, context){
  return produce(subject, function(value){
    if(!iterator.call(context, value)){
      this.next(value)
    }
  })
}

exports.every = every
function every(subject, iterator, context){
  var result = true
  return produce(
      subject
    , function(value){
        if(!iterator.call(context, value)){
          result = false
          this.next(false)
          this.complete()
        }
    }
    , function(){
        if(result){
          this.next(true)
          this.complete()
        }
    })
}

exports.any = any
function any(subject, iterator, context){
  var result = false
  return produce(
      subject
    , function(value){
        if(iterator.call(context, value)){
          result = true
          this.next(true)
          this.complete()
        }
    }
    , function(){
        if(!result){
          this.next(false)
          this.complete()
        }
    })
}

exports.contains = contains
function contains(subject, obj, context){
  return any(
      subject
    , function(value){
      return value === obj
    }
    , context)
}

})(this)
