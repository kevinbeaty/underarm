# [Underscore Transducer][4]

[![Build Status](https://secure.travis-ci.org/kevinbeaty/underscore-transducer.svg)](http://travis-ci.org/kevinbeaty/underscore-transducer)

Transducers using the familiar API from  [Underscore.js][1] that closely follows the [Clojure implementation][5] with extra goodies like lazy generators and callback processes.

If you would like to know how transducers work, check out [this video][2] or [this article][3].  Also see the [Demo and Documentation][4] for this library.

## What?

Straight from the [source][5].

> Transducers are composable algorithmic transformations. They are independent from the context of their input and output sources and specify only the essence of the transformation in terms of an individual element. Because transducers are decoupled from input or output sources, they can be used in many different processes - collections, streams, channels, observables, etc. Transducers compose directly, without awareness of input or creation of intermediate aggregates.

Transducers allow the abstraction of algorithmic transformations independent from the input and output, and even the process of iteration.

Whereas underscore or lodash operates on arrays and objects calculating intermediate results, transducers simply define the transformation in terms of functions similar to what you pass reduce: start with a memo, execute a function with a memo and an item, return the possibly transformed memo for the next iteration. Once you abstract the transformation away from the data, you can apply the same transformations to different processes that start with an initial value and step through a result. One benefit is that you can compute the result in one pass (without intermediate results). Another is you can use the same transformation in different contexts (lazy lists, indefinite sequence generation, CSP, event streams, etc.).

The source could be anything that produces a sequences of values: streams, iterators, callbacks, immutable-js, etc. You simply have to define (external to the transducer) how you append each item to the supplied result. The "step function" that knows how to append results to values is passed to the transducer, and the transducer executes the step function when reducing over results.

This library creates transducers using the familiar underscore API.

### Transducers

First some helper functions and imports.  You can optionally mix in `_r` into the underscore object

```javascript
// import, mixin and helper functions
var _r = require('underscore-transducer');
var _ = require('underscore');

function isEven(x){
  return x % 2 !== 1;
}

function inc(x){
  return x+1;
}

// prints every result and input. Useful with tap
function printIt(result, input){
  console.log(input+' ['+result+']');
}

var trans, result;
```

Transduce with all arguments.  ` _r.append` is default step function, empty array is default memo.  If memo is not specified, the step function is called with no arguments `_r.append` returns empty array.

The step function is called with a varying number of arguments

- 0 arguments if memo is not provided
- Two or three arguments, the result (memo) and current item and optional key on every step (like reduce)
- One argument with the result on completion

Early termination can be signaled by wrapping value in `_r.reduced`.

```javascript
result = _r.transduce(_r.filter(isEven), [1,2,3,4], _r.append, [3]);
// [ 3, 2, 4]

// these are all the same
result = _r.transduce(_r.filter(isEven), [1,2,3,4], _r.append, []);
result = _r.transduce(_r.filter(isEven), [1,2,3,4], _r.append);
result = _r.transduce(_r.filter(isEven), [1,2,3,4]);
result = _r().filter(isEven).transduce([1,2,3,4]);
// [ 2, 4]
```

Chaining transducers is the same as function composition. Composed transducers are executed left to right.

```javascript
result = _r.into([], _.compose(_r.filter(isEven), _r.map(inc)), [1,2,3,4]);
// [ 3, 5 ]

// these are also the same
trans = _r().filter(isEven).map(inc).value();
result = _r.into([], trans, [1,2,3,4, 5]);
result = _r().filter(isEven).map(inc).sequence([1,2,3,4,5]);
// [ 3, 5 ]
```

Like underscore, use `tap` to intercept intermediate results. Accepts current result and item just like the step function. The return value is ignored.

```javascript
result = _r()
  .filter(function(num) { return num % 2 == 0; })
  .tap(printIt)
  .map(function(num) { return num * num })
  .transduce([1,2,3,200]);
// 2 []
// 200 [4]
// [4, 40000 ]
```

Support for underscore collection functions.

```javascript
result = _r().invoke('sort').sequence([[5, 1, 7], [3, 2, 1]]);
// [ [ 1, 5, 7 ], [ 1, 2, 3 ] ]

var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 40}];
result = _r.into([], _r.pluck('name'), stooges);
//  ['moe', 'larry', 'curly' ]

result = _r.into([], _r.where({age: 40}), stooges);
// [ { name: 'moe', age: 40 }, { name: 'curly', age: 40 } ]
result = _r.into([], _r.findWhere({age: 40}), stooges);
// [ { name: 'moe', age: 40 } ]


result = _r.into([], _r.every(isEven), [0, 2, 8, 4, 8]);
// [true]
result = _r.into([], _r.every(isEven), [0, 2, 7, 8, 9]);
// [false]

result = _r.into([], _r.some(isEven), [1, 3, 7, 8, 9]);
// [true]
result = _r.into([], _r.some(isEven), [1, 3, 7, 11, 9]);
// [false]

result = _r.into([], _r.contains(3), [1, 3, 7, 11, 9]);
// [true]
result = _r.into([], _r.contains(3), [1, 10, 7, 11, 9]);
// [false]

result = _r.into([], _r.find(isEven), [7, 8, 7, 11, 12]);
// [8]
result = _r.into([], _r.find(isEven), [1, 9, 13, 11, 9]);
// []

result = _r.into([], _r.first(3), [1, 9, 13, 11, 9]);
//  [1, 9, 13 ]

result = _r.into([], _r.max(), [1, 9, 13, 11, 9]);
// [13]

result = _r.into([], _r.min(), [11, 9, 13, 11, 9]);
// [9]
```

Transducers implemented:

- map
- find
- filter
- reject
- every
- some
- contains
- invoke
- pluck
- where
- findWhere
- max
- min
- first
- compact
- tap
- initial
- last
- rest
- uniq
- push
- unshift

Generic dispatch functions

- iterator
- append/conj
- empty
- wrap
- unwrap

Supporting functions

- value (into arrays or last value to match underscore by default)
- transduce
- into
- sequence
- reduce (with support for iterators, empty dispatch, early termination with reduced)
- reduced
- asCallback
- asyncCallback
- generate
- mixin
- (chain is implicit)

### Iterators

Transduce, into, etc. accept generators or any iterator in addition to arrays. An iterator can either adapt the protocol or simply define a next function.

```javascript
function* genNums(){
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 4;
  yield 7;
  yield 4;
}

result = _r.into([], _r.first(3), genNums());
// [1, 2, 3 ]
```

### Sequence generation

Generate will create an iterator that executes a callback. This can be used to generate potentially infinite sequences.

```javascript
// Returns a function that generates the next fibonacci number
// every time it is called. Use with generators below
function fib(){
  var x=1, y=1;
  return function(){
    var prev = x;
    x = y;
    y += prev;
    return prev;
  }
}
```

Different ways to use `_r.generate`.  If not chaining, creates an iterator that can be used with transduce. If chaining, creates an iterator a wraps the result. Pass true as second argument optionally call function to init on each iteration (allows reuse).

```javascript
// All results below the same
// [ 1, 1, 2, 3, 5, 8, 13 ]
result = _r.transduce(_r.first(7), _r.generate(fib()));
result = _r.into([], _r.first(7), _r.generate(fib()));
result = _r().first(7).transduce(_r.generate(fib()));
result = _r().first(7).generate(fib()).value();

result = _r(_r.generate(fib())).first(7).value();
result = _r().generate(fib()).first(7).value();

// call on init to allow reuse
trans = _r(_r.generate(fib, true)).first(7);
result = trans.value();
result = trans.value();

trans = _r().generate(fib, true).first(7);
result = trans.value();
result = trans.value();
```

### Callback Processes

Transducers are normally consumed by reduce, but since they are designed to be independent, we can use
them in a variety of processes that consume an input and produce a result, such as [CSP][3]. We can
also create a process using a simple callback where each call advances a step in the process.  These can be used as event handlers (from the [demo][4]).

```javascript
  var $demo = $('#demo3'),
      coords = _r()
        .where({type:'mousemove'})
        .map(function(e){return {x: e.clientX, y: e.clientY}})
        .map(function(p){return '('+p.x+', '+p.y+')'})
        .each(updateText)
        .asCallback(),

      click = _r()
        .where({type:'click'})
        .each(updateCount)
        .asCallback(),

      events = _r()
        .each(coords)
        .each(click)
        .asCallback();

  $demo.on('mousemove click', events);

  function updateText(p){
     $demo.html(p);
  }

  function updateCount(e, idx){
     $demo.html('Click '+idx);
  }

```
We are simply composing transducers.  The previous examples are all using transducers behind the scenes. Method chaining is implicit and is simple composition, `_r.generate` uses an iterator and passes on to `transduce`. Even `asCallback` uses transducers but steps through the results using the argument of a callback, instead of reducing over the results.

### Node Async

If you are using Node.js, `asyncCallback` returns a callback that follows the standard convention of `fn(err, item)` and accepts a continuation that is called on completion or error.

### Strings
Strings are a sequence of characters, so you can transduce over those as well. See [transduce-string][8] to lazily process strings using an [underscore.string][9] API.

### Streams
You can transduce over Node.js Streams using the [transduce-stream][7] extension which also mixes in [transduce-string][8].

```javascript
// test.js
var _r = require('transduce-stream');

var stream = _r()
  .words()
  .map(function(x){return (+x * +x)})
  .numberFormat(2)
  .surround(' ')
  .stream();

process.stdin.resume();
process.stdin.pipe(stream).pipe(process.stdout);
```

Run this from the terminal to calculate a formatted sequence of squared values.

```bash
$ echo '33 27 33 444' | node test.js
 1,089.00  729.00  1,089.00  197,136.00
```

Functions that `split` over the String are processed lazily and as soon as possible: `lines`, `words` and `chars` will process a line/word/char as they are received, and buffer any intermediate chunks appropriately.

### Generic dispatch

Since input and output are separated the transducer transformation, transducers can be reduced, and sequences can be created over any object that supports the following methods.

#### Iterator
Returns an iterator that has next function and returns `{value, done}`.  Default looks for object with iterator Symbol (or `'@@iterator'`)

#### Empty
Returns empty object of the same type as argument.  Default returns `[]` if `_.isArray` or `undefined`, `{}` if `_.isObject` and an internal sentinel to ignore otherwise (used when not buffering in `asCallback` or chained `value` expects single value.

#### Append
Accepts an item and optional key and appends the item to the object.  By default, appends to arrays and objects by key and returns last item when used in `asCallback` or chained transducer with single `value`.

### Wrap/Unwrap
When chaining transducers, the object passed to `_r(obj)` is dispatched to `_r.wrap`.  By default, the object is not wrapped if it is defined, and wrapped with `_r.empty()` if not defined. When transducing over the sequence (with `value`, `into`, etc.) the object is then unwrapped with `_r.unwrap`.  By default, unwrap calls `_r().value()` on chained transformations, extracts value from `_r.reduced` or simply returns the value.  You can provide custom dispatchers for custom wrapped values (see [transduce-string][8] for an example).

#### Example

You can dispatch to custom objects by registering supporting dispatch functions. Say, for example, you love using [immutable][6] collections.

```javascript
var _r = require('underscore-transducer'),
    _ = require('underscore'),
    Immutable = require('immutable'),
    Vector = Immutable.Vector;

_r.iterator.register(function(obj){
  if(obj instanceof Vector){
    return obj.values();
  }
});

_r.empty.register(function(obj){
  if(obj instanceof Vector){
    return Vector.empty();
  }
});

_r.append.register(function(obj, item){
  if(obj instanceof Vector){
    return obj.push(item);
  }
});

function mult(x){
  return function(y){
    return x * y;
  }
}

function isEven(x){
  return !(x % 2);
}

var vector = Vector(1,2,3,4);

// Vector [ 1, 2, 3, 4 ]
_r.sequence(vector);

// Vector [ 3, 6, 9, 12 ]
_r.sequence(_r.map(mult(3)), vector);

// Vector [ 7, 14, 21, 28 ]
_r(vector).map(mult(7)).sequence();

// Vector [ 14, 28 ]
_r(vector).map(mult(7)).filter(isEven).sequence();

// Vector [ 1, 2, 3, 4 ]
_r(vector).sequence();
```

By default, `value` transduces into an empty array if multiple values are expected, and a single value if single value is expected to match the Underscore API. To override the behavior of multiple values, simply register a dispatch an empty for an undefined object (`value` calls `_r.empty()` which by default returns an array).

```javascript
// [ 1, 2, 3, 4 ]
_r(vector).value();

_r.empty.register(function(obj){
  if(_.isUndefined(obj)){
    return Vector.empty();
  }
});

// Vector [ 1, 2, 3, 4 ]
_r(vector).value();
```

#### License
MIT

[1]: http://underscorejs.org/
[2]: https://www.youtube.com/watch?v=6mTbuzafcII
[3]: http://phuu.net/2014/08/31/csp-and-transducers.html
[4]: http://simplectic.com/projects/underscore-transducer/
[5]: http://clojure.org/transducers
[6]: https://github.com/facebook/immutable-js
[7]: https://github.com/kevinbeaty/transduce-stream
[8]: https://github.com/kevinbeaty/transduce-string
[9]: https://github.com/epeli/underscore.string
