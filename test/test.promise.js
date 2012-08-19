describe('promise tests', function(){
  describe('then', function(){
    it('should resolve value', function(){
      var promise = _r()
        , result = 0
      
      promise.then(function(val){result = val})
      promise.resolve(1)

      expect(result).to.be.eql(1)
    })
    it('should reject error', function(){
      var promise = _r()
        , result = 0
        , error = new Error

      promise.then(null, function(err){result = err})
      promise.error(error)

      expect(result).to.be.eql(error)
    })
    it('should call progback on next', function(){
      var promise = _r()
        , result = [] 

      promise.then(null, null, function(val){result.push(val)})
      promise.next(2)
      promise.next(3)
      promise.next(4)

      expect(result).to.be.eql([2, 3, 4])
    })
    it('should chain', function(){
      var promise = _r()
        , result1 = 0
        , result2 = 0
        , result3 = 0
        , result4 = 0
      
      promise
        .then(function(val){
            expect(result1).to.be.eql(0)
            expect(result2).to.be.eql(0)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result1 = val
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(0)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result2 = val
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(1)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result3 = val
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(1)
            expect(result3).to.be.eql(1)
            expect(result4).to.be.eql(0)
            result4 = val
          })
      promise.resolve(1)

      expect(result1).to.be.eql(1)
      expect(result2).to.be.eql(1)
      expect(result3).to.be.eql(1)
      expect(result4).to.be.eql(1)
    })
  })
})
