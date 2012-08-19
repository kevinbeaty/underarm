describe('producer tests', function(){
  describe('each', function(){
    it('should collect each value sent', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []

      _r.each(subject, function(val){values.push(val)}).subscribe()
      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []
        , each = _r.each(subject, function(val){values.push(val)})
        , values2 = []
        , s = each.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should pass through original values', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , values = []
        , each = _r.each(subject, function(val){values.push(val*2);})
        , values2 = []
        , s = each.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([2, 4, 6, 8])
      expect(values2).to.be.eql([1, 2, 3, 4])
    })
    it('should chain', function(){
      var values = []
        , values2 = []

      _r([1, 2, 3, 4])
        .chain()
        .seq()
        .each(function(val){values.push(val*2)})
        .subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([2, 4, 6, 8])
      expect(values2).to.be.eql([1, 2, 3, 4])
    })
  })
  describe('map', function(){
    it('should collect each value sent', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []

      _r(subject).map(function(val){values.push(val); return val}).subscribe()

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []
        , map = _r.map(subject, function(val){values.push(val); return val})
        , values2 = []
        , s = map.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should transform original values', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , values = []
        , map = _r.map(subject, function(val){values.push(val); return val*3})
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
        .seq()
        .each(function(val){values.push(val*2); return val*2})
        .map(function(val){values2.push(val); return val*3})
        .subscribe(function(val){values3.push(val)})

      expect(values).to.be.eql([2, 4, 6, 8])
      expect(values2).to.be.eql([1, 2, 3, 4])
      expect(values3).to.be.eql([3, 6, 9, 12])
    })
  })
  describe('reduce', function(){
    it('should collect each value sent with memo', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , memos = []
        , values = []

      _r(subject).reduce(function(memo, val){values.push(val); memos.push(memo); return val}, 1).subscribe()

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should collect each value sent without memo', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , memos = []
        , values = []

      _r.reduce(subject, function(memo, val){values.push(val); memos.push(memo); return val}).subscribe()

      expect(memos).to.be.eql([1, '2', {a: 3}])
      expect(values).to.be.eql(['2', {a: 3}, [4, 5]])
    })
    it('should reduce original values', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , reduce = _r.reduce(subject, function(memo, val){return memo + val})
        , values = []
        , s = reduce.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql([1, 1+2, 1+2+3, 1+2+3+4])
    })
    it('should be left associative', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , reduce = _r.reduce(subject, function(memo, val){memo.push(val); return memo}, [])
        , values = []
        , s = _r.then(reduce, function(val){values.push(val)})

      expect(values).to.be.eql([[1, 2, 3, 4]])
    })
    it('should chain', function(){
      var values = []

      _r.chain([1, 2, 3, 4])
        .seq()
        .reduce(function(memo, val){return memo / val})
        .then(function(val){values.push(val)})

      expect(values).to.be.eql([1 / 2 / 3 / 4])
    })
    it('should calculate incrementally', function(){
      var values = []
        , result = []
        , subject = _r.subject()

      _r.chain(subject)
        .reduce(function(memo, val){return memo - val}, 5)
        .subscribe(function(val){values.push(val)})

      subject.next(1)
      result.push(5 - 1)
      expect(values).to.be.eql(result)

      subject.next(2)
      result.push(5 - 1 - 2)
      expect(values).to.be.eql(result)

      subject.next(3)
      result.push(5 - 1 - 2 - 3)
      expect(values).to.be.eql(result)

      subject.next(4)
      result.push(5 - 1 - 2 - 3 - 4)
      expect(values).to.be.eql(result)

      subject.complete()
      expect(values).to.be.eql(result)
    })
  })
  describe('reduceRight', function(){
    it('should collect each value sent with memo', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , memos = []
        , values = []

      _r.reduceRight(subject, function(memo, val){values.push(val); memos.push(memo); return val}, 1).subscribe()

      expect(memos).to.be.eql([1, [4, 5], {a: 3}, '2'])
      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]].reverse())
    })
    it('should collect each value sent without memo', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , memos = []
        , values = []

      _r.reduceRight(subject, function(memo, val){values.push(val); memos.push(memo); return val}).subscribe()

      expect(memos).to.be.eql([[4, 5], {a: 3}, '2'])
      expect(values).to.be.eql([{a: 3}, '2', 1])
    })
    it('should reduce original values', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , reduce = _r.reduceRight(subject, function(memo, val){return memo + val})
        , values = []
        , s = reduce.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql([4, 4+3, 4+3+2, 4+3+2+1])
    })
    it('should be right associative', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , reduce = _r.reduceRight(subject, function(memo, val){memo.push(val); return memo}, [])
        , values = []
        , s = _r.then(reduce, function(val){values.push(val)})

      expect(values).to.be.eql([[4, 3, 2, 1]])
    })
    it('should chain', function(){
      var values = []

      _r.chain([1, 2, 3, 4])
        .seq()
        .reduceRight(function(memo, val){return memo / val})
        .then(function(val){values.push(val)})

      expect(values).to.be.eql([4 / 3 / 2 / 1])
    })
    it('should calculate on complete', function(){
      var values = []
        , subject = _r.subject()

      _r.chain(subject)
        .reduceRight(function(memo, val){return memo - val}, 5)
        .subscribe(function(val){values.push(val)})

      subject.next(1)
      subject.next(2)
      subject.next(3)
      subject.next(4)

      expect(values).to.be.eql([])

      subject.complete()
      expect(values).to.be.eql([5-4, 5-4-3, 5-4-3-2, 5-4-3-2-1])
    })
  })
  describe('find', function(){
    it('should collect each value sent', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []

       _r.find(subject, function(val){values.push(val); return false}).subscribe()

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []
        , find = _r.find(subject, function(val){values.push(val); return false})
        , values2 = []
        , s = find.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([])
    })
    it('should find first value', function(){
      var subject = _r.subject()
        , values = []
        , find = _r.find(subject, function(val){values.push(val); return (val%2 === 0)})
        , values2 = []
        , s = find.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next(2)
      subject.next(3)
      subject.next(4)

      expect(values).to.be.eql([1, 2])
      expect(values2).to.be.eql([2])
    })
    it('should chain', function(){
      var values = []
        , values2 = []

      _r.chain([1, 2, 3, 4])
        .seq()
        .find(function(val){values.push(val); return (val%2 === 1)})
        .subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1])
      expect(values2).to.be.eql([1])
    })
  })
  describe('filter', function(){
    it('should collect each value sent', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []

       _r.filter(subject, function(val){values.push(val); return val}).subscribe()

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []
        , filter = _r.filter(subject, function(val){values.push(val); return true})
        , values2 = []
        , s = filter.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should filter original values', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , values = []
        , filter = _r.filter(subject, function(val){values.push(val); return (val%2 === 0)})
        , values2 = []
        , s = filter.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([2, 4])
    })
    it('should chain', function(){
      var values = []
        , values2 = []

      _r.chain([1, 2, 3, 4])
        .seq()
        .filter(function(val){values.push(val); return (val%2 === 1)})
        .subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([1, 3])
    })
  })
  describe('reject', function(){
    it('should collect each value sent', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []

       _r.reject(subject, function(val){values.push(val); return val}).subscribe()

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []
        , filter = _r.filter(subject, function(val){values.push(val); return true})
        , values2 = []
        , s = filter.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should reject original values', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , values = []
        , reject = _r.reject(subject, function(val){values.push(val); return (val%2 === 1)})
        , values2 = []
        , s = reject.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([2, 4])
    })
    it('should chain', function(){
      var values = []
        , values2 = []

      _r.chain([1, 2, 3, 4])
        .seq()
        .reject(function(val){values.push(val); return (val%2 === 1)})
        .subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([2, 4])
    })
  })
  describe('every', function(){
    it('should collect each value sent', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []

       _r.every(subject, function(val){values.push(val); return true}).subscribe()

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []
        , every = _r.every(subject, function(val){values.push(val); return true})
        , values2 = []
        , s = every.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([true, true, true, true])
    })
    it('should calculate intermediate values', function(){
      var values = []
        , results = []
        , subject = _r.subject()

      _r.chain(subject)
        .every(function(val){return val < 4})
        .subscribe(function(val){values.push(val)})

      subject.next(1)
      results.push(true)
      expect(values).to.be.eql(results)

      subject.next(2)
      results.push(true)
      expect(values).to.be.eql(results)

      subject.next(3)
      results.push(true)
      expect(values).to.be.eql(results)

      subject.next(4)
      results.push(false)
      expect(values).to.be.eql(results)

      subject.complete()
      expect(values).to.be.eql(results)
    })
    it('should short circuit on false', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , values = []
        , every = _r.every(subject, function(val){values.push(val); return (val !== 3)})
        , values2 = []
        , s = every.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3])
      expect(values2).to.be.eql([true, true, false])
    })
    it('should chain', function(){
      var values = []
        , values2 = []

      _r.chain([1, 2, 3, 4])
        .seq()
        .every(function(val){values.push(val); return (val < 4)})
        .then(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([false])
    })
  })
  describe('any', function(){
    it('should collect each value sent', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []

       _r.any(subject, function(val){values.push(val); return false}).subscribe()

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []
        , any = _r.any(subject, function(val){values.push(val); return false})
        , values2 = []
        , s = any.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([false, false, false, false])
    })
    it('should calculate intermediate values', function(){
      var values = []
        , results = []
        , subject = _r.subject()

      _r.chain(subject)
        .any(function(val){return val > 4})
        .subscribe(function(val){values.push(val)})

      subject.next(1)
      results.push(false)
      expect(values).to.be.eql(results)

      subject.next(2)
      results.push(false)
      expect(values).to.be.eql(results)

      subject.next(3)
      results.push(false)
      expect(values).to.be.eql(results)

      subject.next(4)
      results.push(false)
      expect(values).to.be.eql(results)

      subject.complete()
      expect(values).to.be.eql(results)
    })
    it('should short circuit on true', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , values = []
        , any = _r.any(subject, function(val){values.push(val); return (val === 3)})
        , values2 = []
        , s = any.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3])
      expect(values2).to.be.eql([false, false, true])
    })
    it('should chain to false', function(){
      var values = []
        , values2 = []

      _r.chain([1, 2, 3, 4])
        .seq()
        .every(function(val){values.push(val); return (val != 3)})
        .then(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3])
      expect(values2).to.be.eql([false])
    })
    it('should chain to true', function(){
      var values = []
        , values2 = []

      _r.chain([1, 2, 3, 4])
        .seq()
        .every(function(val){values.push(val); return (val <= 4)})
        .then(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([true])
    })
  })
  describe('contains', function(){
    it('should allow subscription', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []
        , contains = _r.contains(subject, 2)
        , s = contains.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql([false, false, false, false])
    })
    it('should calculate on complete', function(){
      var values = []
        , results = []
        , subject = _r.subject()

      _r.chain(subject)
        .contains(4)
        .subscribe(function(val){values.push(val)})

      subject.next(1)
      results.push(false)
      expect(values).to.be.eql(results)

      subject.next(2)
      results.push(false)
      expect(values).to.be.eql(results)


      subject.next(3)
      results.push(false)
      expect(values).to.be.eql(results)

      subject.next(4)
      results.push(true)
      expect(values).to.be.eql(results)

      subject.complete()
      expect(values).to.be.eql(results)
    })
    it('should short circuit on true', function(){
      var values = []
        , subject = _r.subject()

      _r.chain(subject)
        .seq()
        .contains(5)
        .subscribe(function(val){values.push(val)})

      subject.next(3)
      subject.next(4)

      expect(values).to.be.eql([false, false])

      subject.next(5)
      expect(values).to.be.eql([false, false, true])

      subject.next(6)
      expect(values).to.be.eql([false, false, true])
    })
    it('should chain to true', function(){
      var values = []
        , subject = _r.subject()

      _r.chain([1, 2, 3, 4])
        .seq()
        .contains(3)
        .then(function(val){values.push(val)})

      expect(values).to.be.eql([true])
    })
    it('should chain to false', function(){
      var values = []
        , subject = _r.subject()

      _r.chain([1, 2, 3, 4])
        .seq()
        .contains(6)
        .then(function(val){values.push(val)})

      expect(values).to.be.eql([false])
    })
  })
  describe('invoke', function(){
    it('should invoke with method name', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , values = []
        , invoke = _r.invoke(subject,'toString')
        , s = invoke.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql(['1', '2', '3', '4'])
    })
    it('should invoke with function', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , values = []
        , invoke = _r.invoke(subject, function(){return this+'!'})
        , s = invoke.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql(['1!', '2!', '3!', '4!'])
    })
    it('should chain', function(){
      var values = []

      _r.chain(['a', 'b', 'c', 'd'])
        .seq()
        .invoke('toUpperCase')
        .subscribe(function(val){values.push(val)})

      expect(values).to.be.eql(['A', 'B', 'C', 'D'])
    })
  })
  describe('pluck', function(){
    it('should pluck values with name', function(){
      var subject = _r.seq([{a: '1', b: '2'}, {a: '2'}, {a: '3', b: '5', c: '6'}])
        , values = []
        , pluck = _r.pluck(subject, 'a')
        , s = pluck.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql(['1', '2', '3'])
    })
    it('should chain', function(){
      var values = []

      _r.chain([{a: '1', b: '2'}, {a: '2'}, {a: '3', b: '5', c: '6'}])
        .seq()
        .pluck('b')
        .subscribe(function(val){values.push(val)})

      expect(values).to.be.eql(['2', undefined, '5'])
    })
  })
  describe('max', function(){
    it('should allow subscription', function(){
      var subject = _r.seq([1, 5, 3, 8, -5])
        , values = []
        , max = _r.max(subject)
        , s = max.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql([1, 5, 5, 8, 8])
    })
    it('should accept iterator', function(){
      var subject = _r.seq([1, 5, 3, 8, -5])
        , values = []
        , max = _r.max(subject, function(val){values.push(val); return -val})
        , values2 = []
        , s = max.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 5, 3, 8, -5])
      expect(values2).to.be.eql([1, 1, 1, 1, -5])
    })
    it('should calculate incrementally', function(){
      var values = []
        , results = []
        , subject = _r.subject()

      _r.chain(subject)
        .max()
        .subscribe(function(val){values.push(val)})

      subject.next(2)
      results.push(2)
      expect(values).to.be.eql(results)

      subject.next(4)
      results.push(4)
      expect(values).to.be.eql(results)

      subject.next(3)
      results.push(4)
      expect(values).to.be.eql(results)

      subject.next(1)
      results.push(4)
      expect(values).to.be.eql(results)

      subject.complete()
      expect(values).to.be.eql(results)
    })
    it('should chain', function(){
      var values = []
        , values2 = []

      _r.chain([1, 2, 3, 4])
        .seq()
        .max(function(val){values.push(val); return -val})
        .then(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([1])
    })
  })
  describe('min', function(){
    it('should allow subscription', function(){
      var subject = _r.seq([1, 5, 3, 8, -5])
        , values = []
        , min = _r.min(subject)
        , s = min.subscribe(function(val){values.push(val)})

      expect(values).to.be.eql([1, 1, 1, 1, -5])
    })
    it('should accept iterator', function(){
      var subject = _r.seq([1, 5, 3, 8, -5])
        , values = []
        , min = _r.min(subject, function(val){values.push(val); return -val})
        , values2 = []
        , s = min.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 5, 3, 8, -5])
      expect(values2).to.be.eql([1, 5, 5, 8, 8])
    })
    it('should calculate incrementally', function(){
      var values = []
        , results = []
        , subject = _r.subject()

      _r.chain(subject)
        .min()
        .subscribe(function(val){values.push(val)})

      subject.next(2)
      results.push(2)
      expect(values).to.be.eql(results)

      subject.next(4)
      results.push(2)
      expect(values).to.be.eql(results)

      subject.next(3)
      results.push(2)
      expect(values).to.be.eql(results)

      subject.next(1)
      results.push(1)
      expect(values).to.be.eql(results)

      subject.complete()
      expect(values).to.be.eql(results)
    })
    it('should chain', function(){
      var values = []
        , values2 = []

      _r.chain([1, 2, 3, 4])
        .seq()
        .min(function(val){values.push(val); return -val})
        .then(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([4])
    })
  })
  describe('sortBy', function(){
    it('should sort on identity', function(){
      var subject = _r.seq([5, 3,  2, 4, 1])
        , values = []

      _r.chain(subject)
        .sortBy(_r.identity)
        .subscribe(function(value){values.push(value)})

      expect(values).to.be.eql([1, 2, 3, 4, 5])
    })
    it('should sort with iterator', function(){
      var subject = _r.seq([5, 3,  2, 4, 1])
        , values = []

      _r.chain(subject)
        .sortBy(function(val){return -val})
        .subscribe(function(value){values.push(value)})

      expect(values).to.be.eql([5, 4, 3, 2, 1])
    })
    it('should sort with property', function(){
      var subject = _r.seq([{a: 1, b: 2}, {a: 5, b: 1, c: 0}, {a: 3, b:4}])
        , sortByA = _r.sortBy(subject, 'a')
        , sortByB = _r.sortBy(subject, 'b')
        , valuesA = []
        , valuesB = []
        , sA = sortByA.subscribe(function(val){valuesA.push(val)})
        , sB = sortByB.subscribe(function(val){valuesB.push(val)})

      expect(valuesA).to.be.eql([{a: 1, b: 2}, {a: 3, b:4}, {a: 5, b: 1, c: 0}])
      expect(valuesB).to.be.eql([{a: 5, b: 1, c: 0}, {a: 1, b: 2}, {a: 3, b:4}])
    })
    it('should calculate on complete', function(){
      var values = []
        , subject = _r.subject()

      _r.chain(subject)
        .sortBy(_r.identity)
        .subscribe(function(val){values.push(val)})

      subject.next(4)
      subject.next(-3)
      subject.next(1)
      subject.next(2)

      expect(values).to.be.eql([])

      subject.complete()
      expect(values).to.be.eql([-3, 1, 2, 4])
    })
  })
  describe('sort', function(){
    it('should sort', function(){
      var values = []

      _r.chain(['d', 'a', 'c', 'b'])
        .seq()
        .sort()
        .subscribe(function(value){values.push(value)})

      expect(values).to.be.eql(['a', 'b', 'c', 'd'])
    })
    it('should calculate on complete', function(){
      var values = []
        , subject = _r.subject()

      _r.chain(subject)
        .sort()
        .subscribe(function(val){values.push(val)})

      subject.next(4)
      subject.next(-3)
      subject.next(1)
      subject.next(2)

      expect(values).to.be.eql([])

      subject.complete()
      expect(values).to.be.eql([-3, 1, 2, 4])
    })
  })
  describe('groupBy', function(){
    it('should group on identity', function(){
      var subject = _r.seq(['a', 'b', 'c', 'b', 'c', 'c'])
        , values = []

      _r.chain(subject)
        .groupBy(_r.identity)
        .zipMap()
        .then(function(value){values.push(value)})

      expect(values).to.have.length(1)
      expect(values[0].a).to.be.eql(['a'])
      expect(values[0].b).to.be.eql(['b', 'b'])
      expect(values[0].c).to.be.eql(['c', 'c', 'c'])
    })
    it('should sort group with iterator', function(){
      var subject = _r.seq([1, 1.4, 1.6, 2.0, 3.3])
        , values = []

      _r.chain(subject)
        .groupBy(function(val){return Math.round(val)})
        .zipMap()
        .subscribe(function(value){values.push(value)})

      expect(values).to.have.length(1)
      expect(values[0]['1']).to.be.eql([1, 1.4])
      expect(values[0]['2']).to.be.eql([1.6, 2.0])
      expect(values[0]['3']).to.be.eql([3.3])
    })
    it('should group with property', function(){
      var subject = _r.seq(['bob', 'frank', 'sue', 'fred', 'fran', 'sam'])
        , groupBy = _r.groupBy(subject, 'length')
        , sortBy = _r.sortBy(groupBy, function(val){return val[0]})
        , values = []
        , s = sortBy.subscribe(function(val){values.push(val)})

      expect(values).to.have.length(3)
      expect(values[0][1]).to.eql(['bob', 'sue', 'sam'])
      expect(values[1][1]).to.be.eql(['fred', 'fran'])
      expect(values[2][1]).to.be.eql(['frank'])
    })
    it('should calculate on complete', function(){
      var values = []
        , subject = _r.subject()

      _r.chain(subject)
        .groupBy(function(val){return val.charAt(0)})
        .subscribe(function(val){values.push(val)})

      subject.next('fred')
      subject.next('fran')
      subject.next('sam')
      subject.next('frank')

      expect(values).to.be.eql([])

      subject.complete()

      expect(values).to.have.length(2)

      _r.chain(values).seq().zipMap().then(function(value){
        expect(value.f).to.be.eql(['fred', 'fran', 'frank'])
        expect(value.s).to.be.eql(['sam'])
      })
    })
  })
})
