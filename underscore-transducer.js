  // Create quick reference variables for speed access to core prototypes.
  var slice = Array.prototype.slice, undef;

  // Create a safe reference to the Underscore object for use below.
  var _r = function(obj, transform) {
    if (_r.as(obj)){
      if(transform === undef){
        return obj;
      }
      var wrappedFns = _.clone(obj._wrappedFns);
      wrappedFns.push(transform);
      var copy = new _r(obj._wrapped, wrappedFns);
      copy._resolveSingleValue = obj._resolveSingleValue;
      return copy;
    }

    if (!(_r.as(this))) return new _r(obj, transform);

    if(_r.as(transform)){
      this._resolveSingleValue = transform._resolveSingleValue;
      transform = transform._wrappedFns;
    }

    if(_.isFunction(transform)){
      this._wrappedFns = [transform];
    } else if(_.isArray(transform)){
      this._wrappedFns = _.filter(transform, _.isFunction);
    } else {
      this._wrappedFns = [];
    }

    this._wrapped = _r.wrap.call(this, obj);
  };

  // Current version.
  _r.VERSION = '0.0.10';

  var _ = require('underscore'),
    transduce = require('transduce');

  // Export for browser or Common-JS
  // Save the previous value of the `_r` variable.
  var previous_r, root;
  if(typeof window !== 'undefined'){
    var root = window;
    previous_r = root._r;
    root._r = _r;
    _ = root._;
  } else {
    root = {};
    module.exports = _r;
  }

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Add your own custom transducers to the Underscore.transducer object.
  _r.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _r[name] = obj[name];
      _r.prototype[name] = function() {
        var method = func.apply(this, arguments);
        return _r(this, method);
      };
    });
  };

  // import transducer libraries to mixin
  require('./lib/collections')(_r);
  require('./lib/arrays')(_r);

  // Add all of the Underscore functions to the wrapper object.
  _r.mixin(_r);

  // Returns the value if it is a chained transformation, else null
  _r.as = function(value){
    return value instanceof _r ? value : null;
  }

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _r.noConflict = function() {
    root._r = previous_r;
    return this;
  };

  // Returns a new chained instance using current transformation, but
  // wrapping the given source
  _r.prototype.withSource = function(obj){
    return _r(obj, this);
  }

  // Composes and returns the underlying wrapped functions
  _r.prototype.transducer = _r.prototype.compose = function() {
    var fns = this._wrappedFns;
    return fns.length ? _.compose.apply(null, fns) : undef;
  }

  // Helper to mark transducer to expect single value when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function
  _r.resolveSingleValue = function(self){
    resolveSingleValue(self, true);
  }

  // Helper to mark transducer to expect multiple values when
  // resolving. Only valid when chaining, but this should be passed
  // when called as a function.
  _r.resolveMultipleValues = function(self){
    resolveSingleValue(self, false);
  }

  function resolveSingleValue(self, single){
    if(_r.as(self)){
      self._resolveSingleValue = single;
    }
  }

  // sentinel to ignore wrapped objects (maintain only last item)
  var IGNORE = _r.IGNORE = {};

  // Resolves the value of the wrapped object, similar to underscore.
  // Returns an array, or single value (to match underscore API)
  // depending on whether the chained transformation resolves to single value.
  _r.prototype.value = function(){
    if(!this._resolveSingleValue){
      return this.into();
    }

    var ret =  this.into(IGNORE);
    return ret === IGNORE ? undef : ret;
  }

  // important non-mixin libraries
  require('./lib/push')(_r);
  require('./lib/dispatch')(_r);
  require('./lib/iterators')(_r);

  // Transducer Functions
  // --------------------

  // Wrapper to return from iteratee of reduce to terminate
  // _r.reduce early with the provided value
  _r.reduced = transduce.reduced;
  _r.isReduced = transduce.isReduced;

  _r.reduce = _r.foldl = _r.inject = function(xf, init, coll) {
    if (coll == null) coll = _r.empty(coll);
    return transduce.reduce(xf, init, coll);
  };

  _r.transduce = function(xf, f, init, coll){
    if(_r.as(xf)){
      xf = xf.compose();
    }

    return _r.unwrap(transduce.transduce(xf, f, init, coll));
  }

  // Calls transduce using the chained transformation
  _r.prototype.transduce = function(f, init, coll){
    if(coll === undef){
      coll = this._wrapped;
    }
    return _r.transduce(this, f, init, coll);
  }

  // Returns a new coll consisting of to-coll with all of the items of
  // from-coll conjoined. A transducer (step function) may be supplied.
  _r.into = function(to, xf, from){
    var f = _r.append;

    if(from === undef){
      from = xf;
      xf = undef;
    }

    if(from === undef){
      from = _r.empty();
    }

    if(_r.as(xf)){
      xf = xf.compose();
    }

    if(xf === undef){
      return _r.reduce(f, to, from);
    }

    return _r.transduce(xf, f, to, from);
  }

  // Calls into using the chained transformation
  _r.prototype.into = function(to, from){
    if(from === undef){
      from = this._wrapped;
    }

    if(from === undef){
      from = _r.empty();
    }

    if(to === undef){
      to = _r.empty(from);
    }

    return _r.into(to, this, from);
  }

  // Returns a new collection of the empty value of the from collection
  _r.sequence = function(xf, from){
    return _r.into(_r.empty(from), xf, from);
  }

  // calls sequence with chained transformation and optional wrapped object
  _r.prototype.sequence = function(from){
    return this.into(_r.empty(from), from);
  }
