var _r = require('../'),
    _ = require('underscore'),
    test = require('tape');

function isEven(x){
  return +x == x && (x % 2 === 0);
}

function inc(x){
  return x+1;
}

var trans, result;


test('into transduce sequence', function(t){
  t.plan(39);

  result = _r.into([], [1,2,3,4]);
  t.deepEqual(result, [1,2,3,4], 'into empty array');

  result = _r.sequence([1,2,3,4]);
  t.deepEqual(result, [1,2,3,4], 'sequence empty');

  result = _r.into({}, {one: 1, two: 2, four: 4});
  t.deepEqual(result, {one: 1, two: 2, four: 4}, 'into empty object');

  result = _r.sequence({one: 1, two: 2, four: 4});
  t.deepEqual(result, {one: 1, two: 2, four: 4}, 'sequence empty object');
  
  result = _r.into([], _r.filter(isEven), [1,2,3,4]);
  t.deepEqual(result, [2, 4], 'filter into empty array');

  result = _r.into({}, _r.filter(isEven), {one: 1, two: 2, four: 4});
  t.deepEqual(result, {two: 2, four: 4}, 'filter into empty object');

  result = _r.sequence(_r.filter(isEven), {one: 1, two: 2, four: 4});
  t.deepEqual(result, {two: 2, four: 4}, 'filter sequence empty object');

  result = _r.into([3], _r.reject(isEven), [1,2,3,4]);
  t.deepEqual(result, [3,1,3], 'reject into non empty array');

  result = _r.into({three: 3}, _r.reject(isEven), {one: 1, two: 2, four: 4});
  t.deepEqual(result, {one: 1, three: 3}, 'reject into non empty array');

  result = _r.into([3], _r.map(inc), [1,2,3,4]);
  t.deepEqual(result, [3,2,3,4,5], 'map into non empty array');

  result = _r.into([], _.compose(_r.filter(isEven), _r.map(inc)), [1,2,3,4]);
  t.deepEqual(result, [3, 5], 'compose filtered and map into empty array');

  var incIt = _r.map(inc),
      evenIt = _r.filter(isEven);
  result = _r.into([], _.compose(incIt, incIt, evenIt, incIt), [1,2,3,4]);
  t.deepEqual(result, [5, 7], 'compose filtered and map 3 into empty array');
  
  result = _r.into([], _r.invoke('sort'), [[5, 1, 7], [3, 2, 1]]);
  t.deepEqual(result, [[1, 5, 7], [1, 2, 3]], 'sort into');

  trans = _r.filter(isEven);
  result = _r.sequence(trans, [1,2,3,4,5]);
  t.deepEqual(result, [2,4], 'filter into');

  trans = _r.map(inc);
  result = _r.sequence(trans, [1,2,3,4,5]);
  t.deepEqual(result, [2,3,4,5,6], 'map into');

  trans = _.compose(_r.filter(isEven), _r.map(inc));
  result = _r.into([], trans, [1,2,3,4,5]);
  t.deepEqual(result, [3,5], 'filter and map into');

  trans = _r().filter(isEven).map(inc).transducer();
  result = _r.sequence(trans, [1,2,3,4,5]);
  t.deepEqual(result, [3,5], 'filter and map into chain');

  trans = _r().filter(isEven).map(inc);
  result = _r.into([], trans, [1,2,3,4,5]);
  t.deepEqual(result, [3,5], 'filter and map into chain');

  result = _r().filter(isEven).map(inc).transduce([1, 2, 3, 4]);
  t.deepEqual(result, [3,5], 'filter and map into chain');

  result = _r().filter(isEven).map(inc).into([1,2], [1, 2, 3, 4]);
  t.deepEqual(result, [1,2,3,5], 'filter and map chained into non empty');

  var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 40}];
  result = _r.into([], _r.pluck('name'), stooges);
  t.deepEqual(result, ['moe', 'larry', 'curly'], 'pluck into');

  result = _r.into([], _r.where({age: 40}), stooges);
  var stoogeResults = [{name: 'moe', age: 40}, {name: 'curly', age: 40}];
  t.deepEqual(result, stoogeResults, 'where into');

  stoogeResults = [{name: 'moe', age: 40}];
  result = _r.into([], _r.findWhere({age: 40}), stooges);
  t.deepEqual(result, stoogeResults, 'findWhere into');

  result = _r.into([], _r.compact(), [0, 1, false, 2, '', 3]);
  t.deepEqual(result, [1, 2, 3], 'compact into');

  result = _r.into([], _r.every(isEven), [0, 2, 8, 4, 8]);
  t.deepEqual(result, [true], 'every into true');

  result = _r.into([], _r.every(isEven), [0, 2, 7, 8, 9]);
  t.deepEqual(result, [false], 'every into false');

  result = _r.into([], _r.some(isEven), [1, 3, 7, 8, 9]);
  t.deepEqual(result, [true], 'some into true');
  result = _r.into([], _r.some(isEven), [1, 3, 7, 11, 9]);
  t.deepEqual(result, [false], 'some into false');

  result = _r.into([], _r.contains(3), [1, 3, 7, 11, 9]);
  t.deepEqual(result, [true], 'contains into true');
  result = _r.into([], _r.contains(3), [1, 10, 7, 11, 9]);
  t.deepEqual(result, [false], 'contains into false');

  result = _r.into([], _r.find(isEven), [7, 8, 7, 11, 12]);
  t.deepEqual(result, [8], 'find into found');
  result = _r.into([], _r.find(isEven), [1, 9, 13, 11, 9]);
  t.deepEqual(result, [], 'find into not found');

  result = _r.into([], _r.first(3), [1, 9, 13, 11, 9]);
  t.deepEqual(result, [1, 9, 13], 'first into');

  result = _r.into([], _r.max(), [1, 9, 13, 11, 9]);
  t.deepEqual(result, [13], 'max into');

  result = _r.into([], _r.min(), [11, 9, 13, 11, 9]);
  t.deepEqual(result, [9], 'min into');

  result = _r.into([], _r.tail(7), _.range(10));
  t.deepEqual(result, [7, 8, 9], 'tail into');

  result = _r.into([], _r.last(3), _.range(10));
  t.deepEqual(result, [7, 8, 9], 'last into');

  result = _r.into([], _r.initial(7), _.range(10));
  t.deepEqual(result, [0, 1, 2], 'initial into');

  result = _r.into([], _r.uniq(), [0, 1, 1, 3, 4, 1, 3, 2, 10, 4, 8]);
  t.deepEqual(result, [0, 1, 3, 4, 2, 10, 8], 'uniq into');
});

