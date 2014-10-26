var transduce = require('transduce'), undef;

module.exports = function(_r){
  // Dispatchers
  // -----------
  var IGNORE = _r.IGNORE,
      dispatch = _r._.reduce(
        ['iterator', 'iteratee', 'empty', 'append', 'wrap', 'unwrap'],
        function(memo, item){

        var d = function(){
          var args = arguments, fns = d._fns, i = fns.length, result,
              self = _r.as(this);
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

  // Wraps a value used as source for use during chained transformation. 
  //
  // Default returns value, or _r.empty() if undefined.
  //
  // Dispatch function. To support different types,
  // call _r.unwrap.register
  _r.wrap = function(value){
    return dispatch.wrap.call(this, value);
  }

  _r.wrap.register = function(fn){
    return dispatch.wrap.register(fn);
  }

  _r.wrap.register(function(value){
    if(_r._.isString(value)){
      value = [value];
    } else if(value == null){
      value = _r.empty();
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
  _r.unwrap = _r.deref = function(value){
    return dispatch.unwrap(value);
  }

  _r.unwrap.register = function(fn){
    return dispatch.unwrap.register(fn);
  }

  _r.unwrap.register(function(value){
    if(_r.as(value)){
      return r.value();
    }
    return transduce.unreduced(value);
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
  _r.iterator = function(obj){
    return dispatch.iterator(obj);
  }

  _r.iterator.register = function(fn){
    return dispatch.iterator.register(fn);
  }

  _r.iterator.register(transduce.iterator);

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
  _r.iteratee = function(value){
    return dispatch.iteratee(value);
  }

  _r.iteratee.register = function(fn){
    return dispatch.iteratee.register(fn);
  }

  _r.iteratee.register(function(value){
    if(_r.as(value)){
      return _riteratee(value);
    }
    return _r._.iteratee(value);
  });

  function _riteratee(value){
    return function(item){
      return value.withSource(item).value();
    }
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
  _r.empty = function(obj){
    return obj === IGNORE ? IGNORE : dispatch.empty(obj);
  }

  _r.empty.register = function(fn){
    return dispatch.empty.register(fn);
  }

  _r.empty.register(function(obj){
    if(obj === undef || _r._.isArray(obj) || _r.iterator(obj)){
      return []; // array if not specified or from array
    } else if(_r._.isObject(obj)){
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
  _r.append = _r.conj = _r.conjoin = function(obj, item){
    // valid object and item, dispatch
    return dispatch.append(obj, item);
  }

  _r.append.register = function(fn){
    return dispatch.append.register(fn);
  }

  _r.append.register(function(obj, item){
    if(_r._.isArray(obj)){
      obj.push(item);
      return obj;
    }

    // just maintain last item
    return item;
  });

  // Reducer that dispatches to empty, unwrap and append
  function Dispatch(){}
  Dispatch.prototype.init = _r.empty;
  Dispatch.prototype.result = _r.unwrap;
  Dispatch.prototype.step = _r.append;

  _r.dispatch = function(){
    return new Dispatch();
  }
}
