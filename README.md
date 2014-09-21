Transducers for Underscore.js that closely follow the Clojure implementation.

The transducers match the underscore signatures with two exceptions:

1. The first parameter (object, array) is removed.
2. There is no context param

All transducer functions return reducers.

Example

```javascript
var _r = require('./underscore.transducer')._r;
var _ = require('underscore');
_.mixin({r: _r});

function isEven(x){
  return x % 2 !== 1;
}

function inc(x){
  return x+1;
}

function printIt(result, input){
  console.log(input+' ['+result+']');
}

var trans, result;

result = _.r.into([3], [1,2,3,4]);
// [ 3, 1, 2, 3, 4 ]

result = _.r.into([], _.r.filter(isEven), [1,2,3,4]);
// [ 2, 4 ]

result = _.r.transduce(_.r.filter(isEven), [1,2,3,4], _r.append, [3]);
// [ 3, 2, 4]

result = _.r.transduce(_.r.filter(isEven), [1,2,3,4], _r.append, []);
result = _.r.transduce(_.r.filter(isEven), [1,2,3,4], _r.append);
result = _.r.transduce(_.r.filter(isEven), [1,2,3,4]);
result = _.r.chain(_r.filter(isEven)).transduce([1,2,3,4]);
result = _.r.chain().filter(isEven).transduce([1,2,3,4]);
// [ 2, 4]

result = _.r.into([], _.compose(_.r.filter(isEven), _.r.map(inc)), [1,2,3,4]);
// [ 3, 5 ]

trans = _.r.chain().filter(isEven).map(inc).value();
result = _.r.into([], trans, [1,2,3,4, 5]);
result = _.r.chain().filter(isEven).map(inc).transduce([1,2,3,4,5]);
// [ 3, 5 ]

result = _.r.chain()
  .filter(function(num) { return num % 2 == 0; })
  .tap(printIt)
  .map(function(num) { return num * num })
  .transduce([1,2,3,200]);
// 2 []
// 200 [4]
// [4, 40000 ]

result = _.r.chain().invoke('sort').transduce([[5, 1, 7], [3, 2, 1]]);
// [ [ 1, 5, 7 ], [ 1, 2, 3 ] ]

var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 40}];
result = _.r.into([], _.r.pluck('name'), stooges);
//  ['moe', 'larry', 'curly' ] 


result = _.r.into([], _.r.where({age: 40}), stooges);
// [ { name: 'moe', age: 40 }, { name: 'curly', age: 40 } ]
result = _.r.into([], _.r.findWhere({age: 40}), stooges);
// [ { name: 'moe', age: 40 } ]


result = _.r.into([], _.r.every(isEven), [0, 2, 8, 4, 8]);
// [true]
result = _.r.into([], _.r.every(isEven), [0, 2, 7, 8, 9]);
// [false]

result = _.r.into([], _.r.some(isEven), [1, 3, 7, 8, 9]);
// [true]
result = _.r.into([], _.r.some(isEven), [1, 3, 7, 11, 9]);
// [false]

result = _.r.into([], _.r.contains(3), [1, 3, 7, 11, 9]);
// [true]
result = _.r.into([], _.r.contains(3), [1, 10, 7, 11, 9]);
// [false]

result = _.r.into([], _.r.find(isEven), [7, 8, 7, 11, 12]);
// [8]
result = _.r.into([], _.r.find(isEven), [1, 9, 13, 11, 9]);
// []

result = _.r.into([], _.r.first(3), [1, 9, 13, 11, 9]);
//  [1, 9, 13 ]

result = _.r.into([], _.r.max(), [1, 9, 13, 11, 9]);
// [13]

result = _.r.into([], _.r.min(), [11, 9, 13, 11, 9]);
// [9]
```

Supporting functions

- completing
- transduce
- into
- conj
- reduce (with early termination with reduced) 
- reduced

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
- mixin
- chain
- value

To be implemented
- initial
- last
- rest
- uniq
