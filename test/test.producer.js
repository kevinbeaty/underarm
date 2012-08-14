describe('producer tests', function(){
  describe('each', function(){
    it('should collect each value sent', function(){
      var subject = _r.subject()
        , values = []
        , each = _r.each(subject, function(val){values.push(val)})

      each.subscribe()
      subject.next(1)
      subject.next('2')
      subject.next({a: 3})
      subject.next([4, 5])

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription (return)', function(){
      var subject = _r.subject()
        , values = []
        , each = _r.each(subject, function(val){values.push(val); return true})
        , values2 = []
        , s = each.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next('2')
      subject.next({a: 3})
      subject.next([4, 5])

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription (cb)', function(){
      var subject = _r.subject()
        , values = []
        , each = _r.each(subject, function(val, cb){values.push(val); cb()})
        , values2 = []
        , s = each.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next('2')
      subject.next({a: 3})
      subject.next([4, 5])

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should pass through original values', function(){
      var subject = _r.subject()
        , values = []
        , each = _r.each(subject, function(val){values.push(val*2); return val*2})
        , values2 = []
        , s = each.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next(2)
      subject.next(3)
      subject.next(4)

      expect(values).to.be.eql([2, 4, 6, 8])
      expect(values2).to.be.eql([1, 2, 3, 4])
    })
  })
  describe('map', function(){
    it('should collect each value sent', function(){
      var subject = _r.subject()
        , values = []
        , map = _r.map(subject, function(val){values.push(val); return val})

      map.subscribe()
      subject.next(1)
      subject.next('2')
      subject.next({a: 3})
      subject.next([4, 5])

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.subject()
        , values = []
        , map = _r.map(subject, function(val){values.push(val); return val})
        , values2 = []
        , s = map.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next('2')
      subject.next({a: 3})
      subject.next([4, 5])

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should transform original values (return)', function(){
      var subject = _r.subject()
        , values = []
        , map = _r.map(subject, function(val){values.push(val); return val*2})
        , values2 = []
        , s = map.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next(2)
      subject.next(3)
      subject.next(4)

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([2, 4, 6, 8])
    })
    it('should transform original values (cb)', function(){
      var subject = _r.subject()
        , values = []
        , map = _r.map(subject, function(val, cb){values.push(val); cb(val*3)})
        , values2 = []
        , s = map.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next(2)
      subject.next(3)
      subject.next(4)

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([3, 6, 9, 12])
    })
  })
  describe('filter', function(){
    it('should collect each value sent', function(){
      var subject = _r.subject()
        , values = []
        , filter = _r.filter(subject, function(val){values.push(val); return val})

      filter.subscribe()
      subject.next(1)
      subject.next('2')
      subject.next({a: 3})
      subject.next([4, 5])

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.subject()
        , values = []
        , filter = _r.filter(subject, function(val){values.push(val); return true})
        , values2 = []
        , s = filter.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next('2')
      subject.next({a: 3})
      subject.next([4, 5])

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should filter original values (return)', function(){
      var subject = _r.subject()
        , values = []
        , filter = _r.filter(subject, function(val){values.push(val); return (val%2 === 1)})
        , values2 = []
        , s = filter.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next(2)
      subject.next(3)
      subject.next(4)

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([1, 3])
    })
    it('should filter original values (cb)', function(){
      var subject = _r.subject()
        , values = []
        , filter = _r.filter(subject, function(val, cb){values.push(val); cb(val%2 === 0)})
        , values2 = []
        , s = filter.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next(2)
      subject.next(3)
      subject.next(4)

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([2, 4])
    })
  })
  describe('reject', function(){
    it('should collect each value sent', function(){
      var subject = _r.subject()
        , values = []
        , reject = _r.reject(subject, function(val){values.push(val); return val})

      reject.subscribe()
      subject.next(1)
      subject.next('2')
      subject.next({a: 3})
      subject.next([4, 5])

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.subject()
        , values = []
        , filter = _r.filter(subject, function(val){values.push(val); return true})
        , values2 = []
        , s = filter.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next('2')
      subject.next({a: 3})
      subject.next([4, 5])

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should filter original values (return)', function(){
      var subject = _r.subject()
        , values = []
        , filter = _r.filter(subject, function(val){values.push(val); return (val%2 === 1)})
        , values2 = []
        , s = filter.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next(2)
      subject.next(3)
      subject.next(4)

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([1, 3])
    })
    it('should filter original values (cb)', function(){
      var subject = _r.subject()
        , values = []
        , filter = _r.filter(subject, function(val, cb){values.push(val); cb(val%2 === 0)})
        , values2 = []
        , s = filter.subscribe(function(val){values2.push(val)})

      subject.next(1)
      subject.next(2)
      subject.next(3)
      subject.next(4)

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([2, 4])
    })
  })
})
