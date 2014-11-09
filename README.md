## Underarm
[![Build Status](https://secure.travis-ci.org/kevinbeaty/underarm.png)](http://travis-ci.org/kevinbeaty/underarm)

Use [transducers-js][10] or [transducers.js][11] (your choice) with the familiar [Underscore.js][1] API with extra goodies like and [asynchronous (reactive) execution][2] and [lazy generators and callback processes][4].

Also works with [any-promise][6] library (a pollyfill, es6-promise, promise, native-promise-only, bluebird, rsvp, when, q).

If you are not familiar with transducers, check out [Transducers Explained][3].

Underarm is an extension to [underscore-transducer][1]

## Install

Just install your transducers and Promise library preference and it will be auto detected and used.

### Browser
Install browser version of [transducers-js][10] or [transducers.js][11] and include with `<script>`.  Then include the browser version of underarm.

* [Development][12]
* [Minified][13]

### Node.js
Library depends on either [transducers-js][10] or [transducers.js][11]. It is your choice.  Must `npm install` either one and it will be detected automatically.  Also uses [any-promise][6] to allow choice of Promise library.

Using transducers-js:
```bash
$ npm install transducers-js
$ npm install promise # or es6-promise, bluebird, q, when, rsvp ... see any-promise
$ npm install underarm
```

Using transducers.js:
```bash
$ npm install transducers.js
$ npm install promise # or es6-promise, bluebird, q, when, rsvp ... see any-promise
$ npm install underarm
```
#### Async
Uses [transduce-async][15] to support promises in transducer `init`, `step` and `result`.

##### prototype.async()
Marks chained transformation as asynchronous.  See below for changes to API when `async`.

##### prototype.value()
resolve value as [underscore-transducer][4] if not `async`.  if chained transformation is `async` returns a promise for the value of the transformation

##### prototype.then(resolve, reject)
Marks chained transformation as `async` and adds Promise listeners to Promise `value`.  This means that any chained transformation is a promise.

#### compose
Like a normal compose when chained transformation not `async`. If `async` all arguments are interleaved with `defer`.  This allows any transducer in composed pipeline to `step` or `result` a Promise in addition to a value.  The wrapped transformer is called with value of resolved Promise.

#### transduce
Like a normal transduce when chained transformation is `async`.  If `async`, `init` and `coll` can be a Promise and `xf` can be a async transducer. The value of `coll` can be anything that can be converted to an iterator using [transduce-protocol][16]. The return value is a Promise for the result of the transformation.

#### into
Like a normal `into` when chained transformation not `async`. If `async`, `to` and `from` can be a Promise and `xf` can be a async transducer. 

#### sequence
Like a normal `sequence` when chained transformation not `async`. If `async`, `coll` can be a Promise and `xf` can be a async transducer. 

#### defer
Create a async transducer that allows wrapped transformer to `step` or `result` a Promise in addition to a value. All items will be queued and processed asap. The wrapped transformer is called with value of resolved Promise.

#### delay
Create a async transducer that delays step of wrapped transformer by `wait` milliseconds. All items will be queued and delayed and `step` will return a promise that will resolve after `wait` milliseconds for each item.

#### Sample

### throttle
Only steps results when [Underscore.js][1] throttle calls the function.  Accepts same arguments (and uses same function) as underscore.

### debounce
Only steps results when [Underscore.js][1] debounce calls the function.  Accepts same arguments (and uses same function) as underscore.

#### License
MIT

[1]: http://underscorejs.org/
[2]: http://simplectic.com/projects/underarm/
[3]: http://simplectic.com/blog/2014/transducers-explained-1/
[4]: http://simplectic.com/projects/underscore-transducer/
[6]: https://github.com/kevinbeaty/any-promise
[10]: https://github.com/cognitect-labs/transducers-js
[11]: https://github.com/jlongster/transducers.js
[12]: https://raw.githubusercontent.com/kevinbeaty/underarm/master/build/underarm.js
[13]: https://raw.githubusercontent.com/kevinbeaty/underarm/master/build/underarm.min.js
[14]: https://github.com/transduce/transduce
[15]: https://github.com/transduce/transduce-async
[16]: https://github.com/transduce/transduce-protocol
