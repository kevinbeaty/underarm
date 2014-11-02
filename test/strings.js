"use strict";
var _r = require('../'),
    _ = require('underscore'),
    test = require('tape');

test('split', function(t){
  t.deepEqual(_r(['foo,bar']).split(',').value(), ['foo','bar']);
  t.deepEqual(_r('foo,bar').split(',').value(), ['foo','bar']);
  t.deepEqual(_r(['foo,bar,']).split(',').value(), ['foo','bar','']);
  t.deepEqual(_r('foo,bar,').split(',').value(), ['foo','bar','']);
  t.deepEqual(_r([',foo,,bar,']).split(',').value(), ['','foo','','bar','']);
  t.deepEqual(_r(',foo,,bar,').split(',').value(), ['','foo','','bar','']);

  t.deepEqual(_r(['foo', ',bar']).split(',').value(), ['foo','bar']);
  t.deepEqual(_r(['foo,', 'bar']).split(',').value(), ['foo','bar']);
  t.deepEqual(_r(['f', 'oo,', 'ba', 'r']).split(',').value(), ['foo','bar']);
  t.deepEqual(_r(['', 'f', 'oo,', 'ba', 'r', '']).split(',').value(), ['foo','bar']);
  t.deepEqual(_r(['', 'f', 'o', 'o', ',', 'ba', 'r', '', '']).split(',').value(), ['foo','bar']);

  t.deepEqual(_r(['foo,bar']).split(',', 1).value(), ['foo']);
  t.deepEqual(_r('foo,bar').split(',', 1).value(), ['foo']);
  t.deepEqual(_r(['foo', ',bar']).split(',', 1).value(), ['foo']);
  t.deepEqual(_r(['', 'f', 'o', 'o', ',', 'ba', 'r', '', '']).split(',', 1).value(), ['foo']);

  t.deepEqual(_r(['foo$$$bar$$$baz$$']).split('$$$').value(), ['foo','bar', 'baz$$']);
  t.deepEqual(_r('foo$$$bar$$$baz$$').split('$$$').value(), ['foo','bar', 'baz$$']);
  t.deepEqual(_r(['foo$$$bar$$baz$$$']).split('$$$').value(), ['foo','bar$$baz', '']);
  t.deepEqual(_r('foo$$$bar$$baz$$$').split('$$$').value(), ['foo','bar$$baz', '']);
  t.deepEqual(_r(['foo','$','$','$bar$', '$baz$', '$$']).split('$$$').value(), ['foo','bar$$baz', '']);
  t.deepEqual(_r(['foo','$','$','$bar$', '$baz$', '$$']).split('$$$', 2).value(), ['foo','bar$$baz']);
  t.deepEqual(_r(['foo','$','$','$bar$', '$baz$', '$$']).split('$$$', 1).value(), ['foo']);

  t.deepEqual(_r(['foo,bar']).split('').value(), 'foo,bar'.split(''));
  t.deepEqual(_r('foo,bar').split('').value(), 'foo,bar'.split(''));
  t.deepEqual(_r(['foo,bar']).split('', 5).value(), 'foo,b'.split(''));
  t.deepEqual(_r('foo,bar').split('', 5).value(), 'foo,b'.split(''));
  t.deepEqual(_r(['f','oo,', 'bar']).split('', 5).value(), 'foo,b'.split(''));

  t.deepEqual(_r(['foo,bar']).split('').value(), 'foo,bar'.split(''));
  t.deepEqual(_r('foo,bar').split('').value(), 'foo,bar'.split(''));
  t.deepEqual(_r(['foo,bar']).split('', 5).value(), 'foo,b'.split(''));
  t.deepEqual(_r('foo,bar').split('', 5).value(), 'foo,b'.split(''));
  t.deepEqual(_r(['f','oo,', 'bar']).split('', 5).value(), 'foo,b'.split(''));

  t.end();
});

