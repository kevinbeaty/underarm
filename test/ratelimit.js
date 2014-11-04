"use strict";
var _r = require('../'),
    _ = _r._,
    test = require('tape'),
    undef;

function add(x){
  return function(y){
    return x+y;
  };
}

test('debounce', function(t){
  t.plan(4);

  var trans;

  trans = _r([1,2,3]).delay(5).debounce(10).map(add(1))
    .then(function(result){
      t.deepEqual(result, []);
    });

  trans = _r([1,2,3]).delay(20).debounce(10).map(add(1))
    .then(function(result){
      t.deepEqual(result, [2, 3]);
    });

  trans = _r([1,2,3]).delay(5).debounce(10, true).map(add(1))
    .then(function(result){
      t.deepEqual(result, [2]);
    });

  trans = _r([1,2,3]).delay(20).debounce(10, true).map(add(1))
    .then(function(result){
      t.deepEqual(result, [2, 3, 4]);
    });
});

test('throttle', function(t){
  t.plan(5);

  var trans;

  trans = _r([1,2,3]).delay(1).throttle(10).map(add(1))
    .then(function(result){
      t.deepEqual(result, [2]);
    });

  trans = _r([1,2,3]).delay(1).throttle(10, {leading: false}).map(add(1))
    .then(function(result){
      t.deepEqual(result, []);
    });

  trans = _r([1,2,3]).delay(5).throttle(10).map(add(1))
    .then(function(result){
      t.deepEqual(result, [2,3]);
    });

  trans = _r([1,2,3]).delay(5).throttle(10, {trailing: false}).map(add(1))
    .then(function(result){
      t.deepEqual(result, [2,4]);
    });

  trans = _r([1,2,3]).delay(20).throttle(10).map(add(1))
    .then(function(result){
      t.deepEqual(result, [2,3,4]);
    });
});

