'use strict'
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
    return function(xf){
      return new Sample(sampler, xf)
    }
  }
  function Sample(sampler, xf){
    this.xf = xf
    this._sample = sampler(xf.step.bind(xf))
  }
  Sample.prototype.init = function(){
    return this.xf.init()
  }
  Sample.prototype.result = function(result){
    return this.xf.result(result)
  }
  Sample.prototype.step = function(result, input) {
    var res = this._sample(result, input)
    return res !== void 0 ? res : result
  }
}
