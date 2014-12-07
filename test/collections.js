"use strict";
var _r = require('../'),
    _ = require('lodash-node'),
    test = require('tape');

test('each', function(t){
  var trans, result;
  t.test('iteration count', function(t){
    t.plan(4);
    trans = _r.each(function(num, i){
      t.equal(num, i+1, 'index passed with item');
    });
    result = _r.toArray(trans, [1, 2, 3]);
    t.deepEqual(result, [1, 2, 3], 'result passed through');
  });

  t.test('alias', function(t){
    t.plan(1);
    t.equal(_r.each, _r.forEach, 'alias forEach');
  });
});

test('map', function(t){
  t.test('doubled', function(t){
    t.plan(5);

    var doubled = _r.map(function(num){ return num * 2; });
    t.deepEqual([2,4,6], _r.toArray(doubled, [1,2,3]), 'can double');

    var tripled = _r.map(function(num){ return num * 3; });
    t.deepEqual([3,6,9], _r.toArray(tripled, [1,2,3]), 'can triple');

    doubled = _r().map(function(num){ return num * 2; }).toArray([1,2,3]);
    t.deepEqual([2,4,6], doubled, 'can double in chain');

    doubled = _r([1,2,3]).map(function(num){ return num * 2; }).value();
    t.deepEqual([2,4,6], doubled, 'can double in chain with wrapped value');

    doubled = _r([1,2,3])
      .map(function(num){ return num * 2; })
      .map(function(num){ return num * 3; })
      .value();
    t.deepEqual([6,12,18], doubled, 'can double and triple in chain value');
  });

  t.test('alias', function(t){
    t.plan(1);
    t.equal(_r.map, _r.collect, 'alias collect');
  });
});

test('reduce', function(t) {
  t.test('reduce ops', function(t){
    t.plan(2);

    var sum = _r.reduce(function(sum, num){ return sum + num; }, 0, [1,2,3]);
    t.equal(sum, 6, 'can sum up an array');

    var prod = _r.reduce(function(prod, num){ return prod * num; }, 1, [1, 2, 3, 4]);
    t.equal(prod, 24, 'can reduce via multiplication');
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
    t.strictEqual(_r.toArray(_r.find(function(n) { return n > 2; }), array)[0], 3, 'should return first found `value`');
    t.strictEqual(_r.toArray(_r.find(function() { return false; }), array)[0], void 0, 'should return `undefined` if `value` is not found');

    // Matching an object like _.findWhere.
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}, {a: 2, b: 4}];
    t.deepEqual(_r(list).find({a: 1}).value(), {a: 1, b: 2}, 'can be used as findWhere');
    t.deepEqual(_r(list).find({b: 4}).value(), {a: 1, b: 4});
    t.ok(!_r(list).find({c: 1}).value(), 'undefined when not found');
    t.ok(!_r([]).find({c: 1}).value(), 'undefined when searching empty list');

    var result = _r([1,2,3]).find(function(num){ return num * 2 === 4; }).value();
    t.equal(result, 2, 'found the first "2" and broke the loop');
  });

  t.test('alias', function(t) {
    t.plan(1);
    t.strictEqual(_r.detect, _r.find, 'alias for detect');
  });
});

test('filter', function(t) {
  t.test('filter ops', function(t){
    t.plan(4);

    var evenArray = [1, 2, 3, 4, 5, 6];
    var evenObject = {one: 1, two: 2, three: 3};
    var isEven = function(num){ return num % 2 === 0; };

    t.deepEqual(_r(evenArray).filter(isEven).value(), [2, 4, 6]);
    t.deepEqual(_r([{}, evenObject, []]).filter('two').value(), [evenObject], 'predicate string map to object properties');

    // Can be used like _.where.
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
    t.deepEqual(_r(list).filter({a: 1}).value(), [{a: 1, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}]);
    t.deepEqual(_r(list).filter({b: 2}).value(), [{a: 1, b: 2}, {a: 2, b: 2}]);
  });

  t.test('select', function(t) {
    t.plan(1);
    t.strictEqual(_r.filter, _r.select, 'alias for filter');
  });
});

