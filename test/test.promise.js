describe('promise tests', function(){
  describe('then', function(){
    it('should resolve value', function(){
      var promise = _r.promise()
        , result = 0

      promise.then(function(val){result = val})
      promise.resolve(1)

      expect(result).to.be.eql(1)
    })
    it('should reject error', function(){
      var promise = _r.promise()
        , result = 0
        , error = new Error

      promise.then(null, function(err){result = err})
      promise.error(error)

      expect(result).to.be.eql(error)
    })
    it('should call progback on next', function(){
      var promise = _r.promise()
        , result = []

      promise.then(null, null, function(val){result.push(val)})
      promise.next(2)
      promise.next(3)
      promise.next(4)

      expect(result).to.be.eql([2, 3, 4])
    })
    it('should chain', function(){
      var promise = _r.promise()
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
  describe('promise', function(){
    it('should have methods', function(){
      var promise = _r.promise()
      expect(promise).to.be.ok()
      expect(promise.subscribe).to.be.a('function')
      expect(promise.next).to.be.a('function')
      expect(promise.error).to.be.a('function')
      expect(promise.complete).to.be.a('function')
    })
    it('should subscribe with disposable', function(){
      var promise = _r.promise()
        , d = promise.subscribe()
      expect(d).to.be.ok()
      expect(d.dispose).to.be.a('function')
      d.dispose()
    })
    it('should subscribe next', function(){
      var promise = _r.promise()
        , values = []
        , next = function(value){
          values.push(value)
        }
      expect(values).to.be.empty()

      promise.subscribe(next)
      expect(values).to.be.empty()

      promise.next(1)
      expect(values).to.eql([1])

      promise.next('2')
      expect(values).to.eql([1, '2'])

      promise.next({a:3, b:4})
      expect(values).to.eql([1, '2', {a:3, b:4}])

      promise.next([5, 6])
      expect(values).to.eql([1, '2', {a:3, b:4}, [5, 6]])

      promise.complete()
      promise.next('should not add after complete')
      expect(values).to.eql([1, '2', {a:3, b:4}, [5, 6]])
    })
    it('should not send next after complete', function(){
      var promise = _r.promise()
        , values = []
        , next = function(value){
          values.push(value)
        }
      expect(values).to.be.empty()

      promise.subscribe(next)
      expect(values).to.be.empty()

      promise.next(1)
      expect(values).to.eql([1])

      promise.next(2)
      expect(values).to.eql([1, 2])

      promise.next(3)
      expect(values).to.eql([1, 2, 3])

      promise.next(4)
      expect(values).to.eql([1, 2, 3, 4])

      promise.complete()
      promise.next(5)
      expect(values).to.eql([1, 2, 3, 4])
    })
    it('should not send next after error', function(){
      var promise = _r.promise()
        , values = []
        , next = function(value){
          values.push(value)
        }
      expect(values).to.be.empty()

      promise.subscribe(next)
      expect(values).to.be.empty()

      promise.next(1)
      expect(values).to.eql([1])

      promise.next(2)
      expect(values).to.eql([1, 2])

      promise.next(3)
      expect(values).to.eql([1, 2, 3])

      promise.next(4)
      expect(values).to.eql([1, 2, 3, 4])

      promise.error(new Error)
      expect(values).to.eql([1, 2, 3, 4])

      promise.next(5)
      promise.complete()
      promise.error(new Error)
      expect(values).to.eql([1, 2, 3, 4])
    })
    it('should not send next after dispose', function(){
      var promise = _r.promise()
        , values = []
        , next = function(value){
          values.push(value)
        }
        , d = promise.subscribe(next)

      expect(values).to.be.empty()

      promise.next(1)
      expect(values).to.eql([1])

      promise.next(2)
      expect(values).to.eql([1, 2])

      promise.next(3)
      expect(values).to.eql([1, 2, 3])

      promise.next(4)
      expect(values).to.eql([1, 2, 3, 4])

      d.dispose()
      expect(values).to.eql([1, 2, 3, 4])

      promise.next(5)
      promise.complete()
      promise.error(new Error)
      expect(values).to.eql([1, 2, 3, 4])
    })
    it('should subscribe complete', function(){
      var promise = _r.promise()
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

      promise.subscribe(next, complete)
      expect(values).to.be.empty()
      expect(finished).to.be(false)

      promise.next(1)
      expect(values).to.eql([1])
      expect(finished).to.be(false)

      promise.next(2)
      expect(values).to.eql([1, 2])
      expect(finished).to.be(false)

      promise.complete()
      expect(finished).to.be(true)

      promise.next(3)
      promise.complete()
      promise.error(new Error)
      expect(values).to.eql([1, 2])
    })
    it('should not complete after error', function(){
      var promise = _r.promise()
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

      promise.subscribe(next, complete)
      expect(values).to.be.empty()
      expect(finished).to.be(false)

      promise.next(1)
      expect(values).to.eql([1])
      expect(finished).to.be(false)

      promise.next(2)
      expect(values).to.eql([1, 2])
      expect(finished).to.be(false)

      promise.error(new Error)
      expect(finished).to.be(false)

      promise.next(3)
      promise.complete()
      promise.error(new Error)
      expect(values).to.eql([1, 2])
    })
    it('should not complete after dispose', function(){
      var promise = _r.promise()
        , values = []
        , finished = false
        , next = function(value){
          values.push(value)
        }
        , complete = function(){
          finished = true
        }
        , d = promise.subscribe(next, complete)

      expect(values).to.be.empty()
      expect(finished).to.be(false)

      expect(values).to.be.empty()
      expect(finished).to.be(false)

      promise.next(1)
      expect(values).to.eql([1])
      expect(finished).to.be(false)

      promise.next(2)
      expect(values).to.eql([1, 2])
      expect(finished).to.be(false)

      d.dispose()
      expect(finished).to.be(false)

      promise.next(3)
      promise.complete()
      promise.error(new Error)
      expect(values).to.eql([1, 2])
    })
    it('should subscribe error', function(){
      var promise = _r.promise()
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

      promise.subscribe(next, complete, error)
      expect(values).to.be.empty()
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      promise.next(1)
      expect(values).to.eql([1])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      promise.next(2)
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      var err = new Error
      promise.error(err)
      expect(finished).to.be(false)
      expect(errors).to.eql([err])

      promise.next(3)
      promise.error(err)
      promise.complete()
      expect(values).to.eql([1, 2])
      expect(errors).to.eql([err])
    })
    it('should not error after complete', function(){
      var promise = _r.promise()
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

      promise.subscribe(next, complete, error)
      expect(values).to.be.empty()
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      promise.next(1)
      expect(values).to.eql([1])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      promise.next(2)
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      promise.complete()
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(true)

      promise.error(new Error)
      expect(finished).to.be(true)
      expect(errors).to.be.empty()

      promise.next(3)
      promise.error(new Error)
      promise.complete()
      expect(values).to.eql([1, 2])
      expect(finished).to.be(true)
      expect(errors).to.be.empty()
    })
    it('should not error after dispose', function(){
      var promise = _r.promise()
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
        , d = promise.subscribe(next, complete, error)

      expect(values).to.be.empty()
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      promise.next(1)
      expect(values).to.eql([1])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      promise.next(2)
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      d.dispose()
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      promise.error(new Error)
      expect(finished).to.be(false)
      expect(errors).to.be.empty()

      promise.next(3)
      promise.error(new Error)
      promise.complete()
      expect(values).to.eql([1, 2])
      expect(finished).to.be(false)
      expect(errors).to.be.empty()
    })
    it('should allow multiple subscriptions', function(){
      var promise = _r.promise()
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
        , d1 = promise.subscribe(next1, complete1, error1)
        , d2 = promise.subscribe(next2, complete2, error2)

      promise.next(1)
      expect(values1).to.eql([1])
      expect(values2).to.eql([1])
      expect(errors1).to.be.empty()
      expect(errors2).to.be.empty()
      expect(finished1).to.be(false)
      expect(finished2).to.be(false)

      promise.next(2)
      expect(values1).to.eql([1, 2])
      expect(values2).to.eql([1, 2])
      expect(errors1).to.be.empty()
      expect(errors2).to.be.empty()
      expect(finished1).to.be(false)
      expect(finished2).to.be(false)

      d2.dispose()

      promise.next(3)
      expect(values1).to.eql([1, 2, 3])
      expect(values2).to.eql([1, 2])
      expect(errors1).to.be.empty()
      expect(errors2).to.be.empty()
      expect(finished1).to.be(false)
      expect(finished2).to.be(false)

      promise.complete()
      promise.next(4)
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
