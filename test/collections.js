var _r = require('../')._r,
    _ = require('underscore')._,
    test = require('tape'),
    trans, result;

test('each', function(t){
  t.test('iteration count', function(t){
    t.plan(4);
    trans = _r.each(function(num, i){
      t.equal(num, i+1);
    });
    result = _r.transduce(trans, [1, 2, 3]);
    t.deepEqual(result, [1, 2, 3]);
  });

  t.test('iteration result', function(t){
    t.plan(6);
    trans = _r.each(function(num, i, result){
      t.deepEqual(_.range(i), result);
    });
    result = _r.transduce(trans, _.range(5));
    t.deepEqual(_.range(5), result);
  });

  t.test('alias forEach', function(t){
    t.plan(1);
    t.equal(_r.each, _r.forEach);
  });
});

/*
test('map', function(t){
  t.test()
});
*/
