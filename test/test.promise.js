describe('deferred tests', function(){
  describe('then', function(){
    it('should resolve value using deferred', function(){
      var deferred = _r.deferred()
        , result = 0

      deferred.then(function(val){result = val})
      deferred.resolve(1)

      expect(result).to.be.eql(1)
    })
    it('should resolve value using promise', function(){
      var deferred = _r.deferred()
        , result = 0

      deferred.promise.then(function(val){result = val})
      deferred.resolve(1)

      expect(result).to.be.eql(1)
    })
    it('should resolve after resolve', function(){
      var deferred = _r.deferred()
        , result = 0

      deferred.promise.then(function(val){result = val})
      deferred.resolve(1)

      expect(result).to.be.eql(1)

      result = 0

      deferred.promise.then(function(val){result = val})

      expect(result).to.be.eql(1)

    })
    it('should resolve promise with detached iterator', function(){
      var deferred = _r.deferred()
        , result = 0

      deferred.promise
        .then(_r().map(function(x){return x*2}).first())
        .then(function(val){result = val})
      deferred.resolve(1)

      expect(result).to.be.eql(2)
    })
    it('should resolve promise with promise', function(done){
      var deferred = _r.deferred()
        , resolve = _r.deferred()

      deferred.promise
        .then(resolve.promise)
        .then(function(result){
            expect(result).to.be.eql(43)
            done()
          })

      _r(43)
        .delay(10)
        .first()
        .then(function(val){
          resolve.resolve(val)
      })

      deferred.resolve()
    })
    it('should reject error using deferred', function(){
      var deferred = _r.deferred()
        , result = 0
        , error = 'expected error promise test'

      deferred.then(null, function(err){result = err})
      deferred.error(error)

      expect(result).to.be.eql(error)
    })
    it('should reject error using promise', function(){
      var deferred = _r.deferred()
        , result = 0
        , error = 'expected error promise test'

      deferred.promise.then(null, function(err){result = err})
      deferred.error(error)

      expect(result).to.be.eql(error)
    })
    it('should reject error after error', function(){
      var deferred = _r.deferred()
        , result = 0
        , error

      deferred.promise.then(function(val){result = val}, function(err){error = err})
      deferred.error('promise test error')
      deferred.resolve(1)

      expect(result).to.be.eql(0)
      expect(error).to.be.eql('promise test error')

      error = null

      deferred.promise.then(null, function(err){error = err})
      expect(error).to.be.eql('promise test error')
    })
    it('should call progback on next with deferred', function(){
      var deferred = _r.deferred()
        , result = []

      deferred.then(null, null, function(val){result.push(val)})
      deferred.next(2)
      deferred.next(3)
      deferred.next(4)

      expect(result).to.be.eql([2, 3, 4])
    })
    it('should call progback on next with promise', function(){
      var deferred = _r.deferred()
        , result = []

      deferred.promise.then(null, null, function(val){result.push(val)})
      deferred.next(2)
      deferred.next(3)
      deferred.next(4)

      expect(result).to.be.eql([2, 3, 4])
    })
    it('should chain deferred', function(){
      var deferred = _r.deferred()
        , result1 = 0
        , result2 = 0
        , result3 = 0
        , result4 = 0

      deferred
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
      deferred.resolve(1)

      expect(result1).to.be.eql(1)
      expect(result2).to.be.eql(1)
      expect(result3).to.be.eql(1)
      expect(result4).to.be.eql(1)
    })
    it('should chain promise', function(){
      var deferred = _r.deferred()
        , result1 = 0
        , result2 = 0
        , result3 = 0
        , result4 = 0

      deferred.promise
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
      deferred.resolve(1)

      expect(result1).to.be.eql(1)
      expect(result2).to.be.eql(1)
      expect(result3).to.be.eql(1)
      expect(result4).to.be.eql(1)
    })
    it('should chain deferred and transform results', function(){
      var deferred = _r.deferred()
        , result1 = 0
        , result2 = 0
        , result3 = 0
        , result4 = 0

      deferred
        .then(function(val){
            expect(result1).to.be.eql(0)
            expect(result2).to.be.eql(0)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result1 = val
            return val * 2
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(0)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result2 = val
            return val * 2
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(2)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result3 = val
            return val * 2
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(2)
            expect(result3).to.be.eql(4)
            expect(result4).to.be.eql(0)
            result4 = val
            return val * 2
          })
      deferred.resolve(1)

      expect(result1).to.be.eql(1)
      expect(result2).to.be.eql(2)
      expect(result3).to.be.eql(4)
      expect(result4).to.be.eql(8)
    })
    it('should chain promise and transform results', function(){
      var deferred = _r.deferred()
        , result1 = 0
        , result2 = 0
        , result3 = 0
        , result4 = 0

      deferred.promise
        .then(function(val){
            expect(result1).to.be.eql(0)
            expect(result2).to.be.eql(0)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result1 = val
            return val * 2
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(0)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result2 = val
            return val * 2
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(2)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result3 = val
            return val * 2
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(2)
            expect(result3).to.be.eql(4)
            expect(result4).to.be.eql(0)
            result4 = val
            return val * 2
          })
      deferred.resolve(1)

      expect(result1).to.be.eql(1)
      expect(result2).to.be.eql(2)
      expect(result3).to.be.eql(4)
      expect(result4).to.be.eql(8)
    })
    it('should chain promise and transform results with producers', function(){
      var deferred = _r.deferred()
        , result1 = 0
        , result2 = 0
        , result3 = 0
        , result4 = 0

      deferred.promise
        .then(function(val){
            expect(result1).to.be.eql(0)
            expect(result2).to.be.eql(0)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result1 = val
            return _r(val)
              .map(function(mapped){return mapped * 2})
              .first()
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(0)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result2 = val
            return _r(val)
              .map(function(mapped){return mapped * 3})
              .first()
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(2)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result3 = val
            return _r(val)
              .map(function(mapped){return mapped * 4})
              .first()
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(2)
            expect(result3).to.be.eql(6)
            expect(result4).to.be.eql(0)
            result4 = val
            return _r(val)
              .map(function(mapped){return mapped * 5})
              .first()
          })
      deferred.resolve(1)

      expect(result1).to.be.eql(1)
      expect(result2).to.be.eql(2)
      expect(result3).to.be.eql(6)
      expect(result4).to.be.eql(24)
    })
    it('should chain promise and transform results with promises', function(){
      var deferred = _r.deferred()
        , result1 = 0
        , result2 = 0
        , result3 = 0
        , result4 = 0
        , deferred1 = _r.deferred()
        , deferred2 = _r.deferred()
        , deferred3 = _r.deferred()

      deferred.promise
        .then(function(val){
            expect(result1).to.be.eql(0)
            expect(result2).to.be.eql(0)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result1 = val
            return deferred1.promise
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(0)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result2 = val
            return deferred2
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(2)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result3 = val
            return deferred3.promise
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(2)
            expect(result3).to.be.eql(6)
            expect(result4).to.be.eql(0)
            result4 = val
          })

      deferred.resolve(1)
      expect(result1).to.be.eql(1)
      expect(result2).to.be.eql(0)
      expect(result3).to.be.eql(0)
      expect(result4).to.be.eql(0)

      deferred1.resolve(2)
      expect(result1).to.be.eql(1)
      expect(result2).to.be.eql(2)
      expect(result3).to.be.eql(0)
      expect(result4).to.be.eql(0)

      deferred2.resolve(6)
      expect(result1).to.be.eql(1)
      expect(result2).to.be.eql(2)
      expect(result3).to.be.eql(6)
      expect(result4).to.be.eql(0)

      deferred3.resolve(24)
      expect(result1).to.be.eql(1)
      expect(result2).to.be.eql(2)
      expect(result3).to.be.eql(6)
      expect(result4).to.be.eql(24)
    })
  })
  describe('deferred', function(){
    it('should have methods', function(){
      var deferred = _r.deferred()
      expect(deferred).to.be.ok()
      expect(deferred.promise).to.be.ok()
      expect(deferred.subscribe).to.be.a('function')
      expect(deferred.next).to.be.a('function')
      expect(deferred.error).to.be.a('function')
      expect(deferred.complete).to.be.a('function')
      expect(deferred.resolve).to.be.a('function')
      expect(deferred.then).to.be.a('function')
    })
    it('promise should not have next, complete, error, resolve', function(){
      var deferred = _r.deferred()
      expect(deferred.promise).to.be.ok()
      expect(deferred.promise).to.be.ok()
      expect(deferred.promise.subscribe).to.be.a('function')
      expect(deferred.promise.next).to.not.be.a('function')
      expect(deferred.promise.complete).to.not.be.a('function')
      expect(deferred.promise.resolve).to.not.be.a('function')
      expect(deferred.promise.error).to.not.be.a('function')
      expect(deferred.promise.then).to.be.a('function')
    })
    it('should subscribe with disposable', function(){
      var deferred = _r.deferred()
        , d = deferred.subscribe()
      expect(d).to.be.ok()
      expect(d.dispose).to.be.a('function')
      d.dispose()
    })
    it('should subscribe next', function(){
      var deferred = _r.deferred()
        , values = []
        , next = function(value){
          values.push(value)
        }
      expect(values).to.be.empty()

      deferred.subscribe(next)
      expect(values).to.be.empty()

      deferred.next(1)
      expect(values).to.eql([1])

      deferred.next('2')
      expect(values).to.eql([1, '2'])

      deferred.next({a:3, b:4})
      expect(values).to.eql([1, '2', {a:3, b:4}])

      deferred.next([5, 6])
      expect(values).to.eql([1, '2', {a:3, b:4}, [5, 6]])

      deferred.complete()
      deferred.next('should not add after complete')
      expect(values).to.eql([1, '2', {a:3, b:4}, [5, 6]])
    })
    it('should not send next after complete', function(){
      var deferred = _r.deferred()
        , values = []
        , next = function(value){
          values.push(value)
        }
      expect(values).to.be.empty()

      deferred.subscribe(next)
      expect(values).to.be.empty()

      deferred.next(1)
      expect(values).to.eql([1])

      deferred.next(2)
      expect(values).to.eql([1, 2])

      deferred.next(3)
      expect(values).to.eql([1, 2, 3])

      deferred.next(4)
      expect(values).to.eql([1, 2, 3, 4])

      deferred.complete()
      deferred.next(5)
      expect(values).to.eql([1, 2, 3, 4])
    })
    it('should not send next after error', function(){
      var deferred = _r.deferred()
        , values = []
        , next = function(value){
          values.push(value)
        }
      expect(values).to.be.empty()

      deferred.subscribe(next)
      expect(values).to.be.empty()

      deferred.next(1)
      expect(values).to.eql([1])

      deferred.next(2)
      expect(values).to.eql([1, 2])

      deferred.next(3)
      expect(values).to.eql([1, 2, 3])

      deferred.next(4)
      expect(values).to.eql([1, 2, 3, 4])

      deferred.error('promise test error')
      expect(values).to.eql([1, 2, 3, 4])

      deferred.next(5)
      deferred.complete()
      deferred.error('promise test error')
      expect(values).to.eql([1, 2, 3, 4])
    })
    it('should not send next after dispose', function(){
      var deferred = _r.deferred()
        , values = []
        , next = function(value){
          values.push(value)
        }
        , d = deferred.subscribe(next)

      expect(values).to.be.empty()

      deferred.next(1)
      expect(values).to.eql([1])

      deferred.next(2)
      expect(values).to.eql([1, 2])

      deferred.next(3)
      expect(values).to.eql([1, 2, 3])

      deferred.next(4)
      expect(values).to.eql([1, 2, 3, 4])

      d.dispose()
      expect(values).to.eql([1, 2, 3, 4])

      deferred.next(5)
      deferred.complete()
      deferred.error(new Error)
      expect(values).to.eql([1, 2, 3, 4])
    })
    it('should subscribe complete', function(){
      var deferred = _r.deferred()
        , values = []
        , finished = false
        , next = function(value){
          values.push(value)
        }
        , complete = function(){
          finished = true
        }

      expect(values).to.be.empty()
      expect(finished).to.be(false)

      deferred.subscribe(next, complete)
      expect(values).to.be.empty()
      expect(finished).to.be(false)

      deferred.next(1)
      expect(values).to.eql([1])
      expect(finished).to.be(false)

      deferred.next(2)
      expect(values).to.eql([1, 2])
      expect(finished).to.be(false)

      deferred.complete()
      expect(finished).to.be(true)

      deferred.next(3)
      deferred.complete()
      deferred.error(new Error)
      expect(values).to.eql([1, 2])
    })
    it('should not complete after error', function(){
      var deferred = _r.deferred()
        , values = []
        , finished = false
        , next = function(value){
          values.push(value)
        }
        , complete = function(){
          finished = true
        }

      expect(values).to.be.empty()
      expect(finished).to.be(false)

      deferred.subscribe(next, complete)
      expect(values).to.be.empty()
      expect(finished).to.be(false)

      deferred.next(1)
      expect(values).to.eql([1])
      expect(finished).to.be(false)

      deferred.next(2)
      expect(values).to.eql([1, 2])
      expect(finished).to.be(false)

      deferred.error(new Error)
      expect(finished).to.be(false)

      deferred.next(3)
      deferred.complete()
      deferred.error(new Error)
      expect(values).to.eql([1, 2])
    })
    it('should not complete after dispose', function(){
      var deferred = _r.deferred()
        , values = []
        , finished = false
        , next = function(value){
          values.push(value)
        }
        , complete = function(){
          finished = true
        }
        , d = deferred.subscribe(next, complete)

      expect(values).to.be.empty()
      expect(finished).to.be(false)

      expect(values).to.be.empty()
      expect(finished).to.be(false)

      deferred.next(1)
      expect(values).to.eql([1])
      expect(finished).to.be(false)

      deferred.next(2)
      expect(values).to.eql([1, 2])
      expect(finished).to.be(false)

      d.dispose()
      expect(finished).to.be(false)

      deferred.next(3)
      deferred.complete()
      deferred.error(new Error)
      expect(values).to.eql([1, 2])
    })
    it('should subscribe error', function(){
      var deferred = _r.deferred()
        , values = []
        , finished = false
        , errors = []
        , next = function(value){
          values.push(value)
        }
        , complete = function(){
          finished = true
        }
        , error = function(err){
          errors.push(err)
        }

      expect(values).to.be.empty()
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.subscribe(next, complete, error)
      expect(values).to.be.empty()
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.next(1)
      expect(values).to.eql([1])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.next(2)
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      var err = new Error
      deferred.error(err)
      expect(finished).to.be(false)
      expect(errors).to.eql([err])

      deferred.next(3)
      deferred.error(err)
      deferred.complete()
      expect(values).to.eql([1, 2])
      expect(errors).to.eql([err])
    })
    it('should not error after complete', function(){
      var deferred = _r.deferred()
        , values = []
        , finished = false
        , errors = []
        , next = function(value){
          values.push(value)
        }
        , complete = function(){
          finished = true
        }
        , error = function(err){
          errors.push(err)
        }

      expect(values).to.be.empty()
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.subscribe(next, complete, error)
      expect(values).to.be.empty()
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.next(1)
      expect(values).to.eql([1])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.next(2)
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.complete()
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(true)

      deferred.error(new Error)
      expect(finished).to.be(true)
      expect(errors).to.be.empty()

      deferred.next(3)
      deferred.error(new Error)
      deferred.complete()
      expect(values).to.eql([1, 2])
      expect(finished).to.be(true)
      expect(errors).to.be.empty()
    })
    it('should not error after dispose', function(){
      var deferred = _r.deferred()
        , values = []
        , finished = false
        , errors = []
        , next = function(value){
          values.push(value)
        }
        , complete = function(){
          finished = true
        }
        , error = function(err){
          errors.push(err)
        }
        , d = deferred.subscribe(next, complete, error)

      expect(values).to.be.empty()
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.next(1)
      expect(values).to.eql([1])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.next(2)
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      d.dispose()
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.error(new Error)
      expect(finished).to.be(false)
      expect(errors).to.be.empty()

      deferred.next(3)
      deferred.error(new Error)
      deferred.complete()
      expect(values).to.eql([1, 2])
      expect(finished).to.be(false)
      expect(errors).to.be.empty()
    })
    it('should allow multiple subscriptions', function(){
      var deferred = _r.deferred()
        , values1 = []
        , values2 = []
        , finished1 = false
        , finished2 = false
        , errors1 = []
        , errors2 = []
        , next1 = function(value){
          values1.push(value)
        }
        , next2 = function(value){
          values2.push(value)
        }
        , complete1 = function(){
          finished1 = true
        }
        , complete2 = function(){
          finished2 = true
        }
        , error1 = function(err){
          errors1.push(err)
        }
        , error2 = function(err){
          errors2.push(err)
        }
        , d1 = deferred.subscribe(next1, complete1, error1)
        , d2 = deferred.subscribe(next2, complete2, error2)

      deferred.next(1)
      expect(values1).to.eql([1])
      expect(values2).to.eql([1])
      expect(errors1).to.be.empty()
      expect(errors2).to.be.empty()
      expect(finished1).to.be(false)
      expect(finished2).to.be(false)

      deferred.next(2)
      expect(values1).to.eql([1, 2])
      expect(values2).to.eql([1, 2])
      expect(errors1).to.be.empty()
      expect(errors2).to.be.empty()
      expect(finished1).to.be(false)
      expect(finished2).to.be(false)

      d2.dispose()

      deferred.next(3)
      expect(values1).to.eql([1, 2, 3])
      expect(values2).to.eql([1, 2])
      expect(errors1).to.be.empty()
      expect(errors2).to.be.empty()
      expect(finished1).to.be(false)
      expect(finished2).to.be(false)

      deferred.complete()
      deferred.next(4)
      expect(values1).to.eql([1, 2, 3])
      expect(values2).to.eql([1, 2])
      expect(errors1).to.be.empty()
      expect(errors2).to.be.empty()
      expect(finished1).to.be(true)
      expect(finished2).to.be(false)

    })
  })
  describe('callback', function(){
    it('should callback until producer complete', function(){
      var progress = []
        , expected = []
        , result = null
        , error = null
        , cb = _r()
            .map(function(val){return val.toUpperCase()})
            .first(3)
            .callback()

      cb.then(
          function(results){result = results}
        , function(err){error = err}
        , function(next){progress.push(next)})

      cb('a')
      expected.push('A')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb('b')
      expected.push('B')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb('c')
      expected.push('C')
      expect(result).to.eql(expected)
      expect(error).to.be(null)
      expect(progress).to.eql(expected)

      cb('d')
      expect(result).to.eql(expected)
      expect(error).to.be(null)
      expect(progress).to.eql(expected)
    })
    it('should callback until callback complete', function(){
      var progress = []
        , expected = []
        , result = null
        , error = null
        , cb = _r()
            .map(function(val){return val.toUpperCase()})
            .callback()

      cb.then(
          function(results){result = results}
        , function(err){error = err}
        , function(next){progress.push(next)})

      cb('a')
      expected.push('A')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb('b')
      expected.push('B')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb('c')
      expected.push('C')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb.complete()
      expect(result).to.eql(expected)
      expect(error).to.be(null)
      expect(progress).to.eql(expected)

      cb('d')
      expect(result).to.eql(expected)
      expect(error).to.be(null)
      expect(progress).to.eql(expected)
    })
    it('should callback until callback error', function(){
      var progress = []
        , expected = []
        , result = null
        , error = null
        , errorToSend = 'expected error callback test'
        , cb = _r()
            .map(function(val){return val.toUpperCase()})
            .callback()

      cb.then(
          function(results){result = results}
        , function(err){error = err}
        , function(next){progress.push(next)})

      cb('a')
      expected.push('A')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb('b')
      expected.push('B')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb('c')
      expected.push('C')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb.error(errorToSend)
      expect(result).to.eql(null)
      expect(error).to.be(errorToSend)
      expect(progress).to.eql(expected)

      cb('d')
      expect(result).to.eql(null)
      expect(error).to.be(errorToSend)
      expect(progress).to.eql(expected)
    })
  })
  describe('ncallback', function(){
    it('should callback until producer complete', function(){
      var progress = []
        , expected = []
        , result = null
        , error = null
        , cb = _r()
            .map(function(val){return val.toUpperCase()})
            .first(3)
            .ncallback()

      cb.then(
          function(results){result = results}
        , function(err){error = err}
        , function(next){progress.push(next)})

      cb(null, 'a')
      expected.push('A')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb(null, 'b')
      expected.push('B')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb(null, 'c')
      expected.push('C')
      expect(result).to.eql(expected)
      expect(error).to.be(null)
      expect(progress).to.eql(expected)

      cb(null, 'd')
      expect(result).to.eql(expected)
      expect(error).to.be(null)
      expect(progress).to.eql(expected)
    })
    it('should callback until error through node callback', function(){
      var progress = []
        , expected = []
        , result = null
        , error = null
        , errorToSend = 'expected error callback test'
        , cb = _r()
            .map(function(val){return val.toUpperCase()})
            .ncallback()

      cb.then(
          function(results){result = results}
        , function(err){error = err}
        , function(next){progress.push(next)})

      cb(null, 'a')
      expected.push('A')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb(null, 'b')
      expected.push('B')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb(null, 'c')
      expected.push('C')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb(errorToSend)
      expect(result).to.eql(null)
      expect(error).to.be(errorToSend)
      expect(progress).to.eql(expected)

      cb(null, 'd')
      expect(result).to.eql(null)
      expect(error).to.be(errorToSend)
      expect(progress).to.eql(expected)
    })
    it('should callback until callback complete', function(){
      var progress = []
        , expected = []
        , result = null
        , error = null
        , cb = _r()
            .map(function(val){return val.toUpperCase()})
            .ncallback()

      cb.then(
          function(results){result = results}
        , function(err){error = err}
        , function(next){progress.push(next)})

      cb(null, 'a')
      expected.push('A')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb(null, 'b')
      expected.push('B')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb(null, 'c')
      expected.push('C')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb.complete()
      expect(result).to.eql(expected)
      expect(error).to.be(null)
      expect(progress).to.eql(expected)

      cb(null, 'd')
      expect(result).to.eql(expected)
      expect(error).to.be(null)
      expect(progress).to.eql(expected)
    })
    it('should callback until callback error', function(){
      var progress = []
        , expected = []
        , result = null
        , error = null
        , errorToSend = 'expected error callback test'
        , cb = _r()
            .map(function(val){return val.toUpperCase()})
            .ncallback()

      cb.then(
          function(results){result = results}
        , function(err){error = err}
        , function(next){progress.push(next)})

      cb(null, 'a')
      expected.push('A')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb(null, 'b')
      expected.push('B')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb(null, 'c')
      expected.push('C')
      expect(result).to.be(null)
      expect(error).to.be(null)
      expect(progress).to.be.eql(expected)

      cb.error(errorToSend)
      expect(result).to.eql(null)
      expect(error).to.be(errorToSend)
      expect(progress).to.eql(expected)

      cb(null, 'd')
      expect(result).to.eql(null)
      expect(error).to.be(errorToSend)
      expect(progress).to.eql(expected)
    })
  })
})