test('reject', function(t) {
  t.test('reject ops', function(t){
    t.plan(4);

    var odds = _r([1, 2, 3, 4, 5, 6]).reject(function(num){ return num % 2 === 0; }).value();
    t.deepEqual(odds, [1, 3, 5], 'rejected each even number');
    t.deepEqual(_r([odds, {one: 1, two: 2, three: 3}]).reject('two').value(), [odds], 'predicate string map to object properties');

    // Can be used like _.where.
    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
    t.deepEqual(_r(list).reject({a: 1}).value(), [{a: 2, b: 2}]);
    t.deepEqual(_r(list).reject({b: 2}).value(), [{a: 1, b: 3}, {a: 1, b: 4}]);
  });
});

test('every', function(t) {
  t.plan(11);

  t.ok(_r([]).every(_.identity).value(), 'the empty set');
  t.ok(_r([true, true, true]).every(_.identity).value(), 'every true values');
  t.ok(!_r([true, false, true]).every(_.identity).value(), 'one false value');
  t.ok(_r([0, 10, 28]).every(function(num){ return num % 2 === 0; }).value(), 'even numbers');
  t.ok(!_r([0, 11, 28]).every(function(num){ return num % 2 === 0; }).value(), 'an odd number');
  t.ok(_r([1]).every(_.identity).value() === true, 'cast to boolean - true');
  t.ok(_r([0]).every(_.identity).value() === false, 'cast to boolean - false');

  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
  t.ok(!_r(list).every({a: 1, b: 2}).value(), 'Can be called with object');
  t.ok(_r(list).every('a').value(), 'String mapped to object property');

  list = [{a: 1, b: 2}, {a: 2, b: 2, c: true}];
  t.ok(_r(list).every({b: 2}).value(), 'Can be called with object');
  t.ok(!_r(list).every('c').value(), 'String mapped to object property');
});

test('all', function(t) {
  t.plan(1);
  t.strictEqual(_r.all, _r.every, 'alias for all');
});

test('some', function(t) {
  t.plan(14);

  t.ok(!_r([]).some().value(), 'the empty set');
  t.ok(!_r([false, false, false]).some().value(), 'all false values');
  t.ok(_r([false, false, true]).some().value(), 'one true value');
  t.ok(_r([null, 0, 'yes', false]).some().value(), 'a string');
  t.ok(!_r([null, 0, '', false]).some().value(), 'falsy values');
  t.ok(!_r([1, 11, 29]).some(function(num){ return num % 2 === 0; }).value(), 'all odd numbers');
  t.ok(_r([1, 10, 29]).some(function(num){ return num % 2 === 0; }).value(), 'an even number');
  t.ok(_r([1]).some(_.identity).value() === true, 'cast to boolean - true');
  t.ok(_r([0]).some(_.identity).value() === false, 'cast to boolean - false');
  t.ok(_r([false, false, true]).some().value());

  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];
  t.ok(!_r(list).some({a: 5, b: 2}).value(), 'Can be called with object');
  t.ok(_.some(list, 'a'), 'String mapped to object property');

  list = [{a: 1, b: 2}, {a: 2, b: 2, c: true}];
  t.ok(_r(list).some({b: 2}).value(), 'Can be called with object');
  t.ok(!_r(list).some('d').value(), 'String mapped to object property');
});

test('any', function(t) {
  t.plan(1);
  t.strictEqual(_r.any, _r.some, 'alias for any');
});


test('contains', function(t) {
  t.plan(2);
  t.ok(_r([1, 2, 3]).contains(2).value(), 'two is in the array');
  t.ok(!_r([1, 3, 9]).contains(2).value(), 'two is not in the array');
});

test('include', function(t) {
  t.plan(1);
  t.strictEqual(_r.contains, _r.include, 'alias for contains');
});

test('invoke', function(t) {
  t.plan(2);
  var list = [[5, 1, 7], [3, 2, 1]];
  var result = _r(list).invoke('sort').value();
  t.deepEqual(result[0], [1, 5, 7], 'first array sorted');
  t.deepEqual(result[1], [1, 2, 3], 'second array sorted');
});