test('sequence into chained', function(t){
  t.plan(27);

  var results = [], items = [];
  trans = _r()
    .filter(function(num) { return num % 2 == 0; })
    .tap(function(result, item){results.push(_.clone(result)); items.push(item)})
    .map(function(num) { return num * num });
  result = _r.into([], trans, [1,2,3,200]);
  t.deepEqual(result, [4, 40000], 'filter and map chained with tap');
  t.deepEqual(results, [[], [4]], 'filter and map chained with tap results');
  t.deepEqual(items, [2, 200], 'filter and map chained with tap items');

  results = [], items = [];
  result = _r.sequence(trans, [1,2,3,200]);
  t.deepEqual(result, [4, 40000], 'sequence filter and map chained with tap');
  t.deepEqual(results, [[], [4]], 'sequence filter and map chained with tap results');
  t.deepEqual(items, [2, 200], 'sequence filter and map chained with tap items');

  results = [], items = [];
  result = _r.sequence(trans, {one: 1, two: 2, three: 3, twohundred: 200});
  t.deepEqual(result, {two: 4, twohundred: 40000}, 'sequence object filter and map chained with tap');
  t.deepEqual(results, [{}, {two: 4}], 'sequence object filter and map chained with tap results');
  t.deepEqual(items, [2, 200], 'sequence object filter and map chained with tap items');

  results = [], items = [];
  result = trans.into([], [1,2,3,200]);
  t.deepEqual(result, [4, 40000], 'chained into filter and map chained with tap');
  t.deepEqual(results, [[], [4]], 'chained into filter and map chained with tap results');
  t.deepEqual(items, [2, 200], 'chained into filter and map chained with tap items');

  results = [], items = [];
  result = trans.sequence([1,2,3,200]);
  t.deepEqual(result, [4, 40000], 'chained sequence filter and map chained with tap');
  t.deepEqual(results, [[], [4]], 'chained seqeuence filter and map chained with tap results');
  t.deepEqual(items, [2, 200], 'chained seqeuence filter and map chained with tap items');

  results = [], items = [];
  result = trans.sequence({one: 1, two: 2, three: 3, twohundred: 200});
  t.deepEqual(result, {two: 4, twohundred: 40000}, 'wrap chained sequence object filter and map chained with tap');
  t.deepEqual(results, [{}, {two: 4}], 'wrap chained sequence object filter and map chained with tap results');
  t.deepEqual(items, [2, 200], 'wrap chained sequence object filter and map chained with tap items');

  results = [], items = [];
  result = trans.withSource([1,2,3,200]).into([]);
  t.deepEqual(result, [4, 40000], 'wrap chained into filter and map chained with tap');
  t.deepEqual(results, [[], [4]], 'wrap chained into filter and map chained with tap results');
  t.deepEqual(items, [2, 200], 'wrap chained into filter and map chained with tap items');

  results = [], items = [];
  result = trans.withSource([1,2,3,200]).sequence();
  t.deepEqual(result, [4, 40000], 'wrap chained sequence filter and map chained with tap');
  t.deepEqual(results, [[], [4]], 'wrap chained seqeuence filter and map chained with tap results');
  t.deepEqual(items, [2, 200], 'wrap chained seqeuence filter and map chained with tap items');

  results = [], items = [];
  result = trans.withSource({one: 1, two: 2, three: 3, twohundred: 200}).sequence();
  t.deepEqual(result, {two: 4, twohundred: 40000}, 'wrap chained sequence object filter and map chained with tap');
  t.deepEqual(results, [{}, {two: 4}], 'wrap chained sequence object filter and map chained with tap results');
  t.deepEqual(items, [2, 200], 'wrap chained sequence object filter and map chained with tap items');

});

