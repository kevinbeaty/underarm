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
        , each = _r.each(subject, function(val, cb){values.push(val); cb()})
        , values2 = []
        , s = each.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should pass through original values', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , values = []
        , each = _r.each(subject, function(val, cb){values.push(val*2); cb(val*2)})
        , values2 = []
        , s = each.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([2, 4, 6, 8])
      expect(values2).to.be.eql([1, 2, 3, 4])
    })
    it('should chain', function(){
      var values = []
        , values2 = []

      _r.chain([1, 2, 3, 4])
        .seq()
        .each(function(val, cb){values.push(val*2); cb(val*2)})
        .subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([2, 4, 6, 8])
      expect(values2).to.be.eql([1, 2, 3, 4])
    })
  })
  describe('map', function(){
    it('should collect each value sent', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []

      _r.map(subject, function(val, cb){values.push(val); cb(val)}).subscribe()

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []
        , map = _r.map(subject, function(val, cb){values.push(val); cb(val)})
        , values2 = []
        , s = map.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should transform original values', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , values = []
        , map = _r.map(subject, function(val, cb){values.push(val); cb(val*3)})
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
        .each(function(val, cb){values.push(val*2); cb(val*2)})
        .map(function(val, cb){values2.push(val); cb(val*3)})
        .subscribe(function(val){values3.push(val)})

      expect(values).to.be.eql([2, 4, 6, 8])
      expect(values2).to.be.eql([1, 2, 3, 4])
      expect(values3).to.be.eql([3, 6, 9, 12])
    })
  })
  describe('filter', function(){
    it('should collect each value sent', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []

       _r.filter(subject, function(val, cb){values.push(val); cb(val)}).subscribe()

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []
        , filter = _r.filter(subject, function(val, cb){values.push(val); cb(true)})
        , values2 = []
        , s = filter.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should filter original values', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , values = []
        , filter = _r.filter(subject, function(val, cb){values.push(val); cb(val%2 === 0)})
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
        .filter(function(val, cb){values.push(val); cb(val%2 === 1)})
        .subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([1, 3])
    })
  })
  describe('reject', function(){
    it('should collect each value sent', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []

       _r.reject(subject, function(val, cb){values.push(val); cb(val)}).subscribe()

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should allow subscription', function(){
      var subject = _r.seq([1, '2', {a: 3}, [4, 5]])
        , values = []
        , filter = _r.filter(subject, function(val, cb){values.push(val); cb(true)})
        , values2 = []
        , s = filter.subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, '2', {a: 3}, [4, 5]])
      expect(values2).to.be.eql([1, '2', {a: 3}, [4, 5]])
    })
    it('should reject original values', function(){
      var subject = _r.seq([1, 2, 3, 4])
        , values = []
        , reject = _r.reject(subject, function(val, cb){values.push(val); cb(val%2 === 1)})
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
        .reject(function(val, cb){values.push(val); cb(val%2 === 1)})
        .subscribe(function(val){values2.push(val)})

      expect(values).to.be.eql([1, 2, 3, 4])
      expect(values2).to.be.eql([2, 4])
    })
  })
})