test('invoke w/ function reference', function(t) {
  t.plan(2);
  var list = [[5, 1, 7], [3, 2, 1]];
  var result = _r(list).invoke(Array.prototype.sort).value();
  t.deepEqual(result[0], [1, 5, 7], 'first array sorted');
  t.deepEqual(result[1], [1, 2, 3], 'second array sorted');
});

test('pluck', function(t) {
  t.plan(1);
  var people = [{name: 'moe', age: 30}, {name: 'curly', age: 50}];
  t.deepEqual(_r(people).pluck('name').value(), ['moe', 'curly'], 'pulls names out of objects');
});

test('where', function(t) {
  t.plan(4);

  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}];

  var result = _r(list).where({a: 1}).value();
  t.equal(result.length, 3);
  t.equal(result[result.length - 1].b, 4);

  result = _r(list).where({b: 2}).value();
  t.equal(result.length, 2);
  t.equal(result[0].a, 1);
});

test('findWhere', function(t) {
  t.plan(4);
  
  var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}, {a: 2, b: 4}];
  var result = _r(list).findWhere({a: 1}).value();
  t.deepEqual(result, {a: 1, b: 2});
  result = _r(list).findWhere({b: 4}).value();
  t.deepEqual(result, {a: 1, b: 4});

  result = _r(list).findWhere({c: 1}).value();
  t.ok(_.isUndefined(result), 'undefined when not found');

  result = _r([]).findWhere({c: 1}).value();
  t.ok(_.isUndefined(result), 'undefined when searching empty list');
});

test('max', function(t) {
  t.plan(9);

  t.equal(3, _r([1, 2, 3]).max().value(), 'can perform a regular Math.max');

  var neg = _r([1, 2, 3]).max(function(num){ return -num; }).value();
  t.equal(neg, 1, 'can perform a computation-based max');

  t.equal(-Infinity, _r([]).max().value(), 'Maximum value of an empty array');
  t.equal(_.max({'a': 'a'}), -Infinity, 'Maximum value of a non-numeric collection');

  t.equal(299999, _r(_.range(1, 300000)).max().value(), 'Maximum value of a too-big array');

  t.equal(3, _r([1, 2, 3, 'test']).max().value(), 'Finds correct max in array starting with num and containing a NaN');
  t.equal(3, _r(['test', 1, 2, 3]).max().value(), 'Finds correct max in array starting with NaN');

  var a = {x: -Infinity};
  var b = {x: -Infinity};
  var iterator = function(o){ return o.x; };
  t.equal(_r([a, b]).max(iterator).value(), a, 'Respects iterator return value of -Infinity');

  t.deepEqual(_r([{'a': 1}, {'a': 0, 'b': 3}, {'a': 4}, {'a': 2}]).max('a').value(), {'a': 4}, 'String keys use property iterator');
});

test('min', function(t) {
  t.plan(9);

  t.equal(1, _r([1, 2, 3]).min().value(), 'can perform a regular Math.min');

  var neg = _r([1, 2, 3]).min(function(num){ return -num; }).value();
  t.equal(neg, 3, 'can perform a computation-based min');

  t.equal(Infinity, _r([]).min().value(), 'Minimum value of an empty array');

  var now = new Date(9999999999);
  var then = new Date(0);
  t.equal(_r([now, then]).min().value(), then);

  t.equal(1, _r(_.range(1, 300000)).min().value(), 'Minimum value of a too-big array');

  t.equal(1, _r([1, 2, 3, 'test']).min().value(), 'Finds correct min in array starting with num and containing a NaN');
  t.equal(1, _r(['test', 1, 2, 3]).min().value(), 'Finds correct min in array starting with NaN');

  var a = {x: Infinity};
  var b = {x: Infinity};
  var iterator = function(o){ return o.x; };
  t.equal(_r([a, b]).min(iterator).value(), a, 'Respects iterator return value of Infinity');

  t.deepEqual(_r([{'a': 1}, {'a': 0, 'b': 3}, {'a': 4}, {'a': 2}]).min('a').value(), {'a': 0, 'b': 3}, 'String keys use property iterator');
});
