"use strict";
var tr = require('transduce'), undef;

module.exports = function(_r){
  var _ = _r._,
      as = _r.as,
      // sentinel to ignore wrapped objects (maintain only last item)
      IGNORE = _r.IGNORE = {};

  // Transducer Functions
  // --------------------
  _r.value = value;
  _r.resolveSingleValue = resolveSingleValue;
  _r.resolveMultipleValues = resolveMultipleValues;
  _r.reduced = tr.reduced;
  _r.isReduced = tr.isReduced;
  _r.reduce = reduce;
  _r.foldl = reduce;
  _r.inject = reduce;
  _r.transduce = transduce;
  _r.transducer = transducer;
  _r.into = into;
  _r.sequence = sequence;
  _r.wrap = wrap;
  _r.unwrap = unwrap;
  _r.deref = unwrap;
  _r.iterator = iterator;
  _r.iteratee = iteratee;
  _r.empty = empty;
  _r.append = append;
  _r.conj = append;
  _r.conjoin = append;
  _r.dispatch = dispatchXf;

  // Dispatchers
  // -----------
  var dispatch = _.reduce(
        ['value', 'reduce', 'transduce', 'into', 'sequence', 'transducer',
         'iterator', 'iteratee', 'empty', 'append', 'wrap', 'unwrap'],
        function(memo, item){

        var d = function(){
          var args = arguments, fns = d._fns, i = fns.length, result,
              self = as(this);
          for(; i-- ;){
            result = fns[i].apply(self, args);
            if(result !== undef){
              return result;
            }
          }
        };

        d._fns = [];

        d.register = function(fn){
          d._fns.push(fn);
        };

        memo[item] = d;
        return memo;
      }, {});

  // Resolves the value of the wrapped object, similar to underscore.
  // Returns an array, or single value (to match underscore API)
  // depending on whether the chained transformation resolves to single value.
  function value(r){
    return dispatch.value(r);
  }

  value.register = function(fn){
    return dispatch.value.register(fn);
  };

  value.register(function(self){
    if(!self._opts.resolveSingleValue){
      return self.into();
    }

    var ret =  self.into(IGNORE);
    return ret === IGNORE ? undef : ret;
  });

  _r.prototype.value = function(){
    return value(this);
  };

  // Helper to mark transducer to expect single value when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function
  function resolveSingleValue(self){
    _resolveSingleValue(self, true);
  }

  // Helper to mark transducer to expect multiple values when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function.
  function resolveMultipleValues(self){
    _resolveSingleValue(self, false);
  }

  function _resolveSingleValue(self, single){
    if(_r.as(self)){
      self._opts.resolveSingleValue = single;
    }
  }

  // Composes and returns the underlying wrapped functions for give chained object
  function transducer(r){
    return dispatch.transducer(r);
  }

  transducer.register = function(fn){
    return dispatch.transducer.register(fn);
  };

  transducer.register(function(self){
    var fns = self._wrappedFns;
    return fns.length ? _.compose.apply(null, fns) : _.identity;
  });

  _r.prototype.transducer = _r.prototype.compose = function() {
    return transducer(this);
  };

  function reduce(xf, init, coll){
    return dispatch.reduce(xf, init, coll);
  }

  reduce.register = function(fn){
    return dispatch.reduce.register(fn);
  };

  reduce.register(function(xf, init, coll) {
    if(_r.as(xf)){
      xf = transducer(xf);
    }

    if (coll === null || coll === undef) coll = empty(coll);
    return tr.reduce(xf, init, coll);
  });

  // Calls transduce using the chained transformation if function not passed
  _r.prototype.reduce = function(init, coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return reduce(this, init, coll);
  };

  function transduce(xf, f, init, coll){
    return dispatch.transduce(xf, f, init, coll);
  }

  transduce.register = function(fn){
    return dispatch.transduce.register(fn);
  };

  transduce.register(function(xf, f, init, coll){
    if(_r.as(xf)){
      xf = transducer(xf);
    }

    return _r.unwrap(tr.transduce(xf, f, init, coll));
  });

  // Calls transduce using the chained transformation
  _r.prototype.transduce = function(f, init, coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return transduce(this, f, init, coll);
  };


  function into(to, xf, from){
    return dispatch.into(to, xf, from);
  }

  into.register = function(fn){
    return dispatch.into.register(fn);
  };

  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  into.register(function(to, xf, from){
    if(from === undef){
      from = xf;
      xf = undef;
    }

    if(from === undef){
      from = empty();
    }

    if(as(xf)){
      xf = transducer(xf);
    }

    if(to === undef){
      to = empty(from);
    }

    if(xf === undef){
      return reduce(append, to, from);
    }

    return transduce(xf, append, to, from);
  });

  // Calls into using the chained transformation
  _r.prototype.into = function(to, from){
    if(from === undef){
      from = this._wrapped;
    }
    return into(to, this, from);
  };

  function sequence(xf, from){
    return dispatch.sequence(xf, from);
  }

  sequence.register = function(fn){
    return dispatch.sequence.register(fn);
  };

  // Returns a new collection of the empty value of the from collection
  sequence.register(function(xf, from){
    return into(empty(from), xf, from);
  });

  // calls sequence with chained transformation and optional wrapped object
  _r.prototype.sequence = function(from){
    if(from == undef){
      from = this._wrapped;
    }
    return sequence(this, from);
  };

  // Wraps a value used as source for use during chained transformation. 
  //
  // Default returns value, or _r.empty() if undefined.
  //
  // Dispatch function. To support different types,
  // call _r.unwrap.register
  function wrap(value){
    /*jshint validthis:true*/
    return dispatch.wrap.call(this, value);
  }

  wrap.register = function(fn){
    return dispatch.wrap.register(fn);
  };

  wrap.register(function(value){
    if(_.isString(value)){
      value = [value];
    } else if(value === null || value === undef){
      value = empty();
    }
    return value;
  });

  // Unwraps (deref) a possibly wrapped value
  // Default unwraps values created with _r.reduced,
  // or calls value() on chained _r transformations,
  // otherwise returns parameter.
  //
  // Dispatch function. To support different types,
  // call _r.unwrap.register
  function unwrap(value){
    return dispatch.unwrap(value);
  }

  unwrap.register = function(fn){
    return dispatch.unwrap.register(fn);
  };

  unwrap.register(function(value){
    if(as(value)){
      return value.value();
    }
    return tr.unreduced(value);
  });

  // Returns an iterator that has next function
  // and returns {value, done}. Default looks for
  // object with iterator Symbol (or '@@iterator').
  // This is available with _r.iterator.Symbol
  //
  // Dispatch function. To support different types
  // call _r.iterator.register and supply function that returns
  // an iterator after checking the input using appropriate
  // predicates. Return undefined if not supported, so other
  // dispatched functions can be checked
  function iterator(obj){
    return dispatch.iterator(obj);
  }

  iterator.register = function(fn){
    return dispatch.iterator.register(fn);
  };

  iterator.register(tr.iterator);

  // Mostly internal function that generates a callback from the given value.
  // For use with generating callbacks for map, filter, find, etc.
  //
  // Default returns _.iteratee.
  //
  // Dispatch function. To support different types
  // call _r.iteratee.register and supply function that returns
  // a callback after checking the input using appropriate
  // predicates. Return undefined if not supported, so other
  // dispatched functions can be checked
  function iteratee(value){
    return dispatch.iteratee(value);
  }

  iteratee.register = function(fn){
    return dispatch.iteratee.register(fn);
  };

  iteratee.register(function(value){
    if(as(value)){
      return _riteratee(value);
    }
    return _.iteratee(value);
  });

  function _riteratee(value){
    return function(item){
      return value.withSource(item).value();
    };
  }

  // Returns empty object of the same type as argument.
  // Default returns [] if _.isArray or undefined, {} if _.isObject
  // and an internal sentinel to ignore otherwise
  //
  // Dispatch function. To support different types
  // call _r.empty.register and supply function that returns
  // an empty object after checking the input using appropriate
  // predicates. Return undefined if not supported, so other
  // dispatched functions can be checked
  function empty(obj){
    return obj === IGNORE ? IGNORE : dispatch.empty(obj);
  }

  empty.register = function(fn){
    return dispatch.empty.register(fn);
  };

  empty.register(function(obj){
    if(obj === undef || _.isArray(obj) || iterator(obj)){
      return []; // array if not specified or from array
    } else if(_.isObject(obj)){
      return {}; // object if from object
    }

    // ignore by default. Default append just maintains last item.
    return IGNORE;
  });

  // Appends (conjoins) the item to the collection, and returns collection
  //
  // Dispatch function. To support different types
  // call _r.append.register and supply function that append to the object
  // (first param) with the item and optional key after checking the input
  // using appropriate predicates.
  //
  // Return undefined if not supported, so other dispatched functions can be checked
  function append(obj, item){
    // valid object and item, dispatch
    return dispatch.append(obj, item);
  }

  append.register = function(fn){
    return dispatch.append.register(fn);
  };

  append.register(function(obj, item){
    if(_.isArray(obj)){
      obj.push(item);
      return obj;
    }

    // just maintain last item
    return item;
  });

  // Reducer that dispatches to empty, unwrap and append
  function Dispatch(){}
  Dispatch.prototype.init = empty;
  Dispatch.prototype.result = unwrap;
  Dispatch.prototype.step = append;

  function dispatchXf(){
    return new Dispatch();
  }
};
