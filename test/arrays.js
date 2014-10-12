var _r = require('../'),
    _ = require('underscore'),
    test = require('tape');

test('push unshift', function(t) {
  t.plan(6);
  t.deepEqual(_r([1,2,3]).push(4, 5, 6).value(), [1,2,3,4,5,6]);
  t.deepEqual(_r([1,2,3]).push(4).push(5, 6).value(), [1,2,3,4,5,6]);

  t.deepEqual(_r([1,2,3]).unshift(4).unshift(5, 6).value(), [5,6,4,1,2,3]);
  t.deepEqual(_r([1,2,3]).unshift(4, 5, 6).value(), [4,5,6,1,2,3]);

  t.deepEqual(_r([1,2,3]).push(4).unshift(5, 6).value(), [5,6,1,2,3,4]);
  t.deepEqual(_r([1,2,3]).unshift(4).push(5, 6).value(), [4,1,2,3,5,6]);
});

test('first', function(t) {
  t.plan(6);

  t.equal(_r([1, 2, 3]).first().value(), 1, 'can pull out the first element of an array');
  t.deepEqual(_r([1, 2, 3]).first(0).value(), [], 'can pass an index to first');
  t.deepEqual(_r([1, 2, 3]).first(2).value(), [1, 2], 'can pass an index to first');
  t.deepEqual(_r([1, 2, 3]).first(3).value(), [1, 2, 3], 'can pass an index to first');

  t.equal(_r(null).first().value(), undefined, 'handles nulls');
  t.strictEqual(_r([1, 2, 3]).first(-1).value().length, 0);
});

test('head', function(t) {
  t.plan(1);
  t.strictEqual(_r.first, _r.head, 'alias for first');
});

test('take', function(t) {
  t.plan(1);
  t.strictEqual(_r.first, _r.take, 'alias for first');
});

test('rest', function(t) {
  t.plan(4);

  var numbers = [1, 2, 3, 4];
  t.deepEqual(_r(numbers).rest().value(), [2, 3, 4], 'working rest()');
  t.deepEqual(_r(numbers).rest(0).value(), [1, 2, 3, 4], 'working rest(0)');
  t.deepEqual(_r(numbers).rest(-1).value(), [1, 2, 3, 4], 'working rest(-1)');
  t.deepEqual(_r(numbers).rest(2).value(), [3, 4], 'rest can take an index');
});

test('tail', function(t) {
  t.plan(1);
  t.strictEqual(_r.rest, _r.tail, 'alias for rest');
});

test('drop', function(t) {
  t.plan(1);
  t.strictEqual(_r.rest, _r.drop, 'alias for rest');
});

test('initial', function(t) {
  t.plan(3);

  t.deepEqual(_r([1, 2, 3, 4, 5]).initial().value(), [1, 2, 3, 4], 'working initial()');
  t.deepEqual(_r([1, 2, 3, 4]).initial(2).value(), [1, 2], 'initial can take an index');
  t.deepEqual(_r([1, 2, 3, 4]).initial(6).value(), [], 'initial can take a large index');
});

test('last', function(t) {
  t.plan(6);

  t.equal(_r([1, 2, 3]).last().value(), 3, 'can pull out the last element of an array');
  t.deepEqual(_r([1, 2, 3]).last(0).value(), [], 'can pass an index to last');
  t.deepEqual(_r([1, 2, 3]).last(2).value(), [2, 3], 'can pass an index to last');
  t.deepEqual(_r([1, 2, 3]).last(5).value(), [1, 2, 3], 'can pass an index to last');

  t.equal(_r(null).last().value(), undefined, 'handles nulls');
  t.strictEqual(_r([1, 2, 3]).last(-1).value().length, 0);
});

test('compact', function(t) {
  t.plan(1);
  t.equal(_r([0, 1, false, 2, false, 3]).compact().value().length, 3, 'can trim out all falsy values');
});

test('uniq', function(t) {
  t.plan(9);

  var list = [1, 2, 1, 3, 1, 4];
  t.deepEqual(_r(list).uniq().value(), [1, 2, 3, 4], 'can find the unique values of an unsorted array');

  list = [1, 1, 1, 2, 2, 3];
  t.deepEqual(_r(list).uniq(true).value(), [1, 2, 3], 'can find the unique values of a sorted array faster');

  list = [{name: 'moe'}, {name: 'curly'}, {name: 'larry'}, {name: 'curly'}];
  var iterator = function(value) { return value.name; };
  t.deepEqual(_r(list).uniq(false, iterator).map(iterator).value(), ['moe', 'curly', 'larry'], 'can find the unique values of an array using a custom iterator');

  t.deepEqual(_r(list).uniq(iterator).map(iterator).value(), ['moe', 'curly', 'larry'], 'can find the unique values of an array using a custom iterator without specifying whether array is sorted');

  iterator = function(value) { return value + 1; };
  list = [1, 2, 2, 3, 4, 4];
  t.deepEqual(_r(list).uniq(true, iterator).value(), [1, 2, 3, 4], 'iterator works with sorted array');

  var a = {}, b = {}, c = {};
  t.deepEqual(_r([a, b, a, b, c]).uniq().value(), [a, b, c], 'works on values that can be tested for equivalency but not ordered');

  t.deepEqual(_r(null).uniq().value(), []);

  t.deepEqual(_r([{a: 1, b: 1}, {a: 1, b: 2}, {a: 1, b: 3}, {a: 2, b: 1}]).uniq('a').value(), [{a: 1, b: 1}, {a: 2, b: 1}], 'can use pluck like iterator');
  t.deepEqual(_r([{0: 1, b: 1}, {0: 1, b: 2}, {0: 1, b: 3}, {0: 2, b: 1}]).uniq(0).value(), [{0: 1, b: 1}, {0: 2, b: 1}], 'can use falsey pluck like iterator');
});

test('unique', function(t) {
  t.plan(1);
  t.strictEqual(_r.uniq, _r.unique, 'alias for uniq');
});