test('asCallback', function(t){
  t.plan(2);

  var results = [],
      cb = _r().filter(isEven).map(inc).each(appendEach).take(2).asCallback();

  _.each([1,1,2,3,4,4,5], cb);
  t.deepEqual(results, [3,5]);

  cb = _r().filter(isEven).map(inc).each(appendEach).asCallback();
  results = [];
  _.each(_.range(1, 10), cb);
  t.deepEqual(results, [3,5,7,9]);

  function appendEach(item){
    results.push(item);
  }
});

test('asyncCallback', function(t){
  t.plan(9);

  var results, result, cb, abort = new Error('abort');

  cb = _r().filter(isEven).map(inc).each(appendEach).take(2).asyncCallback(continuation);

  results = [];
  result = {done: false, error: false};

  _.each([1,1,2,3,4,4,5], function(item){cb(null, item)});
  t.deepEqual(results, [3,5]);
  t.deepEqual(result, {done:true, error:null});

  cb = _r().filter(isEven).map(inc).each(appendEach).take(2).asyncCallback(continuation);

  results = [];
  result = {done: false, error: false};

  _.each([1,1,2,3,4,4,5], function(item){cb(item === 3 ? abort : null, item)});
  t.deepEqual(results, [3]);
  t.deepEqual(result, {done:true, error:abort});

  results = [];
  result = {done: false, error: false};

  cb = _r().filter(isEven).map(inc).each(appendEach).asyncCallback(continuation);
  _.each(_.range(1, 10), function(item){cb(null, item)});
  t.deepEqual(results, [3,5,7,9]);
  t.deepEqual(result, {done:false, error:false});
  cb();
  t.deepEqual(result, {done:true, error:null});

  results = [];
  result = {done: false, error: false};

  cb = _r()
    .filter(isEven).map(inc).each(appendEach)
    .each(function(i){if(i===7){throw abort}}).asyncCallback(continuation);
  _.each(_.range(1, 10), function(item){cb(null, item)});
  t.deepEqual(results, [3,5,7]);
  t.deepEqual(result, {done:true, error:abort});

  function appendEach(item){
    results.push(item);
  }

  function continuation(err){
    result.done = true;
    result.error = err;
  }

});

