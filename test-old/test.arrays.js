"use strict";
/*global describe, it, expect, _r */
describe('arrays tests', function(){
  describe('reverse', function(){
    it('should reverse array', function(){
      var values = [5, 2, 3, 4, 1]
        , values2
      _r(values).reverse().then(function(result){values2 = result})
      expect(values.reverse()).to.be.eql(values2)
    })
  })
  describe('slice', function(){
    it('should retrieve first three', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .slice(0, 3)
        .then(function(result){value = result})

      expect(value).to.be.eql([1, 2, 3])
    })
    it('should retrieve middle three', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .slice(2, 5)
        .then(function(result){value = result})

      expect(value).to.be.eql([3, 4, 5])
    })
    it('should retrieve last three', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .slice(3)
        .then(function(result){value = result})

      expect(value).to.be.eql([4, 5, 6])
    })
    it('should retrieve last three from end', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .slice(-3)
        .then(function(result){value = result})

      expect(value).to.be.eql([4, 5, 6])

      _r([1, 2, 3, 4, 5, 6])
        .slice(-3, 7)
        .then(function(result){value = result})

      expect(value).to.be.eql([4, 5, 6])

      _r([1, 2, 3, 4, 5, 6])
        .slice(-3, 10)
        .then(function(result){value = result})

      expect(value).to.be.eql([4, 5, 6])

    })
    it('should retrieve middle three from end', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .slice(-4, -1)
        .then(function(result){value = result})

      expect(value).to.be.eql([3, 4, 5])

      _r([1, 2, 3, 4, 5, 6])
        .slice(2, -1)
        .then(function(result){value = result})

      expect(value).to.be.eql([3, 4, 5])

      _r([1, 2, 3, 4, 5, 6])
        .slice(-4, 5)
        .then(function(result){value = result})

      expect(value).to.be.eql([3, 4, 5])
    })
    it('should retrieve first three from end', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .slice(-6, -3)
        .then(function(result){value = result})

      expect(value).to.be.eql([1, 2, 3])

      _r([1, 2, 3, 4, 5, 6])
        .slice(0, -3)
        .then(function(result){value = result})

      expect(value).to.be.eql([1, 2, 3])

      _r([1, 2, 3, 4, 5, 6])
        .slice(-6, 3)
        .then(function(result){value = result})

      expect(value).to.be.eql([1, 2, 3])
    })
    it('should be empty if begin > end ', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .slice(5, 1)
        .then(function(result){value = result})

      expect(value).to.be.eql([])

      _r([1, 2, 3, 4, 5, 6])
        .slice(-1, 1)
        .then(function(result){value = result})

      expect(value).to.be.eql([])

      _r([1, 2, 3, 4, 5, 6])
        .slice(5, -5)
        .then(function(result){value = result})

      expect(value).to.be.eql([])

      _r([1, 2, 3, 4, 5, 6])
        .slice(-1, -2)
        .then(function(result){value = result})

      expect(value).to.be.eql([])
    })
    it('should complete if request more than size', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .slice(0, 10)
        .then(function(result){value = result})

      expect(value).to.be.eql([1, 2, 3, 4, 5, 6])
    })
    it('should slice as detached iterator', function(){
      var values = []

      _r.chain(['bob is a cat', '', 'fred is a dog', 'nothing'])
        .map(/(\w+) is a (\w+)/)
        .map(_r().slice(1,3))
        .subscribe(function(val){values.push(val)})

      expect(values).to.be.eql([['bob', 'cat'], [], ['fred', 'dog'], []])
    })
  })
  describe('first', function(){
    it('should retrieve first', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .first()
        .then(function(result){value = result})

      expect(value).to.be.eql(1)
    })
    it('should retrieve first three', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .first(3)
        .then(function(result){value = result})

      expect(value).to.be.eql([1, 2, 3])
    })
    it('should complete if request more than size', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .first(10)
        .then(function(result){value = result})

      expect(value).to.be.eql([1, 2, 3, 4, 5, 6])
    })
  })
  describe('initial', function(){
    it('should skip last', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .initial()
        .then(function(result){value = result})

      expect(value).to.be.eql([1, 2, 3, 4, 5])
    })
    it('should skip last three', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .initial(3)
        .then(function(result){value = result})

      expect(value).to.be.eql([1, 2, 3])
    })
    it('should be empty if request more than size', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .initial(10)
        .then(function(result){value = result})

      expect(value).to.be.eql([])
    })
  })
  describe('last', function(){
    it('should keep last', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .last()
        .then(function(result){value = result})

      expect(value).to.be.eql(6)
    })
    it('should keep last three', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .last(3)
        .then(function(result){value = result})

      expect(value).to.be.eql([4, 5, 6])
    })
    it('should be complete array if request more than size', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .last(10)
        .then(function(result){value = result})

      expect(value).to.be.eql([1, 2, 3, 4, 5, 6])
    })
  })
  describe('rest', function(){
    it('should retrieve rest', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .rest()
        .then(function(result){value = result})

      expect(value).to.be.eql([2, 3, 4, 5, 6])
    })
    it('should retrieve rest after three', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .rest(3)
        .then(function(result){value = result})

      expect(value).to.be.eql([4, 5, 6])
    })
    it('should empty if request more than size', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .rest(10)
        .then(function(result){value = result})

      expect(value).to.be.eql([])
    })
  })
  describe('splice', function(){
    it('should add elements and not remove if howMany 0', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .splice(0, 0)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6])

      _r([1, 2, 3, 4, 5, 6])
        .splice(-6, 0, 7)
        .then(function(result){value = result})
      expect(value).to.be.eql([7, 1, 2, 3, 4, 5, 6])

      _r([1, 2, 3, 4, 5, 6])
        .splice(0, 0, 7, 8)
        .then(function(result){value = result})
      expect(value).to.be.eql([7, 8, 1, 2, 3, 4, 5, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(1, 0, 7, 8, 9)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 7, 8, 9, 2, 3, 4, 5, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(-5, 0, 7, 8, 9, 10)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 7, 8, 9, 10, 2, 3, 4, 5, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(5, 0, 8, 9)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 8, 9, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(-1, 0, 7)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 7, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(6, 0, 7, 8)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6, 7, 8])

       _r([1, 2, 3, 4, 5, 6])
        .splice(10, 0, 10)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6, 10])
    })
    it('should remove elements if howMany defined and no toAdd', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .splice(0, 0)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6])

      _r([1, 2, 3, 4, 5, 6])
        .splice(-6, 1)
        .then(function(result){value = result})
      expect(value).to.be.eql([2, 3, 4, 5, 6])

      _r([1, 2, 3, 4, 5, 6])
        .splice(0, 2)
        .then(function(result){value = result})
      expect(value).to.be.eql([3, 4, 5, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(1, 3)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 5, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(-5, 4)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(5, 3)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5])

       _r([1, 2, 3, 4, 5, 6])
        .splice(-1, 2)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5])

       _r([1, 2, 3, 4, 5, 6])
        .splice(6, 10)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(10, 10)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6])
    })
    it('should remove all after index if howMany undefined', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .splice(0)
        .then(function(result){value = result})
      expect(value).to.be.eql([])

      _r([1, 2, 3, 4, 5, 6])
        .splice(-6)
        .then(function(result){value = result})
      expect(value).to.be.eql([])

       _r([1, 2, 3, 4, 5, 6])
        .splice(1)
        .then(function(result){value = result})
      expect(value).to.be.eql([1])

       _r([1, 2, 3, 4, 5, 6])
        .splice(-5)
        .then(function(result){value = result})
      expect(value).to.be.eql([1])

       _r([1, 2, 3, 4, 5, 6])
        .splice(2)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2])

       _r([1, 2, 3, 4, 5, 6])
        .splice(-4)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2])

       _r([1, 2, 3, 4, 5, 6])
        .splice(5)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5])

       _r([1, 2, 3, 4, 5, 6])
        .splice(-1)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5])

       _r([1, 2, 3, 4, 5, 6])
        .splice(6)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(10)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6])
    })
    it('should add and remove elements', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .splice(0, 0, 1)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 1, 2, 3, 4, 5, 6])

      _r([1, 2, 3, 4, 5, 6])
        .splice(-6, 1, 7)
        .then(function(result){value = result})
      expect(value).to.be.eql([7, 2, 3, 4, 5, 6])

      _r([1, 2, 3, 4, 5, 6])
        .splice(0, 0, 7, 8)
        .then(function(result){value = result})
      expect(value).to.be.eql([7, 8, 1, 2, 3, 4, 5, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(1, 0, 7, 8, 9)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 7, 8, 9, 2, 3, 4, 5, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(-5, 2, 7, 8, 9, 10)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 7, 8, 9, 10, 4, 5, 6])

       _r([1, 2, 3, 4, 5, 6])
        .splice(5, 4, 8, 9)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 8, 9])

       _r([1, 2, 3, 4, 5, 6])
        .splice(-1, 1, 7)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 7])

       _r([1, 2, 3, 4, 5, 6])
        .splice(6, 2, 7, 8)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6, 7, 8])

       _r([1, 2, 3, 4, 5, 6])
        .splice(10, 10, 10)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6, 10])
    })
  })
  describe('pop', function(){
    it('should remove last object', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .pop()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5])

      _r([1, 2, 3, 4, 5, 6])
        .pop()
        .pop()
        .pop()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3])

      _r(value)
        .pop()
        .pop()
        .then(function(result){value = result})
      expect(value).to.be.eql([1])

      _r(value)
        .pop()
        .then(function(result){value = result})
      expect(value).to.be.eql([])

      _r(value)
        .pop()
        .pop()
        .pop()
        .then(function(result){value = result})
      expect(value).to.be.eql([])
    })
  })
  describe('push', function(){
    it('should push at end', function(){
      var value
      _r([])
        .push(3)
        .push()
        .push(1, 2)
        .push(4, [5, 6], 6)
        .push(7)
        .then(function(result){value = result})
      expect(value).to.be.eql([3, 1, 2, 4, [5, 6], 6, 7])
    })
  })
  describe('shift', function(){
    it('should remove first object', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .shift()
        .then(function(result){value = result})
      expect(value).to.be.eql([2, 3, 4, 5, 6])

      _r([1, 2, 3, 4, 5, 6])
        .shift()
        .shift()
        .shift()
        .then(function(result){value = result})
      expect(value).to.be.eql([4, 5, 6])

      _r(value)
        .shift()
        .shift()
        .then(function(result){value = result})
      expect(value).to.be.eql([6])

      _r(value)
        .shift()
        .then(function(result){value = result})
      expect(value).to.be.eql([])

      _r(value)
        .shift()
        .shift()
        .shift()
        .then(function(result){value = result})
      expect(value).to.be.eql([])
    })
  })
  describe('unshift', function(){
    it('should unshift at beginning', function(){
      var value
      _r([])
        .unshift(3)
        .unshift()
        .unshift(1, 2)
        .unshift(4, [5, 6], 6)
        .unshift(7)
        .then(function(result){value = result})
      expect(value).to.be.eql([7, 4, [5, 6], 6, 1, 2, 3])
    })
  })
  describe('join', function(){
    it('should join with separator', function(){
      var value
      _r(['a','b','c'])
        .join(', ')
        .then(function(result){value = result})
      expect(value).to.be.eql('a, b, c')

      _r(['a','b','c'])
        .join('::')
        .then(function(result){value = result})
      expect(value).to.be.eql('a::b::c')

      _r([1, 2, 3])
        .join(' + ')
        .then(function(result){value = result})
      expect(value).to.be.eql('1 + 2 + 3')
    })
    it('should join , if separator undefined', function(){
      var value
      _r(['a','b','c'])
        .join()
        .then(function(result){value = result})
      expect(value).to.be.eql('a,b,c')
    })
    it('should pass value as string single value', function(){
      var value
      _r('a')
        .join()
        .then(function(result){value = result})
      expect(value).to.be.eql('a')

      _r(1)
        .join(':')
        .then(function(result){value = result})
      expect(value).to.be.eql('1')

    })
    it('should convert separator to string', function(){
      var value
      _r([1, 2, 3])
        .join(5)
        .then(function(result){value = result})
      expect(value).to.be.eql('15253')
    })
  })
  describe('indexOf', function(){
    it('should return first index of value', function(){
      var value
      _r(['b', 'a', 'c', 'a', 'a', 'd'])
        .indexOf('a')
        .then(function(result){value = result})
      expect(value).to.be.eql(1)

      _r(['b', 'a', 'c', 'a', 'a', 'd'])
        .indexOf('b')
        .then(function(result){value = result})
      expect(value).to.be.eql(0)

      _r(['b', 'a', 'c', 'a', 'a', 'd'])
        .indexOf('d')
        .then(function(result){value = result})
      expect(value).to.be.eql(5)

      _r(['b', 'a', 'c', 'a', 'a', 'd'])
        .indexOf('e')
        .then(function(result){value = result})
      expect(value).to.be.eql(-1)
    })
  })
  describe('lastIndexOf', function(){
    it('should return last index of value', function(){
      var value
      _r(['b', 'a', 'c', 'a', 'a', 'd'])
        .lastIndexOf('a')
        .then(function(result){value = result})
      expect(value).to.be.eql(4)

      _r(['b', 'a', 'c', 'a', 'a', 'd'])
        .lastIndexOf('b')
        .then(function(result){value = result})
      expect(value).to.be.eql(0)

      _r(['b', 'a', 'c', 'a', 'a', 'd'])
        .lastIndexOf('d')
        .then(function(result){value = result})
      expect(value).to.be.eql(5)

      _r(['b', 'a', 'c', 'a', 'a', 'd'])
        .lastIndexOf('e')
        .then(function(result){value = result})
      expect(value).to.be.eql(-1)
    })
  })
  describe('concat', function(){
    it('should concat at end', function(){
      var value
      _r([])
        .concat(3)
        .concat()
        .concat(1, 2)
        .concat(4, [5, 6], 6)
        .concat(7)
        .then(function(result){value = result})
      expect(value).to.be.eql([3, 1, 2, 4, 5, 6, 6, 7])
    })
    it('should concat arrays', function(){
      var value
      _r([1])
        .concat([1, 2])
        .concat([4])
        .concat([5, 6, 7])
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 1, 2, 4, 5, 6, 7])
    })
    it('should concat producers', function(){
      var value
      _r([1])
        .concat(_r([1, 2]).map(function(val){return val*2}))
        .concat(_r([4]))
        .concat(_r().first(3).attach([5, 6, 7, 8]))
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 4, 4, 5, 6, 7])
    })
  })
  describe('compact', function(){
    it('should remove falsey values', function(){
      var value
      _r([0, 1, 2, [], [1], false, true, void 0, 0
          , 3, 4, null, NaN, undefined, "", 'hello', {}])
        .compact()
        .then(function(result){value = result})

      expect(value).to.be.eql([1, 2, [], [1], true, 3, 4, 'hello', {}])
    })
  })
  describe('flatten', function(){
    it('should flatten nested arrays', function(){
      var value
      _r([1, [2], [3, [[4]]]])
        .flatten()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4])

      _r([1, [[[2, [3]]]], [[4, [[[[5]]]]], 6], 7])
        .flatten()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6, 7])

      _r([1, [2, 3], [[4, 5], 6], 7])
        .flatten()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6, 7])

      _r([1, [2, 3], [4, 5, 6], 7])
        .flatten()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6, 7])

      _r([1, 2, 3, 4, 5, 6, 7])
        .flatten()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6, 7])
    })
    it('should flatten nested arrays shallow', function(){
      var value
      _r([1, [2], [3, [[4]]]])
        .flatten(true)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, [[4]]])

      _r([1, [[[2, [3]]]], [[4, [[[[5]]]]], 6], 7])
        .flatten(true)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, [[2, [3]]], [4, [[[[5]]]]], 6, 7])

      _r([1, [2, 3], [[4, 5], 6], 7])
        .flatten(true)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, [4, 5], 6, 7])

      _r([1, [2, 3], [4, 5, 6], 7])
        .flatten(true)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6, 7])

      _r([1, 2, 3, 4, 5, 6, 7])
        .flatten(true)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6, 7])
    })
    it('should flatten nested producers', function(){
      var value
      _r([1, [[[2, [_r([1,2,3]).any()]]]], [[_r([1,2]).map(function(x){return x*2}), [[[[5]]]]], 6], 7])
        .flatten()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, true, 2, 4, 5, 6, 7])

      _r([1, [_r.all([1,1,false]), 3], [[4, _r([4,2,1]).sort()], 6], 7])
        .flatten()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, false, 3, 4, 1, 2, 4, 6, 7])

      _r([1, [[_r([2, 3]).reverse()]], _r([4, 5, 6]).last(2), _r(7).first()])
        .flatten()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 3, 2, 5, 6, 7])

      _r(_r([_r([1, 2, 3]), _r([4, 5, 6, 7]).reverse().sort()]).reverse())
        .flatten()
        .then(function(result){value = result})
      expect(value).to.be.eql([4, 5, 6, 7, 1, 2, 3])

      _r([_r([1,2,3]), _r([4, 5, 6]), [7, 8], 9, 10])
        .flatten()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    })
  })
  describe('without', function(){
    it('should remove values', function(){
      var value
      _r([1, 2, 3, 4, 5])
        .without(1)
        .without(3, 4)
        .then(function(result){value = result})
      expect(value).to.be.eql([2, 5])

      _r([1, 2, 3, 4, 5, 4, 1, 2, 6, 3])
        .without(1, 3, 4)
        .then(function(result){value = result})
      expect(value).to.be.eql([2, 5, 2, 6])
    })
  })
  describe('unique', function(){
    it('should remove duplicate values', function(){
      var value
      _r([1, 2, 3, 4, 5])
        .unique()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5])

      _r([1, 2, 3, 4, 5])
        .unique(true)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5])

      _r([1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5])
        .unique()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5])

      _r([1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5])
        .unique(true)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5])

      _r([1, 2, 3, 4, 5, 4, 1, 2, 6, 3])
        .unique()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 6])
    })
    it('should remove duplicate values with iterator', function(){
      var value
      _r([1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5])
        .unique(false, _r.identity)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5])

      _r([1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5])
        .unique(true, _r.identity)
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5])

      _r([{a: 1, b:4}, {a:1, b:3}, {a:2, b:2}])
        .unique(true, function(val){return val.a})
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2])

      _r([{a: 1, b:4}, {a:1, b:3}, {a:2, b:2}])
        .unique(false, function(val){return val.a})
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2])

      _r([{a: 1, b:4}, {a:1, b:3}, {a:2, b:3}])
        .unique(true, function(val){return val.b})
        .then(function(result){value = result})
      expect(value).to.be.eql([4, 3])
    })
  })
  describe('union', function(){
    it('should compute union of arrays', function(){
      var value
      _r([1, 2, 3])
        .union([1, 3, 2, 4, 1, 5])
        .union([10, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 10, 8])

      _r([1, 2, 3])
        .union([1, 3, 2, 4, 1, 5], [10, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 10, 8])

      _r([])
        .union([1, 2, 3], [1, 3, 2, 4, 1, 5], [10, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 4, 5, 10, 8])
    })
    it('should compute union of producers', function(){
      var value
      _r([1, 2, 3, -1, -2, -3])
        .union(_r([1, 3, 2, 4, 1, 5]).map(function(val){return -val}))
        .union(_r([10, 8, 2, 1, -1, -5]).reverse())
        .sort()
        .then(function(result){value = result})
      expect(value).to.be.eql([-5, -4, -3, -2, -1, 1, 2, 3, 8, 10])

      _r([1, 2, 3])
        .union(_r([1, 3, 2, 4, 1, 5]).map(function(val){return -val}), _r.sort([10, 8, 2, 1]))
        .sort()
        .then(function(result){value = result})
      expect(value).to.be.eql([-5, -4, -3, -2, -1, 1, 2, 3, 8, 10])

      _r([])
        .union(_r.sort([1, 2, 3]), _r.reverse([1, 3, 2, 4, 1, 5]), _r.map([10, 8, 2, 1], _r.identity))
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2, 3, 5, 4, 10, 8])
    })
    it('should not flatten nested arrays', function(){
      var value
      _r([1, [2], 3])
        .union([1, [3, 2], 4, 1, 5])
        .union([[[[10]]], 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([1, [2], 3, [3, 2], 4, 5, [[[10]]], 8, 2])
    })
  })
  describe('intersection', function(){
    it('should compute intersection of arrays', function(){
      var value
      _r([1, 2, 3])
        .intersection([1, 3, 2, 4, 1, 5])
        .intersection([10, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2])

      _r([1, 2, 3])
        .intersection([1, 3, 2, 4, 1, 5], [10, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2])

      _r([3])
        .intersection([1, 2, 3], [1, 3, 2, 4, 1, 5], [10, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([])
    })
    it('should compute intersection of producers', function(){
      var value
      _r([1, 2, 3, -1, -2, -3, 1, 2, -3, -1])
        .intersection(_r([1, 3, 2, 4, 1, 5, -1, -2]).map(function(val){return -val}))
        .intersection(_r([10, 8, 2, 1, -1, -5]).reverse())
        .sort()
        .then(function(result){value = result})
      expect(value).to.be.eql([-1, 1, 2])

      _r([1, 2, 3])
        .intersection(_r([1, 3, 2, 4, 1, 5]).map(_r.identity), _r.sort([10, 8, 2, 1]))
        .sort()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, 2])

      _r([1, 3])
        .intersection(_r.sort([1, 2, 3]), _r.reverse([1, 3, 2, 4, 1, 5]), _r.map([10, 8, 2, 1], _r.identity))
        .then(function(result){value = result})
      expect(value).to.be.eql([1])
    })
    it('should not flatten nested arrays', function(){
      var value
        , nested = [2]
      _r([1, nested, 3])
        .intersection([1, nested, [3, 2], 4, 1, 5])
        .intersection([[[[10]]], nested, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([1, nested])
    })
  })
  describe('difference', function(){
    it('should compute difference of arrays', function(){
      var value
      _r([1, 2, 8, 7, 3, 4, 5, 6, 7, 10, 11, 6])
        .difference([1, 3, 2, 4, 1, 5])
        .difference([10, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([7, 6, 7, 11, 6])

      _r([-1, 0, 1, 2, 3, 11, 12])
        .difference([1, 3, 2, 4, 1, 5], [10, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([-1, 0, 11, 12])

      _r([3, 4, 10])
        .difference([1, 2, 3], [1, 3, 2, 4, 1, 5], [10, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([])
    })
    it('should compute difference of producers', function(){
      var value
      _r([1, 2, 3, -1, -2, -3, 1, 2, -3, -1, 11])
        .difference(_r([1, 3, 2, 4, 1, 5, -1, -2]).map(function(val){return -val}))
        .difference(_r([10, 8, 2, 1, -1, -5]).reverse())
        .sort()
        .then(function(result){value = result})
      expect(value).to.be.eql([3, 11])

      _r([1, 2, 3, 4, 5, 6])
        .difference(_r([1, 3, 2, 4, 1, 5]).map(_r.identity), _r.sort([10, 8, 2, 1]))
        .sort()
        .then(function(result){value = result})
      expect(value).to.be.eql([6])

      _r([6, 1, 5, 7, 5, 2, 6])
        .difference(_r.sort([4, 1, 2, 3]), _r.reverse([1, 3, 2, 4, 1, 5]), _r.map([10, 8, 2, 1], _r.identity))
        .then(function(result){value = result})
      expect(value).to.be.eql([6, 7, 6])
    })
    it('should not flatten nested arrays', function(){
      var value
      var nested = [3, 2]
      _r([1, [2, 3], 3, nested, [3, 2]])
        .difference([1, [2, 3], 2, nested, 4, 1, 5])
        .then(function(result){value = result})
      expect(value).to.be.eql([[2,3], 3, [3, 2]])
    })
  })
  describe('zip', function(){
    it('should zip arrays', function(){
      var value
      _r.when(_r.zip([1, 2, 3], [4, 5, 6])
        , function(result){value = result})
      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])

      _r([3, 2, 1])
        .zip([4, 5, 6], [7, 8, 8])
      .then(function(result){value = result})
      expect(value).to.be.eql([[3, 4, 7], [2, 5, 8], [1, 6, 8]])


      _r([1, 2, 8, 7, 3, 4, 5, 6, 7, 10, 11, 6])
        .zip([1, 3, 2, 4, 1, 5])
        .zip([10, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([[[1, 1], 10], [[2, 3], 8], [[8, 2], 2], [[7, 4], 1]])

      _r([-1, 0, 1, 2, 3, 11, 12])
        .zip([1, 3, 2, 4, 1, 5], [10, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([[-1, 1, 10], [0, 3, 8], [1, 2, 2], [2, 4, 1]])

      _r([3, 4, 10])
        .zip([1, 2, 3], [1, 3, 2, 4, 1, 5], [10, 8, 2, 1])
        .then(function(result){value = result})
      expect(value).to.be.eql([[3, 1, 1, 10], [4, 2, 3, 8], [10, 3, 2, 2]])
    })
    it('should zip producers', function(){
      var value
      _r([1, 2, 3])
        .zip(_r([1, 3, 2, 4]).map(function(val){return -val}))
        .zip(_r([10, 8, 2, 1, -1, -5]).reverse())
        .flatten()
        .then(function(result){value = result})
      expect(value).to.be.eql([1, -1, -5, 2, -3, -1, 3, -2, 1])

      _r([1, 2, 3, 4, 5, 6])
        .zip(_r([1, 3, 2, 4, 1, 5]).map(_r.identity), _r.sort([1, 10, 2, 8]))
        .then(function(result){value = result})
      expect(value).to.be.eql([[1, 1, 1], [2, 3, 2], [3, 2, 8], [4, 4, 10]])

      _r([6, 1, 5, 7, 5, 2, 6])
        .zip(_r.sort([4, 1, 2]), _r.reverse([1, 3, 2, 4, 1, 5]), _r.map([10, 8, 2, 1], _r.identity))
        .then(function(result){value = result})
      expect(value).to.be.eql([[6, 1, 5, 10], [1, 2, 1, 8], [5, 4, 4, 2]])
    })
    it('should shortcut on min depth', function(){
      var value = null
        , progress = []
        , deferred = _r.when.defer()
      _r([1, 2, 3])
        .zip(deferred.promise)
        .then(function(result){value = result}, null, function(val){progress.push(val)})
      expect(value).to.be.eql(null)
      expect(progress).to.be.eql([])

      deferred.notify(4)
      expect(value).to.be.eql(null)
      expect(progress).to.be.eql([[1, 4]])

      deferred.notify(5)
      expect(value).to.be.eql(null)
      expect(progress).to.be.eql([[1, 4], [2, 5]])

      deferred.notify(6)
      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])

      deferred.notify(7)
      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])

      deferred.resolve()
      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])
    })
    it('should zip promises', function(){
      var value = null
        , progress = []
        , promise1 = _r.when.defer()
        , promise2 = _r.when.defer()
      _r(promise1)
        .zip(promise2)
        .then(function(result){value = result}, null, function(val){progress.push(val)})
      expect(value).to.be.eql(null)
      expect(progress).to.be.eql([])

      promise2.notify(4)
      expect(value).to.be.eql(null)
      expect(progress).to.be.eql([])

      promise1.notify(1)
      expect(progress).to.be.eql([[1, 4]])

      promise2.notify(5)
      expect(progress).to.be.eql([[1, 4]])

      promise1.notify(2)
      expect(progress).to.be.eql([[1, 4], [2, 5]])

      promise1.notify(3)
      expect(progress).to.be.eql([[1, 4], [2, 5]])

      promise2.notify(6)
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])

      expect(value).to.be.eql(null)

      promise1.resolve()

      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])

      promise2.notify(7)
      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])

      promise2.resolve()
      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])
    })
  })
})
