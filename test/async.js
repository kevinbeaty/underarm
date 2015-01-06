"use strict";
var _r = require('../'),
    test = require('tape'),
    Prom = require('any-promise'),
    undef;

function resolve(val){
  return new Prom(function(resolve){
    resolve(val);
  });
}

function add(x){
  return function(y){
    return x+y;
  };
}

function deferAdd(x){
  return function(y){
    return resolve(x+y);
  };
}

test('transduce async', function(t) {
  t.plan(6);

  var plus1 = add(1);

  var sum = _r().async().map(plus1).transduce(function(sum, num){ return sum + num; }, 0, [1,2,3]);
  sum.then(function(value){
    t.equal(value, 9, 'can sum up an array');
  });
  sum = _r().map(plus1).transduce(function(sum, num){ return sum + num; }, 0, [1,2,3]);
  t.equal(sum, 9, 'can sum up an array');

  var prod = _r().async().map(plus1).transduce(function(prod, num){ return prod * num; }, 1, [1, 2, 3, 4]);
  prod.then(function(value){
    t.equal(value, 120, 'can reduce via multiplication');
  });

  sum = _r().async().map(plus1).transduce(function(sum, num){ return sum + num; }, 0, [resolve(1),2,3]);
  sum.then(function(value){
    t.equal(value, 9, 'can sum up an array');
  });

  prod = _r().async().map(plus1).transduce(function(prod, num){ return prod * num; }, 1, [1, 2, resolve(3), resolve(4)]);
  prod.then(function(value){
    t.equal(value, 120, 'can reduce via multiplication');
  });

  prod = _r().async().map(plus1).transduce(function(prod, num){ return prod * num; }, resolve(2), resolve([1, 2, resolve(3), 4]));
  prod.then(function(value){
    t.equal(value, 240, 'can reduce via multiplication');
  });
});

test('toArray async', function(t) {
  t.plan(7);

  var arr = _r().async().toArray([1,2,3]);
  arr.then(function(value){
    t.deepEqual(value, [1,2,3]);
  });

  var add1 = _r().async().map(add(1)).toArray([1,2,3]);
  add1.then(function(value){
    t.deepEqual(value, [2,3,4]);
  });

  _r([1,2,3]).map(add(1)).map(add(2))
    .then(function(value){
      t.deepEqual(value, [4,5,6]);
    });

  _r([1,2,3]).map(deferAdd(1)).defer().map(add(2))
    .then(function(value){
      t.deepEqual(value, [4,5,6]);
    });

  _r([1,2,3]).async().map(deferAdd(1)).map(deferAdd(2))
    .then(function(value){
      t.deepEqual(value, [4,5,6]);
    });

  _r([1,resolve(2),3]).map(add(1))
    .then(function(value){
      t.deepEqual(value, [2,3,4]);
    });

  _r(resolve([1,resolve(2),3])).map(add(1))
    .then(function(value){
      t.deepEqual(value, [2,3,4]);
    });
});

test('delay', function(t) {
  t.plan(7);
  var items, trans;
  trans = _r().map(deferAdd(1)).delay(10).tap(checkItem)
    .toArray([1,2,3])
    .then(function(result){
      t.deepEqual(result, [2,3,4]);
    });

  var prevTime = +new Date(),
      expected = [2,3,4];
  function checkItem(result, item){
    var currTime = +new Date();
    t.ok(currTime > prevTime + 3, 'delay '+item);
    t.equal(expected.shift(), item, 'in order '+item);
    prevTime = currTime;
  }
});
