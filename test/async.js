"use strict";
var _r = require('../'),
    test = require('tape'),
    resolve = require('promise').resolve,
    undef;


test('reduceAsync', function(t) {
  t.plan(5);

  var sum = _r.reduceAsync(function(sum, num){ return sum + num; }, 0, [1,2,3]);
  sum.then(function(value){
    t.equal(value, 6, 'can sum up an array');
  });

  var prod = _r.reduceAsync(function(prod, num){ return prod * num; }, 1, [1, 2, 3, 4]);
  prod.then(function(value){
    t.equal(value, 24, 'can reduce via multiplication');
  });

  sum = _r.reduceAsync(function(sum, num){ return sum + num; }, 0, [resolve(1),2,3]);
  sum.then(function(value){
    t.equal(value, 6, 'can sum up an array');
  });

  prod = _r.reduceAsync(function(prod, num){ return prod * num; }, 1, [1, 2, resolve(3), resolve(4)]);
  prod.then(function(value){
    t.equal(value, 24, 'can reduce via multiplication');
  });

  prod = _r.reduceAsync(function(prod, num){ return prod * num; }, resolve(2), resolve([1, 2, resolve(3), 4]));
  prod.then(function(value){
    t.equal(value, 48, 'can reduce via multiplication');
  });
});

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

test('transduceAsync', function(t) {
  t.plan(5);

  var plus1 = _r.map(add(1));

  var sum = _r.transduceAsync(plus1, function(sum, num){ return sum + num; }, 0, [1,2,3]);
  sum.then(function(value){
    t.equal(value, 9, 'can sum up an array');
  });

  var prod = _r.transduceAsync(plus1, function(prod, num){ return prod * num; }, 1, [1, 2, 3, 4]);
  prod.then(function(value){
    t.equal(value, 120, 'can reduce via multiplication');
  });

  sum = _r.transduceAsync(plus1, function(sum, num){ return sum + num; }, 0, [resolve(1),2,3]);
  sum.then(function(value){
    t.equal(value, 9, 'can sum up an array');
  });

  prod = _r.transduceAsync(plus1, function(prod, num){ return prod * num; }, 1, [1, 2, resolve(3), resolve(4)]);
  prod.then(function(value){
    t.equal(value, 120, 'can reduce via multiplication');
  });

  prod = _r.transduceAsync(plus1, function(prod, num){ return prod * num; }, resolve(2), resolve([1, 2, resolve(3), 4]));
  prod.then(function(value){
    t.equal(value, 240, 'can reduce via multiplication');
  });
});

test('sequenceAsync', function(t) {
  t.plan(7);

  var arr = _r.sequenceAsync([1,2,3]);
  arr.then(function(value){
    t.deepEqual(value, [1,2,3]);
  });

  var add1 = _r.sequenceAsync(_r.map(add(1)), [1,2,3]);
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

  _r([1,2,3]).map(deferAdd(1)).map(deferAdd(2))
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
    .sequenceAsync([1,2,3])
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

test('deferred transformer', function(t) {
  t.plan(4);

  var xf = {
    init: function(){
      return resolve([]);
    },
    step: function(arr, item){
      arr.push(item);
      return resolve(arr);
    },
    result: function(arr){
      return resolve(arr);
    }
  };

  var arr = _r.reduceAsync(xf, [1,2,3]);
  arr.then(function(value){
    t.deepEqual(value, [1,2,3]);
  });

  var add1 = _r.transduceAsync(_r.map(add(1)), xf, [1,2,3]);
  add1.then(function(value){
    t.deepEqual(value, [2,3,4]);
  });

  add1 = _r.transduceAsync(_r.map(add(1)), xf, [1,resolve(2),3]);
  add1.then(function(value){
    t.deepEqual(value, [2,3,4]);
  });

  add1 = _r.transduceAsync(_r.map(add(1)), xf, resolve([1,resolve(2),3]));
  add1.then(function(value){
    t.deepEqual(value, [2,3,4]);
  });
});
