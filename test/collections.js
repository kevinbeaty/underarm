"use strict";
var _r = require('../'),
    _ = _r._,
    resolve = require('promise').resolve,
    test = require('tape'),
    undef;

function onError(t){
  return function(err){
    t.fail(err, err.stack);
  };
}

test('each', function(t){
  var trans, result;
  t.plan(4);
  trans = _r().each(function(num, i){
    t.equal(num, i+1, 'index passed with item');
  });

  trans.async().toArray([1, 2, 3])
    .then(function(result){
      t.deepEqual(result, [1, 2, 3], 'result passed through');
    })
    .then(null, onError);
});

test('map', function(t){
  t.plan(9);

  var doubled = _r().async().map(function(num){ return num * 2; });
  doubled.toArray([1,2,3])
    .then(function(result){
      t.deepEqual([2,4,6], result, 'can double');
    });

  var tripled = _r().async().map(function(num){ return num * 3; });
  tripled.toArray([1,2,3])
    .then(function(result){
      t.deepEqual([3,6,9], result, 'can triple');
    });

  _r()
    .async()
    .map(function(num){ return num * 2; })
    .toArray([1,2,3])
    .then(function(doubled){
      t.deepEqual([2,4,6], doubled, 'can double in chain');
    });

  _r(resolve([1,2,3]))
    .map(function(num){ return resolve(num * 2);})
    .then(function(doubled){
      t.deepEqual([2,4,6], doubled, 'can double in chain toArray wrapped');
    });

  _r()
    .async()
    .map(function(num){ return num * 2; })
    .into([], [1,2,3])
    .then(function(doubled){
      t.deepEqual([2,4,6], doubled, 'can double in chain into async');
    });

  _r([1,2,3]) 
    .async()
    .map(function(num){ return num * 2; })
    .into([])
    .then(function(doubled){
      t.deepEqual([2,4,6], doubled, 'can double in chain into wrapped with from');
    });

  _r([1,2,3]) 
    .map(function(num){ return num * 2; })
    .async()
    .into()
    .then(function(doubled){
      t.deepEqual([2,4,6], doubled, 'can double in chain into wrapped');
    });

  _r([1,2,3])
    .map(function(num){ return num * 2; })
    .then(function(doubled){
      t.deepEqual([2,4,6], doubled, 'can double in chain with wrapped value');
    });

  _r(resolve([1,2,3]))
    .map(function(num){ return resolve(num * 2); })
    .map(function(num){ return resolve(num * 3); })
    .then(function(result){
      t.deepEqual([6,12,18], result, 'can double and triple in chain value');
    });
});

test('find', function(t) {
  t.plan(7);
  var array = [1, 2, 3, 4];
  _r(array).async().find(function(n) { return n > 2; })
    .then(function(result){
      t.deepEqual(result, 3, 'should return first found `value`');
    });

  _r(array).async().find(function() { return false; })
    .then(function(result){
      t.deepEqual(result, undef, 'should return `undefined` if `value` is not found');
    });

  // Matching an object like _.findWhere.
  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}, {a: 2, b: 4}];
  _r(list)
    .find({a: 1})
    .then(function(result){
      t.deepEqual(result, {a: 1, b: 2}, 'can be used as findWhere');
    });
  _r(resolve(list))
    .find({b: 4})
    .then(function(result){
      t.deepEqual(result, {a: 1, b: 4});
    });

  _r(list)
    .find({c: 1})
    .then(function(result){
      t.ok(result === undef, 'undefined when not found');
    });

  _r(resolve([]))
    .find({c: 1})
    .then(function(result){
      t.ok(result === undef, 'undefined when searching empty list');
    });

  var result = _r([1,2,3]).find(function(num){ return num * 2 === 4; }).value();
  resolve(result).then(function(result){
    t.equal(result, 2, 'found the first "2" and broke the loop');
  });
});

test('filter', function(t) {
  t.plan(3);

  var evenArray = resolve([1, 2, 3, 4, 5, 6]);
  var evenObjectUnwrapped = {one: 1, two: 2, three: 3};
  var evenObject = resolve(evenObjectUnwrapped);
  var isEven = function(num){ return num % 2 === 0; };

  _r(evenArray)
    .filter(isEven)
    .then(function(result){
      t.deepEqual(result, [2, 4, 6]);
    });

  _r([{}, evenObject, resolve([])])
    .filter('two')
    .then(function(result){
      t.deepEqual(result, [evenObjectUnwrapped], 'predicate string map to object properties');
    });

  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
  _r(list)
    .filter({a: 1})
    .then(function(result){
      t.deepEqual(result, [{a: 1, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}]);
    });
});
