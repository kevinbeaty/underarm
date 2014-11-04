"use strict";
module.exports = function(_r){
  var _ = _r._;

  _r.mixin({
    throttle: throttle,
    debounce: debounce
  });

  function throttle(wait, options){
    return rateLimit(_.partial(_.throttle, _, wait, options));
  }

  function debounce(wait, immediate){
    return rateLimit(_.partial(_.debounce, _, wait, immediate));
  }

  function rateLimit(stepper){
    return function(xf){
      return new RateLimit(stepper, xf);
    };
  }
  function RateLimit(stepper, xf){
    this.xf = xf;
    this._step = stepper(_.bind(this.__step, this));
  }
  RateLimit.prototype.init = function(){
    return this.xf.init();
  };
  RateLimit.prototype.result = function(result){
    this._complete = true;
    return this.xf.result(result);
  };
  RateLimit.prototype.step = function(result, input) {
    this._step(result, input);
    return this._hasResult ? this._result : result;
  };
  RateLimit.prototype.__step = function(result, input){
    if(!this._complete){
      this._hasResult = true;
      this._result = this.xf.step(result, input);
    }
  };
};
