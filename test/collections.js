var _r = require('../'),
    _ = _r._,
    resolve = require('promise').resolve,
    test = require('tape'),
    undef;

function onError(t){
  return function(err){
    t.fail(err, err.stack);
  }
}

test('each', function(t){
  var trans, result;
  t.plan(4);
  trans = _r.each(function(num, i){
    t.equal(num, i+1, 'index passed with item');
  });

  _r.sequenceAsync(trans, [1, 2, 3])
    .then(function(result){
      t.deepEqual(result, [1, 2, 3], 'result passed through');
    })
    .then(null, onError);
});

test('map', function(t){
  t.plan(9);

  var doubled = _r.map(function(num){ return num * 2; });
  _r.sequenceAsync(doubled, [1,2,3])
    .then(function(result){
      t.deepEqual([2,4,6], result, 'can double');
    });

  var tripled = _r.map(function(num){ return num * 3; });
  _r.sequenceAsync(tripled, [1,2,3])
    .then(function(result){
      t.deepEqual([3,6,9], result, 'can triple');
    });

  _r()
    .map(function(num){ return num * 2; })
    .sequenceAsync([1,2,3])
    .then(function(doubled){
      t.deepEqual([2,4,6], doubled, 'can double in chain');
    });

  _r(resolve([1,2,3]))
    .map(function(num){ return resolve(num * 2);})
    .sequenceAsync()
    .then(function(doubled){
      t.deepEqual([2,4,6], doubled, 'can double in chain sequence wrapped');
    });

  _r()
    .map(function(num){ return num * 2; })
    .intoAsync([], [1,2,3])
    .then(function(doubled){
      t.deepEqual([2,4,6], doubled, 'can double in chain into async');
    });

  _r([1,2,3]) 
    .map(function(num){ return num * 2; })
    .intoAsync([])
    .then(function(doubled){
      t.deepEqual([2,4,6], doubled, 'can double in chain into wrapped with from');
    });

  _r([1,2,3]) 
    .map(function(num){ return num * 2; })
    .intoAsync()
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

test('reduceAsync', function(t) {
  t.test('reduce ops', function(t){
    t.plan(2);

    _r.reduceAsync(function(sum, num){ return sum + num; }, 0, [1,2,3])
      .then(function(sum){
        t.equal(sum, 6, 'can sum up an array');
      });

    _r.reduceAsync(function(prod, num){ return resolve(prod * num); }, resolve(1), resolve([1, 2, 3, 4]))
    .then(function(prod){
      t.equal(prod, 24, 'can reduce via multiplication');
    });
  });

  t.test('alias', function(t) {
    t.plan(2);
    t.strictEqual(_r.reduceAsync, _r.foldlAsync, 'alias foldl');
    t.strictEqual(_r.reduceAsync, _r.injectAsync, 'alias inject');
  });
});

test('find', function(t) {
  t.plan(7);
  var array = [1, 2, 3, 4];
  _r.sequenceAsync(_r.find(function(n) { return n > 2; }), array)
    .then(function(result){
      t.deepEqual(result, [3], 'should return first found `value`');
    });

  _r.sequenceAsync(_r.find(function() { return false; }), array)
    .then(function(result){
      t.deepEqual(result, [], 'should return `undefined` if `value` is not found');
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
    })

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

  result = _r([1,2,3]).find(function(num){ return num * 2 === 4; }).value();
  t.equal(result, 2, 'found the first "2" and broke the loop');
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
    })

  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
  _r(list)
    .filter({a: 1})
    .then(function(result){
      t.deepEqual(result, [{a: 1, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}]);
    })
});