test('String: lines', function(t) {
  t.equal(_r(['Hello\nWorld']).lines().value().length, 2);
  t.equal(_r('Hello\nWorld').lines().value().length, 2);
  t.equal(_r(['Hello World']).lines().value().length, 1);
  t.equal(_r('Hello World').lines().value().length, 1);
  t.equal(_r([123]).lines().value().length, 1);
  t.equal(_r(['']).lines().value().length, 1);
  t.equal(_r([null]).lines().value().length, 0);

  t.deepEqual(_r(['Hello World']).lines().value(), ['Hello World']);
  t.deepEqual(_r('Hello World').lines().value(), ['Hello World']);
  t.deepEqual(_r(['Hello\nWorld']).lines().value(), ['Hello', 'World']);
  t.deepEqual(_r('Hello\nWorld').lines().value(), ['Hello', 'World']);
  t.deepEqual(_r(['\nHello\n\nWorld\n']).lines().value(), ['', 'Hello', '', 'World', '']);
  t.deepEqual(_r('\nHello\n\nWorld\n').lines().value(), ['', 'Hello', '', 'World', '']);
  t.deepEqual(_r(['\nH', 'el', 'lo\n', '\nW', 'orld\n']).lines().value(), ['', 'Hello', '', 'World', '']);
  t.deepEqual(_r(['\nHello\n\nWorld\n']).lines(2).value(), ['', 'Hello']);
  t.deepEqual(_r('\nHello\n\nWorld\n').lines(2).value(), ['', 'Hello']);

  t.end();
});

test('String: chars', function(t) {
  t.equal(_r(['Hello']).chars().value().length, 5);
  t.equal(_r('Hello').chars().value().length, 5);
  t.equal(_r([123]).chars().value().length, 3);
  t.equal(_r(['']).chars().value().length, 0);
  t.equal(_r([null]).chars().value().length, 0);

  t.deepEqual(_r(['foo,bar']).chars().value(), 'foo,bar'.split(''));
  t.deepEqual(_r('foo,bar').chars().value(), 'foo,bar'.split(''));
  t.deepEqual(_r(['foo,bar']).chars(5).value(), 'foo,b'.split(''));
  t.deepEqual(_r('foo,bar').chars(5).value(), 'foo,b'.split(''));
  t.deepEqual(_r(['f','oo,', 'bar']).chars(5).value(), 'foo,b'.split(''));

  t.end();
});


test('String: words', function(t) {
  t.deepEqual(_r(['I love you!']).words().value(), ['I', 'love', 'you!']);
  t.deepEqual(_r('I love you!').words().value(), ['I', 'love', 'you!']);
  t.deepEqual(_r([' I  ', '  love   you! ',' ']).words().value(), ['I', 'love', 'you!']);
  t.deepEqual(_r(['I_love_you!']).words('_').value(), ['I', 'love', 'you!']);
  t.deepEqual(_r('I_love_you!').words('_').value(), ['I', 'love', 'you!']);
  t.deepEqual(_r(['I-', 'love', '-you!']).words(/-/).value(), ['I', 'love', 'you!']);
  t.deepEqual(_r([123]).words().value(), ['123'], '123 number has one word "123".');
  t.deepEqual(_r([0]).words().value(), ['0'], 'Zero number has one word "0".');
  t.deepEqual(_r(['']).words().value(), [], 'Empty strings has no words.');
  t.deepEqual(_r('').words().value(), [], 'Empty strings has no words.');
  t.deepEqual(_r('   ').words().value(), [], 'Blank strings has no words.');
  t.deepEqual(_r([' ','  ']).words().value(), [], 'Blank strings has no words.');
  t.deepEqual(_r([null]).words().value(), [], 'null has no words.');
  t.end();
});


test('Strings: join', function(t) {
  t.equal(_r(['', 'foo', 'bar']).join('').value(), 'foobar', 'basic join');
  t.equal(_r(['', 1, 'foo', 2]).join('').value(), '1foo2', 'join numbers and strings');
  t.equal(_r(['foo', 'bar']).join(' ').value(), 'foo bar', 'join with spaces');
  t.equal(_r(['2', '2']).join('1').value(), '212', 'join number strings');
  t.equal(_r([2,2]).join(1).value(), '212', 'join numbers');
  t.equal(_r(['foo', null]).join('').value(), 'foo', 'join null with string returns string');
  t.end();
});
