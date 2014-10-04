var _r = require('../'),
    _ = require('underscore'),
    test = require('tape');

test('each', function(t){
  var trans, result;
  t.test('iteration count', function(t){
    t.plan(4);
    trans = _r.each(function(num, i){
      t.equal(num, i+1, 'index passed with item');
    });
    result = _r.transduce(trans, [1, 2, 3]);
    t.deepEqual(result, [1, 2, 3], 'result passed through');
  });

  t.test('iteration result', function(t){
    t.plan(6);
    trans = _r.each(function(num, i, result){
      t.deepEqual(_.range(i), result, 'result appended with each iteration');
    });
    result = _r.transduce(trans, _.range(5));
    t.deepEqual(_.range(5), result, 'range passed through');
  });

  t.test('alias', function(t){
    t.plan(1);
    t.equal(_r.each, _r.forEach, 'alias forEach');
  });
});

test('map', function(t){
  t.test('doubled', function(t){
    t.plan(6);

    var doubled = _r.map(function(num){ return num * 2; });
    t.deepEqual([2,4,6], _r.transduce(doubled, [1,2,3]), 'can double');

    var tripled = _r.map(function(num){ return num * 3; });
    t.deepEqual([3,6,9], _r.transduce(tripled, [1,2,3]), 'can triple');

    doubled = _r().map(function(num){ return num * 2; }).transduce([1,2,3]);
    t.deepEqual([2,4,6], doubled, 'can double in chain');

    doubled = _r([1,2,3]).map(function(num){ return num * 2; }).toArray();
    t.deepEqual([2,4,6], doubled, 'can double in chain with wrapped value');

    doubled = _r([1,2,3]).map(function(num){ return num * 2; }).toArray();
    t.deepEqual([2,4,6], doubled, 'can double in chain value');

    doubled = _r([1,2,3])
      .map(function(num){ return num * 2; })
      .map(function(num){ return num * 3; })
      .toArray();
    t.deepEqual([6,12,18], doubled, 'can double and triple in chain value');
  });

  t.test('alias', function(t){
    t.plan(1);
    t.equal(_r.map, _r.collect, 'alias collect');
  });
});

test('reduce', function(t) {
  t.test('reduce ops', function(t){
    t.plan(8);

    var sum = _r.reduce([1, 2, 3], function(sum, num){ return sum + num; }, 0);
    t.equal(sum, 6, 'can sum up an array');

    sum = _r.reduce([1, 2, 3], function(sum, num){ return sum + num; });
    t.equal(sum, 6, 'default initial value');

    var prod = _r.reduce([1, 2, 3, 4], function(prod, num){ return prod * num; });
    t.equal(prod, 24, 'can reduce via multiplication');

    t.ok(_r.reduce(null, _.noop, 138) === 138, 'handles a null (with initial value) properly');
    t.equal(_r.reduce([], _.noop, undefined), undefined, 'undefined can be passed as a special case');
    t.equal(_r.reduce([_r], _.noop), _r, 'collection of length one with no initial value returns the first item');

    t.throws(function() { _r.reduce([], _.noop); }, TypeError, 'throws an error for empty arrays with no initial value');
    t.throws(function() {_r.reduce(null, _.noop);}, TypeError, 'handles a null (without initial value) properly');
  });

  t.test('alias', function(t) {
    t.plan(2);
    t.strictEqual(_r.reduce, _r.foldl, 'alias foldl');
    t.strictEqual(_r.reduce, _r.inject, 'alias inject');
  });
});

test('find', function(t) {
  t.test('find ops', function(t){
    t.plan(7);
    var array = [1, 2, 3, 4];
    t.strictEqual(_r.transduce(_r.find(function(n) { return n > 2; }), array)[0], 3, 'should return first found `value`');
    t.strictEqual(_r.transduce(_r.find(function() { return false; }), array)[0], void 0, 'should return `undefined` if `value` is not found');

    // Matching an object like _.findWhere.
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}, {a: 2, b: 4}];
    t.deepEqual(_r().find({a: 1}).transduce(list, _r.lastValue), {a: 1, b: 2}, 'can be used as findWhere');
    t.deepEqual(_r(list).find({b: 4}).lastValue(), {a: 1, b: 4});
    t.ok(!_r(list).find({c: 1}).transduce(_r.lastValue), 'undefined when not found');
    t.ok(!_r().find({c: 1}).transduce([], _r.lastValue), 'undefined when searching empty list');

    var result = _r([1,2,3]).find(function(num){ return num * 2 === 4; }).toArray()[0];
    t.equal(result, 2, 'found the first "2" and broke the loop');
  });

  t.test('alias', function(t) {
    t.plan(1);
    t.strictEqual(_r.detect, _r.find, 'alias for detect');
  });
});

