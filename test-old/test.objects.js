"use strict";
/*global describe, it, expect, _r */
describe('objects tests', function(){
  describe('zipObject', function(){
    var value
    it('should zip two arrays to object', function(){
      _r(['a','b', 'c', 'd'])
        .zip([1, 2, 3, 4])
        .zipObject()
        .then(function(result){value = result})
      expect(value).to.be.eql({a:1, b:2, c:3, d:4})
    })
    it('should zip seq object back to object', function(){
      _r({a:1, b:2, c:3, d:4})
        .seq()
        .zipObject()
        .then(function(result){value = result})
      expect(value).to.be.eql({a:1, b:2, c:3, d:4})
    })
    it('should zip two producers to object', function(){
      _r(_r.map(['a','b', 'c', 'd'], function(val){return val.toUpperCase()}))
        .zip(_r([1, 2, 3, 4]).map(function(val){return -val}))
        .zipObject()
        .then(function(result){value = result})
      expect(value).to.be.eql({A:-1, B:-2, C:-3, D:-4})
    })
  })
  describe('zipObjectBy', function(){
    it('should zip object on identity', function(){
      var values = []

      _r(['a', 'b', 'c', 'b', 'c', 'c'])
        .zipObjectBy(_r.identity)
        .then(function(value){values = value})

      expect(values.a).to.be.eql('a')
      expect(values.b).to.be.eql('b')
      expect(values.c).to.be.eql('c')
    })
    it('should zip with property', function(){
      var values = []

      _r([{name:'bob', age:20}, {name:'frank', age:30},{name:'sue', age:40}])
        .zipObjectBy('name')
        .then(function(val){values = val})

      expect(values.sue.age).to.eql(40)
      expect(values.frank.age).to.be.eql(30)
      expect(values.bob.age).to.be.eql(20)
    })
    it('should zip with iterator', function(){
      var values = []

      _r([{name:'bob', age:20}, {name:'frank', age:30},{name:'sue', age:40}])
        .zipObjectBy(function(val){return 'age'+val.age})
        .then(function(val){values = val})

      expect(values.age20.name).to.eql('bob')
      expect(values.age30.name).to.be.eql('frank')
      expect(values.age40.name).to.be.eql('sue')
    })
  })
  describe('keys', function(){
    it('should iterate keys', function(){
      var values = []
      _r({a:1, b:2, c:3})
        .keys()
        .sort()
        .then(function(val){values = val})
      expect(values).to.eql(['a', 'b', 'c'])
    })
  })
  describe('values', function(){
    it('should iterate values', function(){
      var values = []
      _r({a:1, b:2, c:3})
        .values()
        .sort()
        .then(function(val){values = val})
      expect(values).to.eql([1, 2, 3])
    })
  })
  describe('entries', function(){
    it('should iterate entries', function(){
      var values = []
      _r({a:1, b:2, c:3})
        .entries()
        .sort()
        .then(function(val){values = val})
      expect(values).to.eql([['a', 1], ['b', 2], ['c', 3]])
    })
  })
  describe('extend', function(){
    it('should extend entries', function(){
      var values = []
      _r([{}, {a:1, b:2, c:3}])
        .extend({b:4, c:5, d:6}, {c:7, d:8}, {e: 9})
        .then(function(val){values = val})
      expect(values).to.eql([{b:4, c:7, d:8, e:9},{a:1, b:4, c:7, d:8, e:9}])
    })
  })
  describe('pick', function(){
    it('should pick entries', function(){
      var values = []
      _r([{a:0}, {a:1, b:2, c:3}])
        .pick('a', 'b')
        .then(function(val){values = val})
      expect(values).to.eql([{a:0}, {a:1, b:2}])

      _r([{a:0}, {a:1, b:2, c:3}])
        .pick(['a', 'c'])
        .then(function(val){values = val})
      expect(values).to.eql([{a:0}, {a:1, c:3}])

      _r([{a:0}, {a:1, b:2, c:3}])
        .pick(['a','b'], 'c')
        .then(function(val){values = val})
      expect(values).to.eql([{a:0}, {a:1, b:2, c:3}])

      _r([{a:0}, {a:1, b:2, c:3}])
        .pick(['a'], ['b', 'c'])
        .then(function(val){values = val})
      expect(values).to.eql([{a:0}, {a:1, b:2, c:3}])
    })
  })
  describe('defaults', function(){
    it('should fill defaults', function(){
      var values = []
      _r([{}, {a:1, b:2, c:3}])
        .defaults({b:4, c:5, d:6}, {c:7, d:8}, {e: 9})
        .then(function(val){values = val})
      expect(values).to.eql([{b:4, c:5, d:6, e:9},{a:1, b:2, c:3, d:6, e:9}])
    })
  })
})
