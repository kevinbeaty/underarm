# [Underscore Transducer][4]

[![Build Status](https://secure.travis-ci.org/kevinbeaty/underscore-transducer.svg)](http://travis-ci.org/kevinbeaty/underscore-transducer)

Transducers using the familiar API from  [Underscore.js][1] that closely follow the Clojure implementation with extra goodies like lazy generators and callback processes.

[Documentation][4]

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

We are simply composing transducers. If you would like to know how these work, check
out [this video][2] or [this article][3].  The previous examples are all using transducers
behind the scenes. Method chaining is implicit and is simple composition, `_r.generate` uses an iterator and passes on to `transduce`. Even `asCallback` uses transducers but steps through the results using
the argument of a callback, instead of reducing over the results.

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

May also add object functions and "function functions" for delayed execution. Perhaps
even experiment with stepping through promises.

Supporting functions

- transduce
- into
- append/conj
- reduce (with early termination with reduced)
- reduced
- asCallback
- generate
- mixin
- lastValue
- toArray
- (chain is implicit)

[1]: http://underscorejs.org/
[2]: https://www.youtube.com/watch?v=6mTbuzafcII
[3]: http://phuu.net/2014/08/31/csp-and-transducers.html
[4]: http://simplectic.com/projects/underscore-transducer/