test('filter', function(t) {
  t.test('filter ops', function(t){
    t.plan(6);

    var evenArray = [1, 2, 3, 4, 5, 6];
    var evenObject = {one: 1, two: 2, three: 3};
    var isEven = function(num){ return num % 2 === 0; };

    t.deepEqual(_r(evenArray).filter(isEven).toArray(), [2, 4, 6]);
    t.deepEqual(_r([{}, evenObject, []]).filter('two').toArray(), [evenObject], 'predicate string map to object properties');

    // Can be used like _.where.
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
    t.deepEqual(_r(list).filter({a: 1}).toArray(), [{a: 1, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}]);
    t.deepEqual(_r(list).filter({b: 2}).toArray(), [{a: 1, b: 2}, {a: 2, b: 2}]);
    t.deepEqual(_r(list).filter({}).toArray(), list, 'Empty object accepts all items');
    t.deepEqual(_r(list).filter({}).toArray(), list, 'OO-filter');
  });

  t.test('select', function(t) {
    t.plan(1);
    t.strictEqual(_r.filter, _r.select, 'alias for filter');
  });
});

test('reject', function(t) {
  t.test('reject ops', function(t){
    t.plan(6);

    var odds = _r([1, 2, 3, 4, 5, 6]).reject(function(num){ return num % 2 === 0; }).toArray();
    t.deepEqual(odds, [1, 3, 5], 'rejected each even number');
    t.deepEqual(_r([odds, {one: 1, two: 2, three: 3}]).reject('two').toArray(), [odds], 'predicate string map to object properties');

    // Can be used like _.where.
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
    t.deepEqual(_r(list).reject({a: 1}).toArray(), [{a: 2, b: 2}]);
    t.deepEqual(_r(list).reject({b: 2}).toArray(), [{a: 1, b: 3}, {a: 1, b: 4}]);
    t.deepEqual(_r(list).reject({}).toArray(), [], 'Returns empty list given empty object');
    t.deepEqual(_r(list).reject([]).toArray(), [], 'Returns empty list given empty array');
  });
});

test('every', function(t) {
  t.plan(11);

  t.ok(_r([]).every(_.identity).lastValue(), 'the empty set');
  t.ok(_r([true, true, true]).every(_.identity).lastValue(), 'every true values');
  t.ok(!_r([true, false, true]).every(_.identity).lastValue(), 'one false value');
  t.ok(_r([0, 10, 28]).every(function(num){ return num % 2 === 0; }).lastValue(), 'even numbers');
  t.ok(!_r([0, 11, 28]).every(function(num){ return num % 2 === 0; }).lastValue(), 'an odd number');
  t.ok(_r([1]).every(_.identity).lastValue() === true, 'cast to boolean - true');
  t.ok(_r([0]).every(_.identity).lastValue() === false, 'cast to boolean - false');

  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
  t.ok(!_r(list).every({a: 1, b: 2}).lastValue(), 'Can be called with object');
  t.ok(_r(list).every('a').lastValue(), 'String mapped to object property');

  list = [{a: 1, b: 2}, {a: 2, b: 2, c: true}];
  t.ok(_r(list).every({b: 2}).lastValue(), 'Can be called with object');
  t.ok(!_r(list).every('c').lastValue(), 'String mapped to object property');
});

test('all', function(t) {
  t.plan(1);
  t.strictEqual(_r.all, _r.every, 'alias for all');
});

test('some', function(t) {
  t.plan(14);

  t.ok(!_r([]).some().lastValue(), 'the empty set');
  t.ok(!_r([false, false, false]).some().lastValue(), 'all false values');
  t.ok(_r([false, false, true]).some().lastValue(), 'one true value');
  t.ok(_r([null, 0, 'yes', false]).some().lastValue(), 'a string');
  t.ok(!_r([null, 0, '', false]).some().lastValue(), 'falsy values');
  t.ok(!_r([1, 11, 29]).some(function(num){ return num % 2 === 0; }).lastValue(), 'all odd numbers');
  t.ok(_r([1, 10, 29]).some(function(num){ return num % 2 === 0; }).lastValue(), 'an even number');
  t.ok(_r([1]).some(_.identity).lastValue() === true, 'cast to boolean - true');
  t.ok(_r([0]).some(_.identity).lastValue() === false, 'cast to boolean - false');
  t.ok(_r([false, false, true]).some().lastValue());

  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
  t.ok(!_r(list).some({a: 5, b: 2}).lastValue(), 'Can be called with object');
  t.ok(_.some(list, 'a'), 'String mapped to object property');

  list = [{a: 1, b: 2}, {a: 2, b: 2, c: true}];
  t.ok(_r(list).some({b: 2}).lastValue(), 'Can be called with object');
  t.ok(!_r(list).some('d').lastValue(), 'String mapped to object property');
});

test('any', function(t) {
  t.plan(1);
  t.strictEqual(_r.any, _r.some, 'alias for any');
});


test('contains', function(t) {
  t.plan(2);
  t.ok(_r([1, 2, 3]).contains(2).lastValue(), 'two is in the array');
  t.ok(!_r([1, 3, 9]).contains(2).lastValue(), 'two is not in the array');
});

