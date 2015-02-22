# Underscore Transducer

[![Build Status](https://secure.travis-ci.org/kevinbeaty/underscore-transducer.svg)](http://travis-ci.org/kevinbeaty/underscore-transducer)

Use JavaScript transducers with the familiar [Underscore.js][1] API with extra goodies like [lazy generators and callback processes][4].

If you are not familiar with transducers, check out [Transducers Explained][3].

Too much API for you?  Just grab what you need from the [transduce][14] libraries, which underscore-transducer is based.  Want more?  Check out [underarm][18] for asynchronous (reactive) extensions.

## Install

```bash
$ npm install underscore-transducer
$ bower install underscore-transducer
```

### Browser

* [Development][12]
* [Minified][13]

Structured to allow creation of custom builds by loading only desired libs.  For example, see:

* [Base Development][20]
* [Base Minified][21]

Created by using `browserify` with [this loader][22].

### Transducers

First some helper functions and imports.

```javascript
// import, mixin and helper functions
var _r = require('underscore-transducer');

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

Chaining transducers is the same as function composition. Composed transducers are executed left to right.

```javascript
result = _r.into([], _r.compose(_r.filter(isEven), _r.map(inc)), [1,2,3,4]);
// [ 3, 5 ]

// these are also the same
trans = _r().filter(isEven).map(inc).value();
result = _r.into([], trans, [1,2,3,4, 5]);
result = _r().filter(isEven).map(inc).toArray([1,2,3,4,5]);
// [ 3, 5 ]
```

Like underscore, use `tap` to intercept intermediate results. Accepts current result and item just like the step function. The return value is ignored.

```javascript
result = _r()
  .filter(function(num) { return num % 2 == 0; })
  .tap(printIt)
  .map(function(num) { return num * num })
  .toArray([1,2,3,200]);
// 2 []
// 200 [4]
// [4, 40000 ]
```

Support for underscore collection functions.

```javascript
result = _r().invoke('sort').toArray([[5, 1, 7], [3, 2, 1]]);
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

result = _r.into([], _r.some(isEven), [1, 3, 7, 11, 9]);
// [false]

result = _r.into([], _r.contains(3), [1, 3, 7, 11, 9]);
// [true]

result = _r.into([], _r.find(isEven), [7, 8, 7, 11, 12]);
// [8]

result = _r.into([], _r.first(3), [1, 9, 13, 11, 9]);
//  [1, 9, 13 ]
```

Transducers implemented

#### Base
Base Transducers mixing common functionality from supported [transduce][14] implementations.

##### map(f)
Step all items after applying a mapping function to each item. Wraps mapping function with `_r.iteratee`.

Alias: collect

##### filter(predicate)
Step all the items that pass a truth test. Wraps predicate with `_r.iteratee`.

Alias: select.

##### remove(predicate)

Step all the items that fail a truth test. Wraps predicate with `_r.iteratee`.

Alias: reject

##### take(n?)

Step the first item if `n` is undefined. Passing `n` will step the first N values in the array.

Resolves as single value if n is undefined.

Alias: first, head

##### takeWhile(predicate)
Takes items until predicate returns false. Wraps predicate with `_r.iteratee`.

##### drop(n?)
Steps everything but the first item if n is undefined.  Passing an `n` will drop N values.

Alias: rest, tail

##### dropWhile(predicate)
Drops items while predicate returns true. Wraps predicate with `_r.iteratee`.

##### cat
Concatenating transducer.

NOTE: unlike libraries, cat should be called as a function. Use `_r.cat()` instead of `_r.cat`

##### mapcat(f)
Composition of `_r.map(f)` and `_r.cat()`. Wraps mapping function with `_r.iteratee`

##### partitionAll(n)
Partitions the source into arrays of size n. When transformer completes, the array will be stepped with any remaining items.

Alias: chunkAll

##### partitionBy(f)
Partitions the source into sub arrays while the value of the function changes equality. Wrap partitioning function by `_r.iteratee`.

##### compact()
Trim out all falsey values.

##### invoke(method)
Invoke a method (with arguments) on every item.

##### pluck(key)
Convenience version of a common use case of `map`: fetching a property.

##### where(attrs)
Convenience version of a common use case of `filter`: selecting only objects containing specific `key:value` pairs.

#### Array

##### forEach(iteratee)
Passes every item through unchanged, but after executing `callback(item, idx)`.  Can be useful for "tapping into" composed transducer pipelines.   The return value of the callback is ignored, item is passed unchanged. (See [transduce-stream][7] for a use case.)

Alias: each

##### find(predicate)
Like filter, but terminates transducer pipeline with the result of the first item that passes the predicate test. Will always step either 0 (if not found) or 1 (if found) values.

Resolves as single value.

Alias: detect

##### findWhere(attrs)
Convenience version of a common use case of `find`: getting the first object containing specific `key:value` pairs. Early termination when found.

Resolves as single value.

##### every(predicate?)
Checks to see if every item passes the predicate test.  Steps a single item `true` or `false`.  Early termination on `false`.  Wraps predicate in `_r.iteratee`

Resolves as single value.

Alias: all

##### some(predicate?)
Checks to see if some item passes the predicate test.  Steps a single item `true` or `false`.  Early termination on `true`. Wraps predicate in `_r.iteratee`

Resolves as single value.

Alias: any

##### contains(target)
Does the stream contain the target value (`target === item`)? Steps a single item `true` or `false`. Early termination on `true`.

Resolves as single value.

Alias: include

##### push(...args)
Passes all items straight through until the result is requested.  Once completed, steps every argument through the pipeline, before returning the result.  This effectively pushes values on the end of the stream.

##### unshift(...args)
Before stepping the first item, steps all arguments through the pipeline, then passes every item through unchanged.  This effectively unshifts values onto the beginning of the stream.

##### at(index)
Retrieves the value at the given index. Similar to indexing into an array.

Resolves as single value.

##### slice(begin? end?)
Like array slice, but with transducers.  Steps items between `begin` (inclusive) and `end` (exclusive).  If either index is negative, indexes from end of transformation.  If `end` is undefined, steps until result of transformation. If `begin` is undefined, begins at 0.

Note that if either index is negative, items will be buffered until completion.

##### initial(n?)
Steps everything but the last entry. Passing `n` will step all values excluding the last N.

Note that no items will be sent and all items will be buffered until completion.

##### last(n?)
Step the last element. Passing `n` will step the last N  values.

Resolves as single value if `n` is undefined

Note that no items will be sent until completion.

##### unique(isSorted?, iteratee?)
Produce a duplicate-free version of the transformation. If the transformation has already been sorted, you have the option of using an algorithm that maintains less state. If iteratee is passed, it will be wrapped with `_r.iteratee` and use return value for comparison.

Alias: uniq

#### Math

##### min(f?)
Steps the max value on the result of the transformation. if `f` is provided, it is wrapped with `_r.iteratee` and called with each item and the return value is used to compare values. Otherwise, the items are compared as numbers.

Resolves as single value.

##### max(f?)
Steps the max value on the result of the transformation. if `f` is provided, it is wrapped with `_r.iteratee` and called with each item and the return value is used to compare values. Otherwise, the items are compared as numbers.

Resolves as single value.

#### Strings

Strings are a sequence of characters, so you can transduce over those as well. Particularly useful with [transduce-stream][7].

Functions that `split` over streams are treated as a substring, and splits across the entire transformation.  This allows methods to work with chunks sent through streams.  Methods that `split` over the String are processed lazily and as soon as possible: `lines`, `words` and `chars` will process a line/word/char as they are received, and buffer any intermediate chunks appropriately.

##### split(separator, limit)
Works like `''.split` but splits across entire sequence of items. Accepts separator (String or RegExp) and limit of substrings to send.

##### join(separator)
Buffers all items and joins results on transducer `result`.

Resolves as a single value.

##### nonEmpty()
Only steps items that are non empty strings (`input.trim().length > 0`).

##### lines(limit?)
Split chunks into lines and steps each line up to the optional limit.

##### chars(limit?)
Split chunks into characters and steps each char up to the optional limit.

##### words(delimiter?, limit?)
Split chunks into words and steps each word up to the optional limit. Can pass an optional delimiter to identify words, default on whitespace (`/\s+/`).

### Chaining
Chaining is implicit when calling as a function `_r()`, and the source can be optionally passed as an argument to the function. When chaining, each of the transducers can be called as a builder similar to underscore.

##### value()
Call on a chained transformation to sequence a wrapped value through the transformation and resolve as a value.  The value returned is similar to underscore. Transducers that resolve as a single value are noted above.  If a function does not resolve as a single value, resolves a a collection determined by `_r.empty(source)` (see below, normally an array).

##### compose()
Call on chained transformation to compose all transducer functions in chain and return a transducer that can be used to pass to transduce functions.

Alias: transducer

##### mixin()
Mixin custom transducer creating functions. Transducer creating functions will be called with arguments passed when chaining and should return a transducer. All transducers described above are mixed in.

### Transduce functions

Adds functionality from [transduce][14] with default values from dispatched functions and chained transformations.

##### toArray(xf?, from?)
Returns a new orray by iterating through`from` after running it through the optional transformation.

If called on a chained transformation, uses the composed transformation as `xf`. If `from` is not defined, uses the wrapped source when creating the chain, `_r(wrapped)`.

##### into(to?, xf?, from?)
Returns a new collection appending all items into the empty collection `to` by passing all items from source collection `from` through the transformation `xf`.

Uses generic dispatch `_r.append` for reducing function.  If the `from` collection is undefined, creates an empty collection using `_r.empty()`. If `xf` is a chained transformation, composes it.

Delegates to `_r.transduce(xf, _r.append, to, from)` if `xf is defined, otherwise `_r.reduce(_r.append, to, from)` if `xf` is undefined.

If called on a chained transformation, uses the composed transformation as `xf`. If `from` is not defined, uses the wrapped source when creating the chain, `_r(wrapped)`. If `to` is not defined, uses `_r.empty(from)` to create an empty value.

##### transduce(xf?, f, init, coll?)
Transduce over a transformation using the installed transducers library, using chained transformation if chaining.  If chaining and the source collection is not defined, uses wrapped source passed when creating the chain `_r(wrapped)`.  Calls generic dispatch `_r.unwrap` with result before returning.

##### reduce(f, init, coll?)
Reduces over a transformation using the installed transducers library. If the source `coll` is undefined, or null, creates an empty source by dispatching to `_r.empty(coll)`.

Alias: foldl, inject

##### reduced
Ensures values are reduced to signal early termination when stepping through a transformation. Probably only useful if you want to mixin custom transducers.  Use `_r.isReduced` to check if a value is wrapped as `reduced`.  Use generic dispatch `_r.unwrap` to unwrap reduced values.


### Iterators

Transduce, into, etc. accept generators or any iterator in addition to arrays. An iterator can either adapt the protocol or simply define a next function.

```javascript
function* genNums(){
  yield 1;
  yield 2;
  yield 3;
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

If not chaining, creates an iterator that can be used with transduce. If chaining, creates an iterator a wraps the result. Pass true as second argument optionally call function to init on each iteration (allows reuse).

```javascript
// call on init to allow reuse
trans = _r().generate(fib, true).first(7);
result = trans.value();
result = trans.value();
```

### Callback Processes

Transducers can be consumed by reduce, but since they are designed to be independent, we can use them in a variety of contexts that consume an input and produce a result, such as [CSP][3]. We can also create a process using a callback where each call advances a step in the process.  These can be used as event handlers (like the [demo][4]).

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
We are composing transducers.  The previous examples are all using transducers behind the scenes. Method chaining is implicit and is composition, `_r.generate` uses an iterator and passes on to `transduce`. Even `asCallback` uses transducers but steps through the results using the argument of a callback, instead of reducing over the results.

##### tap(interceptor)
Transduce also adds `tap`, which  invokes interceptor with each result and item, and then steps through unchanged. The primary purpose of this method is to "tap into" a method chain, in order to perform operations on intermediate results within the chain. Executes interceptor with current result and item.


### Node Async

If you are using Node.js, `asyncCallback` returns a callback that follows the standard convention of `fn(err, item)` and accepts a continuation that is called on completion or error.

### Streams
You can transduce over Node.js Streams with [transduce-stream][7].

```javascript
// test.js
var _r = require('underscore-transducer');
    stream = require('transduce-stream');

var transducer = _r()
  .words()
  .map(function(x){return (+x * +x)+ ' '})
  .uniq()
  .take(4)
  .push('\n')
  .compose();

process.stdin.resume();
process.stdin.pipe(stream(transducer)).pipe(process.stdout);
```

Run this from the terminal to calculate a formatted sequence of the first 4 unique squared values.

```bash
$ echo '33 27 33 444' | node test.js
 1089  729  197136

$ node test.js << EOT
12 32
33 33
33 43
12 33 12
EOT
 144  1024  1089  1849
```

### Generic dispatch

Since input and output are separated the transducer transformation, transducers can be reduced, and sequences can be created over any object that supports the following methods.

##### iterator(value)
Returns an iterator that has next function and returns `{value, done}`.  Default looks for object with iterator Symbol (or `'@@iterator'`)

##### iteratee(value)
Just like underscore, you can use "where style" objects and strings with functions that expect a mapping function or a predicate. By default, uses `_.iteratee` to match this behavior, but setup as a dispatched function to allow custom behavior.

##### empty(value?)
Returns empty object of the same type as argument.  Default returns `[]` if `_.isArray` or `undefined`, `{}` if `_.isObject` and an internal sentinel to ignore otherwise (used when not buffering in `asCallback` or chained `value` expects single value.

##### append(result, item)
Accepts an item and optional key and appends the item to the object.  By default, appends to arrays and objects by key and returns last item when used in `asCallback` or chained transducer with single `value`.

##### wrap(value?) / unwrap(value)
When chaining transducers, the object passed to `_r(obj)` is dispatched to `_r.wrap`.  By default, the object is not wrapped if it is defined, and wrapped with `_r.empty()` if not defined. When transducing over the sequence (with `value`, `into`, etc.) the object is then unwrapped with `_r.unwrap`.  By default, unwrap calls `_r().value()` on chained transformations, extracts value from `_r.reduced` or simply returns the value.  You can provide custom dispatchers for custom wrapped values.

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

#### Utils
Finally, adds utils from [transduce][14].

##### compose()
Simple function composition of arguments. Useful for composing (combining) transducers.

##### iterable(value)
Returns the iterable for the parameter.  Returns value if conforms to iterable protocol. Returns `undefined` if cannot return en iterable.

The return value will either conform to iterator protocol that can be invoked for iteration or will be undefined.

Supports anything that returns true for `isIterable` and converts arrays to iterables over each indexed item. Converts to functions to infinite iterables that always call function on next

##### transformer(value)
Attempts to convert the parameter into a transformer.  If cannot be converted, returns `undefined`.  If defined, the return value will have `init`, `step`, `result` methods that can be used for transformation.  Converts arrays (`arrayPush`), strings (`stringAppend`), objects (`objectMerge`), functions (wrap as reducing function) or anything that `isTransformer` into a transformer.

##### protocols
Symbols (or strings that act as symbols) for `@@iterator` and [`@@transformer`][10] that you can use to configure your custom objects.

##### identity(value)
Always returns value

##### arrayPush(arr, item)
Array.push as a reducing function.  Calls push and returns array;

##### objectMerge(object, item)
Merges the item into the object.  If `item` is an array of length 2, uses first (0 index) as the key and the second (1 index) as the value.  Otherwise iterates over own properties of items and merges values with same keys into the result object.

##### stringAppend(string, item)
Appends item onto result using `+`.

##### is{Array, String, RegExp, Number, Undefined}
Predicates for object types

#### License
MIT

[1]: http://underscorejs.org/
[3]: http://simplectic.com/blog/2014/transducers-explained-1/
[4]: http://simplectic.com/projects/underscore-transducer/
[5]: http://clojure.org/transducers
[6]: https://github.com/facebook/immutable-js
[7]: https://github.com/transduce/transduce-stream
[12]: https://raw.githubusercontent.com/kevinbeaty/underscore-transducer/master/build/underscore-transducer.js
[13]: https://raw.githubusercontent.com/kevinbeaty/underscore-transducer/master/build/underscore-transducer.min.js
[14]: https://github.com/transduce/transduce
[18]: https://github.com/kevinbeaty/underarm
[19]: https://github.com/kevinbeaty/underscore-transducer/tree/master/build
[20]: https://raw.githubusercontent.com/kevinbeaty/underscore-transducer/master/build/underscore-transducer.base.js
[21]: https://raw.githubusercontent.com/kevinbeaty/underscore-transducer/master/build/underscore-transducer.base.min.js
[22]: https://github.com/kevinbeaty/underscore-transducer/tree/master/underscore-transducer.base.js
