'use strict'
var transducer = require('transduce/core/transducer')
module.exports = function(_r){
  var _ = _r._

  _r.mixin({
    throttle: throttle,
    debounce: debounce
  })

  function throttle(wait, options){
    return sample(sampler_(_.throttle, wait, options))
  }

  function debounce(wait, immediate){
    return sample(sampler_(_.debounce, wait, immediate))
  }

  function sampler_(debounce, wait, options){
    return function(fn){
      return debounce(fn, wait, options)
    }
  }

  function sample(sampler){
    return transducer(function(step, value, input){
      if(this._sample === void 0){
         this._sample = sampler(this.step)
      }
      var res = this._sample(value, input)
      return res !== void 0 ? res : value
    })
  }
}