test('include', function(t) {
  t.plan(1);
  t.strictEqual(_r.contains, _r.include, 'alias for contains');
});

test('invoke', function(t) {
  t.plan(2);
  var list = [[5, 1, 7], [3, 2, 1]];
  var result = _r(list).invoke('sort').toArray();
  t.deepEqual(result[0], [1, 5, 7], 'first array sorted');
  t.deepEqual(result[1], [1, 2, 3], 'second array sorted');
});

test('invoke w/ function reference', function(t) {
  t.plan(2);
  var list = [[5, 1, 7], [3, 2, 1]];
  var result = _r(list).invoke(Array.prototype.sort).toArray();
  t.deepEqual(result[0], [1, 5, 7], 'first array sorted');
  t.deepEqual(result[1], [1, 2, 3], 'second array sorted');
});

test('pluck', function(t) {
  t.plan(1);
  var people = [{name: 'moe', age: 30}, {name: 'curly', age: 50}];
  t.deepEqual(_r(people).pluck('name').toArray(), ['moe', 'curly'], 'pulls names out of objects');
});

test('where', function(t) {
  t.plan(5);

  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];

  var result = _r(list).where({a: 1}).toArray();
  t.equal(result.length, 3);
  t.equal(result[result.length - 1].b, 4);

  result = _r(list).where({b: 2}).toArray();
  t.equal(result.length, 2);
  t.equal(result[0].a, 1);

  result = _r(list).where({}).toArray();
  t.equal(result.length, list.length);
});

test('findWhere', function(t) {
  t.plan(4);
  
  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}, {a: 2, b: 4}];
  var result = _r(list).findWhere({a: 1}).lastValue();
  t.deepEqual(result, {a: 1, b: 2});
  result = _r(list).findWhere({b: 4}).lastValue();
  t.deepEqual(result, {a: 1, b: 4});

  result = _r(list).findWhere({c: 1}).lastValue();
  t.ok(_.isUndefined(result), 'undefined when not found');

  result = _r([]).findWhere({c: 1}).lastValue();
  t.ok(_.isUndefined(result), 'undefined when searching empty list');
});

test('max', function(t) {
  t.plan(9);

  t.equal(3, _r([1, 2, 3]).max().lastValue(), 'can perform a regular Math.max');

  var neg = _r([1, 2, 3]).max(function(num){ return -num; }).lastValue();
  t.equal(neg, 1, 'can perform a computation-based max');

  t.equal(-Infinity, _r([]).max().lastValue(), 'Maximum value of an empty array');
  t.equal(_.max({'a': 'a'}), -Infinity, 'Maximum value of a non-numeric collection');

  t.equal(299999, _r(_.range(1, 300000)).max().lastValue(), 'Maximum value of a too-big array');

  t.equal(3, _r([1, 2, 3, 'test']).max().lastValue(), 'Finds correct max in array starting with num and containing a NaN');
  t.equal(3, _r(['test', 1, 2, 3]).max().lastValue(), 'Finds correct max in array starting with NaN');

  var a = {x: -Infinity};
  var b = {x: -Infinity};
  var iterator = function(o){ return o.x; };
  t.equal(_r([a, b]).max(iterator).lastValue(), a, 'Respects iterator return value of -Infinity');

  t.deepEqual(_r([{'a': 1}, {'a': 0, 'b': 3}, {'a': 4}, {'a': 2}]).max('a').lastValue(), {'a': 4}, 'String keys use property iterator');
});

test('min', function(t) {
  t.plan(9);

  t.equal(1, _r([1, 2, 3]).min().lastValue(), 'can perform a regular Math.min');

  var neg = _r([1, 2, 3]).min(function(num){ return -num; }).lastValue();
  t.equal(neg, 3, 'can perform a computation-based min');

  t.equal(Infinity, _r([]).min().lastValue(), 'Minimum value of an empty array');

  var now = new Date(9999999999);
  var then = new Date(0);
  t.equal(_r([now, then]).min().lastValue(), then);

  t.equal(1, _r(_.range(1, 300000)).min().lastValue(), 'Minimum value of a too-big array');

  t.equal(1, _r([1, 2, 3, 'test']).min().lastValue(), 'Finds correct min in array starting with num and containing a NaN');
  t.equal(1, _r(['test', 1, 2, 3]).min().lastValue(), 'Finds correct min in array starting with NaN');

  var a = {x: Infinity};
  var b = {x: Infinity};
  var iterator = function(o){ return o.x; };
  t.equal(_r([a, b]).min(iterator).lastValue(), a, 'Respects iterator return value of Infinity');

  t.deepEqual(_r([{'a': 1}, {'a': 0, 'b': 3}, {'a': 4}, {'a': 2}]).min('a').lastValue(), {'a': 0, 'b': 3}, 'String keys use property iterator');
});
