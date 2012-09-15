describe('producer tests', function(){
  describe('each', function(){
    it('should attach', function(){
      var values = []

      _r()
        .attach([1,2,3,4])
        .each(function(val){values.push(val*2)})

      expect(values).to.be.eql([2, 4, 6, 8])
    })
    it('should pass values, indeces and array', function(){
      var values = []
        , indeces = []
        , lists = []

      _r([3, 5, 7, 9])
        .each(function(val, index, list){
            values.push(val)
            indeces.push(index)
            lists.push(list.slice())
          })

      expect(values).to.be.eql([3, 5, 7, 9])
      expect(indeces).to.be.eql([0, 1, 2, 3])
      expect(lists).to.be.eql([[3, 5, 7, 9], [3, 5, 7, 9], [3, 5, 7, 9], [3, 5, 7, 9]])
    })
    it('should pass values, keys, obj', function(){
      var values = []
        , keys = []
        , obj = null

      _r({a: 1, b: 2, c: 3})
        .each(function(val, key, list){
          values.push(val)
          keys.push(key)
          obj = list
        })

      expect(values.sort()).to.be.eql([1, 2, 3])
      expect(keys.sort()).to.be.eql(['a', 'b', 'c'])
      expect(obj).to.be.eql({a: 1, b: 2, c: 3})
    })
    it('should pass obj with attach', function(){
      var values = []
        , keys = []
        , obj = null

      _r()
        .attach({a: 1, b: 2, c: 3})
        .each(function(val, key, list){values.push(val); keys.push(key); obj = list})

      expect(values.sort()).to.be.eql([1, 2, 3])
      expect(keys.sort()).to.be.eql(['a', 'b', 'c'])
      expect(obj).to.be.eql({a: 1, b: 2, c: 3})
    })
  })
  describe('map', function(){
    it('should transform original values', function(){
      var producer = _r([1, 2, 3, 4])
        , values = []
        , map = _r.map(producer, function(val){values.push(val); return val*3})
        , values2 = []
        , s = map.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([3, 6, 9, 12])
    })
    it('should chain', function(){
      var values = []
        , values2 = []
        , values3 = []

      _r.chain([1, 2, 3, 4])
        .attach(['nothing'])
        .map(function(val){values.push(val); return val*2})
        .map(function(val){values2.push(val); return val*3})
        .subscribe(function(val){values3.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([2, 4, 6, 8])
      expect(values3).to.be.eql([6, 12, 18, 24])
    })
    it('should attach', function(){
      var values = []
        , values2 = []
        , values3 = []
        , map = _r()
            .map(function(val){values.push(val*2); return val})
            .map(function(val){values2.push(val); return val*3})

      map.attach([1,2,3,4]).subscribe(function(val){values3.push(val)})

      expect(values).to.be.eql([2, 4, 6, 8])
      expect(values2).to.be.eql([1, 2, 3, 4])
      expect(values3).to.be.eql([3, 6, 9, 12])

      values = []
      values2 = []
      values3 = []
      map.attach([5, 6, 7, 8]).subscribe(function(val){values3.push(val)})
      expect(values).to.be.eql([10, 12, 14, 16])
      expect(values2).to.be.eql([5, 6, 7, 8])
      expect(values3).to.be.eql([15, 18, 21, 24])
    })
    it('should allow detached iterator', function(){
      var values = []

      _r.chain([1, 2, 3, 4])
        .map(_r().contains(3))
        .subscribe(function(val){values.push(val)})

      expect(values).to.be.eql([false, false, true, false])
    })
    it('should allow multiple detached iterators', function(){
      var values = []

      _r.chain([1, 2, 3, 4])
        .map([_r().find(function(x){return x < 3}), _r().contains(3)])
        .subscribe(function(val){values.push(val)})

      expect(values).to.be.eql([[1, false], [2, false], [undefined, true], [undefined, false]])
    })
    it('should allow RegExp iterator', function(){
      var values = []

      _r.chain(['bob is a cat', '', 'fred is a dog', 'nothing'])
        .map(/(\w+) is a (\w+)/g)
        .map(function(match){return match && [match[1], match[2]]})
        .subscribe(function(val){values.push(val)})

      expect(values).to.be.eql([['bob', 'cat'], null, ['fred', 'dog'], null])
    })
    it('should iterate each as array', function(){
      var values = []
        , indeces = []
        , result

      _r([3, 5, 7, 9])
        .map(_r.identity)
        .each(function(val, index, list){values.push(val); indeces.push(index); result = list})

      expect(values).to.be.eql([3, 5, 7, 9])
      expect(indeces).to.be.eql([0, 1, 2, 3])
      expect(result).to.be.eql([3, 5, 7, 9])
    })
  })
  describe('reduce', function(){
    it('should reduce original values', function(){
      var producer = _r([1, 2, 3, 4])
        , reduce = _r.reduce(producer, function(memo, val){return memo + val})
        , values = []
        , s = reduce.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql([1+2+3+4])
    })
    it('should be left associative', function(){
      var producer = _r([1, 2, 3, 4])
        , reduce = _r.reduce(producer, function(memo, val){memo.push(val); return memo}, [])
        , values = []
        , s = _r.when(reduce, function(val){values.push(val)})

      expect(values).to.be.eql([[1, 2, 3, 4]])
    })
    it('should attach', function(){
      var values = []
      var reduce = _r().reduce(function(memo, val){return memo / val})

      reduce.attach([1, 2, 3, 4]).then(function(val){values.push(val)})

      expect(values).to.be.eql([1 / 2 / 3 / 4])

      values = []
      reduce.attach([10, 9, 8, 7]).then(function(val){values.push(val)})
      expect(values).to.be.eql([10 / 9 / 8 / 7])

      values = []
      reduce.attach([9, 8, 7, 2]).then(function(val){values.push(val)})
      expect(values).to.be.eql([9 / 8 / 7 / 2])
    })
    it('should iterate each as array if memo not object', function(){
      var values = []
        , indeces = []
        , result

      _r([1, 2, 3, 4])
        .reduce(function(memo, val){return memo * val})
        .each(function(val, index, list){values.push(val); indeces.push(index); result = list})

      expect(values).to.be.eql([1*2*3*4])
      expect(indeces).to.be.eql([0])
      expect(result).to.be.eql([1*2*3*4])
    })
    it('should iterate each as object if memo is object', function(){
      var values = []
        , keys = []
        , result

      _r(['a', 'b', 'c', 'd'])
        .reduce(function(memo, val){memo[val] = parseInt(val, 16); return memo}, {})
        .each(function(val, key, list){values.push(val); keys.push(key); result = list})

      expect(result).to.be.eql({a:10, b:11, c:12, d:13})
      expect(values.sort()).to.be.eql([10, 11, 12, 13])
      expect(keys.sort()).to.be.eql(['a', 'b', 'c', 'd'])
    })
  })
  describe('reduceRight', function(){
    it('should reduce original values', function(){
      var producer = _r([1, 2, 3, 4])
        , reduce = _r.reduceRight(producer, function(memo, val){return memo + val})
        , values = []
        , s = reduce.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql([4+3+2+1])
    })
    it('should be right associative', function(){
      var producer = _r([1, 2, 3, 4])
        , reduce = _r.reduceRight(producer, function(memo, val){memo.push(val); return memo}, [])
        , values = []
        , s = _r.when(reduce, function(val){values.push(val)})

      expect(values).to.be.eql([[4, 3, 2, 1]])
    })
    it('should calculate on complete', function(){
      var values = []
        , deferred = _r.deferred()
        , promise = deferred.promise

      promise
        .reduceRight(function(memo, val){return memo - val}, 5)
        .subscribe(function(val){values.push(val)})

      deferred.next(1)
      deferred.next(2)
      deferred.next(3)
      deferred.next(4)

      expect(values).to.be.eql([])

      deferred.complete()
      expect(values).to.be.eql([5-4-3-2-1])
    })
    it('should iterate each as array if memo not object', function(){
      var values = []
        , indeces = []
        , result

      _r([1, 2, 3, 4])
        .reduceRight(function(memo, val){return memo * val})
        .each(function(val, index, list){values.push(val); indeces.push(index); result = list})

      expect(values).to.be.eql([1*2*3*4])
      expect(indeces).to.be.eql([0])
      expect(result).to.be.eql([1*2*3*4])
    })
    it('should iterate each as object if memo is object', function(){
      var values = []
        , keys = []
        , result

      _r(['a', 'b', 'c', 'd'])
        .reduceRight(function(memo, val){memo[val] = parseInt(val, 16); return memo}, {})
        .each(function(val, key, list){values.push(val); keys.push(key); result = list})

      expect(result).to.be.eql({a:10, b:11, c:12, d:13})
      expect(values.sort()).to.be.eql([10, 11, 12, 13])
      expect(keys.sort()).to.be.eql(['a', 'b', 'c', 'd'])
    })
  })
  describe('find', function(){
    it('should find first value', function(){
      var deferred = _r.deferred()
        , promise = deferred.promise
        , values = []
        , find = _r.find(promise, function(val){values.push(val); return (val%2 === 0)})
        , values2 = []
        , s = find.subscribe(function(val){values2.push(val)})

      deferred.next(1)
      deferred.next(2)
      deferred.next(3)
      deferred.next(4)

      expect(values).to.be.eql([1, 2])
      expect(values2).to.be.eql([2])
    })
    it('should find first match', function(){
      var result
      _r(['bob', 'frank', 'barb', 'fred', 'ed'])
        .find(/^ba/)
        .then(function(val){result = val})
      expect(result).to.be('barb')
    })
    it('should iterate each as array if found not object', function(){
      var values = []
        , indeces = []
        , result

      _r([0, 1, 2, 3, 4])
        .find(_r().any())
        .each(function(val, index, list){values.push(val); indeces.push(index); result = list})

      expect(values).to.be.eql([1])
      expect(indeces).to.be.eql([0])
      expect(result).to.be.eql([1])
    })
    it('should iterate each as object if found is object', function(){
      var values = []
        , keys = []
        , result

      _r([{a:1, b:2, c:3}, {a:2, b:3, c:4}])
        .find(function(val){return val.a === 2})
        .each(function(val, key, list){values.push(val); keys.push(key); result = list})

      expect(result).to.be.eql({a:2, b:3, c:4})
      expect(values.sort()).to.be.eql([2, 3, 4])
      expect(keys.sort()).to.be.eql(['a', 'b', 'c'])
    })
  })
  describe('filter', function(){
    it('should filter original values', function(){
      var producer = _r([1, 2, 3, 4])
        , values = []
        , filter = _r.filter(producer, function(val){values.push(val); return (val%2 === 0)})
        , values2 = []
        , s = filter.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([2, 4])
    })
    it('should iterate each', function(){
      var values = []
        , values2 = []
        , indeces = []
        , result

      _r([1, 2, 3, 4])
        .filter(function(val){values.push(val); return (val%2 === 0)})
        .each(function(val, index, list){values2.push(val); indeces.push(index); result = list})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([2, 4])
      expect(indeces).to.be.eql([0, 1])
      expect(result).to.be.eql([2, 4])
    })
    it('should filter matched', function(){
      var result
      _r(['bob', 'frank', 'barb', 'fred', 'ed'])
        .filter(/ed$/)
        .then(function(val){result = val})
      expect(result).to.be.eql(['fred', 'ed'])
    })
  })
  describe('reject', function(){
    it('should reject original values', function(){
      var producer = _r([1, 2, 3, 4])
        , values = []
        , reject = _r.reject(producer, function(val){values.push(val); return (val%2 === 1)})
        , values2 = []
        , s = reject.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([2, 4])
    })
    it('should iterate each', function(){
      var values = []
        , values2 = []
        , indeces = []
        , result

      _r([1, 2, 3, 4])
        .reject(function(val){values.push(val); return (val%2 === 0)})
        .each(function(val, index, list){values2.push(val); indeces.push(index); result = list})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([1, 3])
      expect(indeces).to.be.eql([0, 1])
      expect(result).to.be.eql([1, 3])
    })
    it('should reject matched', function(){
      var result
      _r(['bob', 'frank', 'barb', 'fred', 'ed'])
        .reject(/f/)
        .then(function(val){result = val})
      expect(result).to.be.eql(['bob', 'barb', 'ed'])
    })
  })
  describe('every', function(){
    it('should short circuit on false', function(){
      var producer = _r([1, 2, 3, 4])
        , values = []
        , every = _r.every(producer, function(val){values.push(val); return (val !== 3)})
        , values2 = []
        , s = every.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3])
      expect(values2).to.be.eql([false])
    })
    it('should iterate each', function(){
      var values = []
        , values2 = []
        , indeces = []
        , result

      _r([1, 2, 3, 4])
        .every(function(val){values.push(val); return (val%2 === 1)})
        .each(function(val, index, list){values2.push(val); indeces.push(index); result = list})

      expect(values).to.be.eql([1, 2])
      expect(values2).to.be.eql([false])
      expect(indeces).to.be.eql([0])
      expect(result).to.be.eql([false])
    })
  })
  describe('any', function(){
    it('should short circuit on true', function(){
      var producer = _r([1, 2, 3, 4])
        , values = []
        , any = _r.any(producer, function(val){values.push(val); return (val === 3)})
        , values2 = []
        , s = any.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3])
      expect(values2).to.be.eql([true])
    })
    it('should chain to false', function(){
      var values = []
        , values2 = []

      _r.chain([1, 2, 3, 4])
        .any(function(val){values.push(val); return (val != 3)})
        .then(function(val){values2.push(val)})

      expect(values).to.be.eql([1])
      expect(values2).to.be.eql([true])
    })
    it('should chain to true', function(){
      var values = []
        , values2 = []

      _r.chain([1, 2, 3, 4])
        .any(function(val){values.push(val); return (val <= 4)})
        .then(function(val){values2.push(val)})

      expect(values).to.be.eql([1])
      expect(values2).to.be.eql([true])
    })
  })
  describe('contains', function(){
    it('should short circuit on true', function(){
      var values = []
        , deferred = _r.deferred()
        , promise = deferred.promise

      promise
        .contains(5)
        .subscribe(function(val){values.push(val)})

      deferred.next(3)
      deferred.next(4)

      expect(values).to.be.eql([])

      deferred.next(5)
      expect(values).to.be.eql([true])

      deferred.next(6)
      expect(values).to.be.eql([true])
    })
    it('should chain to true', function(){
      var values = []

      _r.chain([1, 2, 3, 4])
        .contains(3)
        .then(function(val){values.push(val)})

      expect(values).to.be.eql([true])
    })
    it('should chain to false', function(){
      var values = []

      _r.chain([1, 2, 3, 4])
        .contains(6)
        .then(function(val){values.push(val)})

      expect(values).to.be.eql([false])
    })
  })
  describe('invoke', function(){
    it('should invoke with method name', function(){
      var producer = _r([1, 2, 3, 4])
        , values = []
        , invoke = _r.invoke(producer,'toString')
        , s = invoke.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql(['1', '2', '3', '4'])
    })
    it('should invoke with function', function(){
      var producer = _r([1, 2, 3, 4])
        , values = []
        , invoke = _r.invoke(producer, function(){return this+'!'})
        , s = invoke.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql(['1!', '2!', '3!', '4!'])
    })
    it('should iterate each', function(){
      var values = []
        , indeces = []
        , result

      _r(['a', 'b', 'c', 'd'])
        .invoke('toUpperCase')
        .each(function(val, index, list){values.push(val); indeces.push(index); result = list})

      expect(values).to.be.eql(['A', 'B', 'C', 'D'])
      expect(indeces).to.be.eql([0, 1, 2, 3])
      expect(result).to.be.eql(['A', 'B', 'C', 'D'])
    })
  })
  describe('pluck', function(){
    it('should pluck values with name', function(){
      var producer = _r([{a: '1', b: '2'}, {a: '2'}, {a: '3', b: '5', c: '6'}])
        , values = []
        , pluck = _r.pluck(producer, 'a')
        , s = pluck.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql(['1', '2', '3'])
    })
    it('should attach', function(){
      var values = []

      _r()
        .pluck('c')
        .attach([{a: '1', b: '2'}, {a: '2'}, {a: '3', b: '5', c: '6'}])
        .subscribe(function(val){values.push(val)})

      expect(values).to.be.eql([undefined, undefined, '6'])
    })
    it('should iterate each', function(){
      var values = []
        , indeces = []

      _r.chain([{a: '1', b: '2'}, {a: '2'}, {a: '3', b: '5', c: '6'}])
        .pluck('a')
        .each(function(val, index){values.push(val); indeces.push(index)})

      expect(values).to.be.eql(['1', '2', '3'])
      expect(indeces).to.be.eql([0, 1, 2])
    })
  })
  describe('max', function(){
    it('should accept iterator', function(){
      var producer = _r([1, 5, 3, 8, -5])
        , values = []
        , max = _r.max(producer, function(val){values.push(val); return -val})
        , values2 = []
        , s = max.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 5, 3, 8, -5])
      expect(values2).to.be.eql([-5])
    })
    it('should attach', function(){
      var values = []
        , values2 = []

      _r()
        .max(function(val){values.push(val); return -val})
        .attach([1, 2, 3, 4])
        .then(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([1])
    })
  })
  describe('min', function(){
    it('should accept iterator', function(){
      var producer = _r([1, 5, 3, 8, -5])
        , values = []
        , min = _r.min(producer, function(val){values.push(val); return -val})
        , values2 = []
        , s = min.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 5, 3, 8, -5])
      expect(values2).to.be.eql([8])
    })
    it('should attach', function(){
      var values = []
        , values2 = []

      _r()
        .min(function(val){values.push(val); return -val})
        .attach([1, 2, 3, 4])
        .then(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([4])
    })
  })
  describe('sortBy', function(){
    it('should sort on identity', function(){
      var producer = _r([5, 3,  2, 4, 1])
        , values = []

      _r.chain(producer)
        .sortBy(_r.identity)
        .subscribe(function(value){values.push(value)})

      expect(values).to.be.eql([1, 2, 3, 4, 5])
    })
    it('should sort with iterator', function(){
      var producer = _r([5, 3,  2, 4, 1])
        , values = []

      _r.chain(producer)
        .sortBy(function(val){return -val})
        .subscribe(function(value){values.push(value)})

      expect(values).to.be.eql([5, 4, 3, 2, 1])
    })
    it('should sort with property', function(){
      var producer = _r([{a: 1, b: 2}, {a: 5, b: 1, c: 0}, {a: 3, b:4}])
        , sortByA = _r.sortBy(producer, 'a')
        , sortByB = _r.sortBy(producer, 'b')
        , valuesA = []
        , valuesB = []
        , sA = sortByA.subscribe(function(val){valuesA.push(val)})
        , sB = sortByB.subscribe(function(val){valuesB.push(val)})

      expect(valuesA).to.be.eql([{a: 1, b: 2}, {a: 3, b:4}, {a: 5, b: 1, c: 0}])
      expect(valuesB).to.be.eql([{a: 5, b: 1, c: 0}, {a: 1, b: 2}, {a: 3, b:4}])
    })
    it('should calculate on complete', function(){
      var values = []
        , deferred = _r.deferred()
        , promise = deferred.promise

      promise
        .sortBy(_r.identity)
        .subscribe(function(val){values.push(val)})

      deferred.next(4)
      deferred.next(-3)
      deferred.next(1)
      deferred.next(2)

      expect(values).to.be.eql([])

      deferred.complete()
      expect(values).to.be.eql([-3, 1, 2, 4])
    })
    it('should sort with each', function(){
      var producer = _r([5, 3,  2, 4, 1])
        , values = []

      _r([1, 4, 5, 2, 3])
        .sortBy(function(val){return -val})
        .each(function(value){values.push(value)})

      expect(values).to.be.eql([5, 4, 3, 2, 1])
    })
  })
  describe('sort', function(){
    it('should sort', function(){
      var values = []

      _r.chain()
        .sort()
        .attach(['d', 'a', 'c', 'b'])
        .subscribe(function(value){values.push(value)})

      expect(values).to.be.eql(['a', 'b', 'c', 'd'])
    })
    it('should calculate on complete', function(){
      var values = []
        , deferred = _r.deferred()

      deferred.promise
        .sort()
        .subscribe(function(val){values.push(val)})

      deferred.next(4)
      deferred.next(-3)
      deferred.next(1)
      deferred.next(2)

      expect(values).to.be.eql([])

      deferred.complete()
      expect(values).to.be.eql([-3, 1, 2, 4])
    })
    it('should sort with each', function(){
      var values = []

      _r(['d', 'a', 'c', 'b'])
        .sort()
        .each(function(value){values.push(value)})

      expect(values).to.be.eql(['a', 'b', 'c', 'd'])
    })
  })
  describe('groupBy', function(){
    it('should group on identity', function(){
      var producer = _r(['a', 'b', 'c', 'b', 'c', 'c'])
        , values = []

      _r.chain(producer)
        .groupBy(_r.identity)
        .then(function(value){values = value})

      expect(values.a).to.be.eql(['a'])
      expect(values.b).to.be.eql(['b', 'b'])
      expect(values.c).to.be.eql(['c', 'c', 'c'])
    })
    it('should sort group with iterator', function(){
      var producer = _r([1, 1.4, 1.6, 2.0, 3.3])
        , values = []

      _r.chain(producer)
        .groupBy(function(val){return Math.round(val)})
        .subscribe(function(value){values = value})

      expect(values[1]).to.be.eql([1, 1.4])
      expect(values[2]).to.be.eql([1.6, 2.0])
      expect(values[3]).to.be.eql([3.3])
    })
    it('should group with property', function(){
      var groupBy = _r().groupBy('length')
        , values = []

      groupBy.attach(['bob', 'frank', 'sue', 'fred', 'fran', 'sam'])
        .subscribe(function(val){values = val})

      expect(values[3]).to.eql(['bob', 'sue', 'sam'])
      expect(values[4]).to.be.eql(['fred', 'fran'])
      expect(values[5]).to.be.eql(['frank'])
    })
    it('should calculate on complete', function(){
      var values = []
        , deferred = _r.deferred()

      deferred
        .groupBy(function(val){return val.charAt(0)})
        .subscribe(function(val){values = val})

      deferred.next('fred')
      deferred.next('fran')
      deferred.next('sam')
      deferred.next('frank')

      deferred.complete()

      expect(values.f).to.be.eql(['fred', 'fran', 'frank'])
      expect(values.s).to.be.eql(['sam'])

    })
    it('should iterate groups as object', function(){
      var values = []
        , keys = []
        , result

      _r(['bob', 'frank', 'sue', 'fred', 'fran', 'sam'])
        .groupBy('length')
        .each(function(value, key, list){values.push(value), keys.push(key), result = list})

      expect(keys.sort()).to.eql(['3', '4', '5'])
      expect(result[3]).to.eql(['bob', 'sue', 'sam'])
      expect(result[4]).to.be.eql(['fred', 'fran'])
      expect(result[5]).to.be.eql(['frank'])
    })
  })
  describe('toArray', function(){
    it('should reduce to array', function(){
      var values = [1, 2, 3, 4, 5, 6]
        , values2
      _r(values).toArray().then(function(result){values2 = result})
      expect(values).to.be.eql(values2)
    })
  })
  describe('size', function(){
    it('should size array', function(){
      var value
      _r([1, 2, 3, 4, 5, 6])
        .size()
        .then(function(result){value = result})

      expect(value).to.be.eql(6)
    })
  })
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

      var value
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

      var value
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

      var value
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

      var value
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

      var value
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

      var value
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

      var value
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

      var value
      _r([6, 1, 5, 7, 5, 2, 6])
        .zip(_r.sort([4, 1, 2]), _r.reverse([1, 3, 2, 4, 1, 5]), _r.map([10, 8, 2, 1], _r.identity))
        .then(function(result){value = result})
      expect(value).to.be.eql([[6, 1, 5, 10], [1, 2, 1, 8], [5, 4, 4, 2]])
    })
    it('should shortcut on min depth', function(){
      var value = null
        , progress = []
        , deferred = _r.deferred()
      _r([1, 2, 3])
        .zip(deferred.promise)
        .then(function(result){value = result}, null, function(val){progress.push(val)})
      expect(value).to.be.eql(null)
      expect(progress).to.be.eql([])

      deferred.next(4)
      expect(value).to.be.eql(null)
      expect(progress).to.be.eql([[1, 4]])

      deferred.next(5)
      expect(value).to.be.eql(null)
      expect(progress).to.be.eql([[1, 4], [2, 5]])

      deferred.next(6)
      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])

      deferred.next(7)
      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])

      deferred.complete()
      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])
    })
    it('should zip promises', function(){
      var value = null
        , progress = []
        , promise1 = _r.deferred()
        , promise2 = _r.deferred()
      _r(promise1)
        .zip(promise2)
        .then(function(result){value = result}, null, function(val){progress.push(val)})
      expect(value).to.be.eql(null)
      expect(progress).to.be.eql([])

      promise2.next(4)
      expect(value).to.be.eql(null)
      expect(progress).to.be.eql([])

      promise1.next(1)
      expect(progress).to.be.eql([[1, 4]])

      promise2.next(5)
      expect(progress).to.be.eql([[1, 4]])

      promise1.next(2)
      expect(progress).to.be.eql([[1, 4], [2, 5]])

      promise1.next(3)
      expect(progress).to.be.eql([[1, 4], [2, 5]])

      promise2.next(6)
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])

      expect(value).to.be.eql(null)

      promise1.complete()

      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])

      promise2.next(7)
      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])

      promise2.complete()
      expect(value).to.be.eql([[1, 4], [2, 5], [3, 6]])
      expect(progress).to.be.eql([[1, 4], [2, 5], [3, 6]])
    })
  })
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
  describe('tap', function(){
    it('should tap next', function(){
      var values = []
        , tapped = []
      _r([1, 2, 3, 4, 5])
        .tap(function(val){tapped.push(val)})
        .then(function(val){values = val})
      expect(values).to.eql([1, 2, 3, 4, 5])
      expect(values).to.eql(tapped)
    })
    it('should tap next, complete', function(){
      var values = []
        , tapped = []
        , expected = []
        , deferred = _r.deferred()
        , completed = false
      _r(deferred.promise)
        .tap(function(val){tapped.push(val)}, function(){completed = true})
        .then(function(val){values = val})

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)

      deferred.next(1)
      expected.push(1)

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)

      deferred.next(2)
      deferred.next(3)
      expected.push(2)
      expected.push(3)

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)

      deferred.complete()

      expect(tapped).to.eql(expected)
      expect(values).to.eql(tapped)
      expect(completed).to.be(true)

      deferred.next(4)
      deferred.next(5)
      deferred.error('err')

      expect(tapped).to.eql(expected)
      expect(values).to.eql(tapped)
      expect(completed).to.be(true)
    })
    it('should tap next, error', function(){
      var values = []
        , tapped = []
        , expected = []
        , deferred = _r.deferred()
        , completed = false
        , error = null
        , errorToSend = 'expected error from tap test'
      _r(deferred)
        .tap(function(val){tapped.push(val)}
          , function(){completed = true}
          , function(err){error = err})
        .then(function(val){values = val})

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)
      expect(error).to.be(null)

      deferred.next(1)
      expected.push(1)

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)
      expect(error).to.be(null)

      deferred.next(2)
      deferred.next(3)
      expected.push(2)
      expected.push(3)

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)
      expect(error).to.be(null)

      deferred.error(errorToSend)

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)
      expect(error).to.eql(errorToSend)

      deferred.next(4)
      deferred.next(5)
      deferred.complete()

      expect(values).to.eql([])
      expect(tapped).to.eql(expected)
      expect(completed).to.be(false)
      expect(error).to.eql(errorToSend)
    })
  })
  describe('defer', function(){
    it('should defer next', function(done){
      var step = 0
        , deferred = _r.deferred()
      deferred
        .defer()
        .subscribe(function(val){
            expect(step).to.eql(1)
            done()
          })
      deferred.next(1)
      step++
    })
    it('should defer complete', function(done){
      var step = 0
      _r([1, 2, 3])
        .defer()
        .then(function(val){
            expect(step).to.eql(1)
            done()
          })
      step++
    })
    it('should defer error', function(done){
      var step = 0
        , deferred = _r.deferred()
      deferred
        .defer()
        .then(null, function(err){
            expect(step).to.eql(1)
            done()
          })
      deferred.error('expected error defer test')
      step++
    })
  })
  describe('delay', function(){
    it('should delay next', function(done){
      var step = 0
        , deferred = _r.deferred()
      deferred
        .delay(20)
        .subscribe(function(val){
            expect(step).to.eql(1)
            done()
          })
      deferred.next(1)
      setTimeout(function(){step++}, 5)
    })
    it('should delay complete', function(done){
      var step = 0
      _r([1, 2, 3])
        .delay(20)
        .then(function(val){
            expect(step).to.eql(1)
            done()
          })
      setTimeout(function(){step++}, 5)
    })
    it('should delay error', function(done){
      var step = 0
        , deferred = _r.deferred()
      deferred
        .delay(20)
        .then(null, function(err){
            expect(step).to.eql(1)
            done()
          })
      deferred.error('expected error delay test')
      setTimeout(function(){step++}, 5)
    })
  })
  describe('debounce', function(){
    it('should debounce trailing next', function(done){
      var deferred = _r.deferred()
      deferred
        .delay(1)
        .debounce(10)
        .subscribe(function(val){
            expect(val).to.eql(3)
            done()
          })
      deferred.next(1)
      deferred.next(2)
      deferred.next(3)

    })
    it('should debounce leading next', function(done){
      var deferred = _r.deferred()
      deferred
        .delay(1)
        .debounce(10, true)
        .subscribe(function(val){
            expect(val).to.eql(1)
            done()
          })
      deferred.next(1)
      deferred.next(2)
      deferred.next(3)

    })
    it('should debounce trailing complete', function(done){
      _r([1, 2, 3])
        .delay(1)
        .debounce(10)
        .then(function(val){
            expect(val).to.eql([3])
            done()
          })
    })
    it('should debounce leading complete', function(done){
      _r([1, 2, 3])
        .delay(1)
        .debounce(10, true)
        .then(function(val){
            expect(val).to.eql([1])
            done()
          })
    })
    it('should debounce trailing error', function(done){
      var deferred = _r.deferred()
        , values = []
      deferred
        .delay(1)
        .debounce(10)
        .then(
            null
          , function(err){
              expect(values).to.eql([])
              done()
            }
          , function(val){values.push(val)})
      deferred.error('expected error testing debounce')
    })
    it('should debounce leading error', function(done){
      var deferred = _r.deferred()
        , values = []
      deferred
        .delay(1)
        .debounce(10, true)
        .then(
            null
          , function(err){
              expect(values).to.eql([])
              done()
            }
          , function(val){values.push(val)})
      deferred.error('expected error testing debounce')
    })
  })
})
