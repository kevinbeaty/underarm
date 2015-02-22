'use strict'
var _r = require('../'),
    _ = _r._,
    test = require('tape'),
    Prom = require('any-promise')

function add(x){
  return function(y){
    return x+y
  }
}

function timeout(value, wait){
  return new Prom(function(resolve){
    setTimeout(resolve.bind(null, value), wait)
  })
}


test('debounce', function(t){
  t.plan(4)

  var trans

  trans = _r([1,2,3]).debounce(10).map(add(1))
    .then(function(result){
      t.deepEqual(result, [])
    })

  trans = _r([1,2,timeout(3, 20)]).debounce(3).map(add(1))
    .then(function(result){
      t.deepEqual(result, [3])
    })

  trans = _r([1,2,timeout(3, 20)]).debounce(3, true).map(add(1))
    .then(function(result){
      t.deepEqual(result, [2, 4])
    })

  trans = _r([timeout(1, 10),timeout(2, 20), timeout(3, 30)]).debounce(3, true).map(add(1))
    .then(function(result){
      t.deepEqual(result, [2, 3, 4])
    })
})

test('throttle', function(t){
  t.plan(2)

  var trans

  trans = _r([timeout(1, 1), timeout(2, 1), timeout(3, 1)]).throttle(10, {leading: false}).map(add(1))
    .then(function(result){
      t.deepEqual(result, [])
    })

  trans = _r([timeout(1, 20), timeout(2, 40), timeout(3, 60)]).throttle(10).map(add(1))
    .then(function(result){
      t.deepEqual(result, [2,3,4])
    })
})

