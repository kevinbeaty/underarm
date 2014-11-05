"use strict";
var undef;
module.exports = function(_r){
  var _ = _r._;

  _r.mixin({
    throttle: throttle,
    debounce: debounce
  });

  function throttle(wait, options){
    return sample(_.partial(_.throttle, _, wait, options));
  }

  function debounce(wait, immediate){
    return sample(_.partial(_.debounce, _, wait, immediate));
  }

  function sample(sampler){
    return function(xf){
      return new Sample(sampler, xf);
    };
  }
  function Sample(sampler, xf){
    this.xf = xf;
    this._sample = sampler(xf.step.bind(xf));
  }
  Sample.prototype.init = function(){
    return this.xf.init();
  };
  Sample.prototype.result = function(result){
    return this.xf.result(result);
  };
  Sample.prototype.step = function(result, input) {
    var res = this._sample(result, input);
    return res !== undef ? res : result;
  };
};