test('dispatch', function(t){
  t.plan(8);
  function StringBuilder(str){
    if(!(this instanceof StringBuilder)) return new StringBuilder(str);

    if(_.isString(str)){
      this.strings = [str];
    } else if(_.isArray(str)){
      this.strings = str;
    } else if(str instanceof StringBuilder){
      this.strings = _.clone(str.strings);
    } else {
      this.strings = [];
    }
  }

  StringBuilder.prototype.append = function(str){
    this.strings.push(str.toString());
    return this;
  }

  StringBuilder.prototype.toString = function(){
    return this.strings.join('');
  }

  StringBuilder.prototype[_r.iterator.Symbol] = function(){
    var done = false, self = this;
    return {
      next: function(){
        if(done){
          return {done: done};
        } else {
          done = true;
          return {done:false, value: self.toString()};
        }
      }
    }
  }

  _r.wrap.register(function(obj){
    if(_.isString(obj)){
      return StringBuilder(obj);
    }
  });

  _r.unwrap.register(function(obj){
    if(obj instanceof StringBuilder){
      return obj.toString();
    }
  });

  _r.empty.register(function(obj){
    if(_.isString(obj) || obj instanceof StringBuilder){
      return StringBuilder();
    }
  });

  _r.append.register(function(obj, item){
    if(_.isString(obj)){
      return StringBuilder(item).append(item);
    } else if(obj instanceof StringBuilder){
      return obj.append(item);
    }
  });

  t.equal(_r(['Hello']).invoke('toLowerCase').value().join(''), 'hello');
  t.equal(_r(['Hello', ' ', 'World']).invoke('toUpperCase').value().join(''), 'HELLO WORLD');

  t.equal(_r(new StringBuilder('Hello')).invoke('toLowerCase').value(), 'hello');
  t.equal(_r(new StringBuilder(['Hello', ' ', 'World'])).invoke('toUpperCase').value(), 'HELLO WORLD');

  t.equal(_r('Hello').invoke('toUpperCase').value(), 'HELLO');
  t.equal(_r('Hello').invoke('toLowerCase').value(), 'hello');

  t.equal(_r('Hello').push(' ', 'World').value(), 'Hello World');
  t.equal(_r('World').unshift('Hello', ' ').value(), 'Hello World');
});

test('generate', function(t){
  t.plan(12);

  result = _r.into([], _r.first(7), _r.generate(fib()));
  t.deepEqual(result, [1,1,2,3,5,8,13], 'generate into');

  result = _r().first(7).transduce(_r.generate(fib()));
  t.deepEqual(result, [1,1,2,3,5,8,13], 'generate transduce chain');

  result = _r().first(7).generate(fib()).value();
  t.deepEqual(result, [1,1,2,3,5,8,13], 'generate chain after');

  result = _r().generate(fib()).first(7).value();
  t.deepEqual(result, [1,1,2,3,5,8,13], 'generate chain before');

  result = _r.transduce(_r.first(7), _r.generate(fib()));
  t.deepEqual(result, [1,1,2,3,5,8,13], 'generate transduce');

  result = _r(_r.generate(fib())).first(7).value();
  t.deepEqual(result, [1,1,2,3,5,8,13], 'generate with wrapper');

  result = _r(_r.generate(fib, true)).first(7).value();
  t.deepEqual(result, [1,1,2,3,5,8,13], 'generate with wrapper, callToInit');

  trans = _r(_r.generate(fib, true)).first(7);
  t.deepEqual(trans.value(), [1,1,2,3,5,8,13], 'generate with wrapper call twice');
  t.deepEqual(trans.value(), [1,1,2,3,5,8,13], 'generate with wrapper call twice');

  result = _r().generate(fib, true).first(7).value();
  t.deepEqual(result, [1,1,2,3,5,8,13], 'generate with chain');

  trans = _r().generate(fib, true).first(7);
  t.deepEqual(trans.value(), [1,1,2,3,5,8,13], 'generate with chain call twice');
  t.deepEqual(trans.value(), [1,1,2,3,5,8,13], 'generate with chain call twice');

  function fib(){
    var x=1, y=1;
    return function(){
      var prev = x;
      x = y;
      y += prev;
      return prev;
    }
  }
});
