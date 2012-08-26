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
        , s = _r.then(reduce, function(val){values.push(val)})

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
        , s = _r.then(reduce, function(val){values.push(val)})

      expect(values).to.be.eql([[4, 3, 2, 1]])
    })
    it('should calculate on complete', function(){
      var values = []
        , promise = _r.promise()

      promise
        .reduceRight(function(memo, val){return memo - val}, 5)
        .subscribe(function(val){values.push(val)})

      promise.next(1)
      promise.next(2)
      promise.next(3)
      promise.next(4)

      expect(values).to.be.eql([])

      promise.complete()
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
      var promise = _r.promise()
        , values = []
        , find = _r.find(promise, function(val){values.push(val); return (val%2 === 0)})
        , values2 = []
        , s = find.subscribe(function(val){values2.push(val)})

      promise.next(1)
      promise.next(2)
      promise.next(3)
      promise.next(4)

      expect(values).to.be.eql([1, 2])
      expect(values2).to.be.eql([2])
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
        , promise = _r.promise()

      promise
        .contains(5)
        .subscribe(function(val){values.push(val)})

      promise.next(3)
      promise.next(4)

      expect(values).to.be.eql([])

      promise.next(5)
      expect(values).to.be.eql([true])

      promise.next(6)
      expect(values).to.be.eql([true])
    })
    it('should chain to true', function(){
      var values = []
        , promise = _r.promise()

      _r.chain([1, 2, 3, 4])
        .contains(3)
        .then(function(val){values.push(val)})

      expect(values).to.be.eql([true])
    })
    it('should chain to false', function(){
      var values = []
        , promise = _r.promise()

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
        , promise = _r.promise()

      promise
        .sortBy(_r.identity)
        .subscribe(function(val){values.push(val)})

      promise.next(4)
      promise.next(-3)
      promise.next(1)
      promise.next(2)

      expect(values).to.be.eql([])

      promise.complete()
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
        , promise = _r.promise()

      promise
        .sort()
        .subscribe(function(val){values.push(val)})

      promise.next(4)
      promise.next(-3)
      promise.next(1)
      promise.next(2)

      expect(values).to.be.eql([])

      promise.complete()
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
        , promise = _r.promise()

      promise
        .groupBy(function(val){return val.charAt(0)})
        .subscribe(function(val){values = val})

      promise.next('fred')
      promise.next('fran')
      promise.next('sam')
      promise.next('frank')

      promise.complete()

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
})
