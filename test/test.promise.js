"use strict";
/*global describe, it, _r, expect */
describe('deferred tests', function(){
  describe('then', function(){
    it('should resolve value using deferred', function(){
      var deferred = _r.when.defer()
        , result = 0

      deferred.then(function(val){result = val})
      deferred.resolve(1)

      expect(result).to.be.eql(1)
    })
    it('should resolve value using promise', function(){
      var deferred = _r.when.defer()
        , result = 0

      deferred.promise.then(function(val){result = val})
      deferred.resolve(1)

      expect(result).to.be.eql(1)
    })
    it('should resolve after resolve', function(){
      var deferred = _r.when.defer()
        , result = 0

      deferred.promise.then(function(val){result = val})
      deferred.resolve(1)

      expect(result).to.be.eql(1)

      result = 0

      deferred.promise.then(function(val){result = val})

      expect(result).to.be.eql(1)

    })
    it('should resolve promise with promise', function(done){
      var deferred = _r.when.defer()
        , resolve = _r.when.defer()

      deferred.promise
        .then(function(){
          return resolve.promise
        })
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
      var deferred = _r.when.defer()
        , result = 0
        , error = 'expected error promise test'

      deferred.then(null, function(err){result = err})
      deferred.reject(error)

      expect(result).to.be.eql(error)
    })
    it('should reject error using promise', function(){
      var deferred = _r.when.defer()
        , result = 0
        , error = 'expected error promise test'

      deferred.promise.then(null, function(err){result = err})
      deferred.reject(error)

      expect(result).to.be.eql(error)
    })
    it('should reject error after error', function(){
      var deferred = _r.when.defer()
        , result = 0
        , error

      deferred.promise.then(function(val){result = val}, function(err){error = err})
      deferred.reject('promise test error')
      deferred.resolve(1)

      expect(result).to.be.eql(0)
      expect(error).to.be.eql('promise test error')

      error = null

      deferred.promise.then(null, function(err){error = err})
      expect(error).to.be.eql('promise test error')
    })
    it('should call progback on next with deferred', function(){
      var deferred = _r.when.defer()
        , result = []

      deferred.then(null, null, function(val){result.push(val)})
      deferred.notify(2)
      deferred.notify(3)
      deferred.notify(4)

      expect(result).to.be.eql([2, 3, 4])
    })
    it('should call progback on next with promise', function(){
      var deferred = _r.when.defer()
        , result = []

      deferred.promise.then(null, null, function(val){result.push(val)})
      deferred.notify(2)
      deferred.notify(3)
      deferred.notify(4)

      expect(result).to.be.eql([2, 3, 4])
    })
    it('should chain deferred', function(){
      var deferred = _r.when.defer()
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
            return val
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(0)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result2 = val
            return val
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(1)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result3 = val
            return val
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(1)
            expect(result3).to.be.eql(1)
            expect(result4).to.be.eql(0)
            result4 = val
            return val
          })
      deferred.resolve(1)

      expect(result1).to.be.eql(1)
      expect(result2).to.be.eql(1)
      expect(result3).to.be.eql(1)
      expect(result4).to.be.eql(1)
    })
    it('should chain promise', function(){
      var deferred = _r.when.defer()
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
            return val
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(0)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result2 = val
            return val
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(1)
            expect(result3).to.be.eql(0)
            expect(result4).to.be.eql(0)
            result3 = val
            return val
          })
        .then(function(val){
            expect(result1).to.be.eql(1)
            expect(result2).to.be.eql(1)
            expect(result3).to.be.eql(1)
            expect(result4).to.be.eql(0)
            result4 = val
            return val
          })
      deferred.resolve(1)

      expect(result1).to.be.eql(1)
      expect(result2).to.be.eql(1)
      expect(result3).to.be.eql(1)
      expect(result4).to.be.eql(1)
    })
    it('should chain deferred and transform results', function(){
      var deferred = _r.when.defer()
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
      var deferred = _r.when.defer()
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
      var deferred = _r.when.defer()
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
      var deferred = _r.when.defer()
        , result1 = 0
        , result2 = 0
        , result3 = 0
        , result4 = 0
        , deferred1 = _r.when.defer()
        , deferred2 = _r.when.defer()
        , deferred3 = _r.when.defer()

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
    it('should subscribe next', function(){
      var deferred = _r.when.defer()
        , values = []
        , next = function(value){
          values.push(value)
        }
      expect(values).to.be.empty()

      deferred.then(undefined, undefined, next)
      expect(values).to.be.empty()

      deferred.notify(1)
      expect(values).to.eql([1])

      deferred.notify('2')
      expect(values).to.eql([1, '2'])

      deferred.notify({a:3, b:4})
      expect(values).to.eql([1, '2', {a:3, b:4}])

      deferred.notify([5, 6])
      expect(values).to.eql([1, '2', {a:3, b:4}, [5, 6]])

      deferred.resolve()
      deferred.notify('should not add after complete')
      expect(values).to.eql([1, '2', {a:3, b:4}, [5, 6]])
    })
    it('should not send next after complete', function(){
      var deferred = _r.when.defer()
        , values = []
        , next = function(value){
          values.push(value)
        }
      expect(values).to.be.empty()

      deferred.then(undefined, undefined, next)
      expect(values).to.be.empty()

      deferred.notify(1)
      expect(values).to.eql([1])

      deferred.notify(2)
      expect(values).to.eql([1, 2])

      deferred.notify(3)
      expect(values).to.eql([1, 2, 3])

      deferred.notify(4)
      expect(values).to.eql([1, 2, 3, 4])

      deferred.resolve()
      deferred.notify(5)
      expect(values).to.eql([1, 2, 3, 4])
    })
    it('should not send next after error', function(){
      var deferred = _r.when.defer()
        , values = []
        , next = function(value){
          values.push(value)
        }
      expect(values).to.be.empty()

      deferred.then(undefined, undefined, next)
      expect(values).to.be.empty()

      deferred.notify(1)
      expect(values).to.eql([1])

      deferred.notify(2)
      expect(values).to.eql([1, 2])

      deferred.notify(3)
      expect(values).to.eql([1, 2, 3])

      deferred.notify(4)
      expect(values).to.eql([1, 2, 3, 4])

      deferred.reject('promise test error')
      expect(values).to.eql([1, 2, 3, 4])

      deferred.notify(5)
      deferred.resolve()
      deferred.reject('promise test error')
      expect(values).to.eql([1, 2, 3, 4])
    })
    it('should subscribe complete', function(){
      var deferred = _r.when.defer()
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

      deferred.then(complete, undefined, next)
      expect(values).to.be.empty()
      expect(finished).to.be(false)

      deferred.notify(1)
      expect(values).to.eql([1])
      expect(finished).to.be(false)

      deferred.notify(2)
      expect(values).to.eql([1, 2])
      expect(finished).to.be(false)

      deferred.resolve()
      expect(finished).to.be(true)

      deferred.notify(3)
      deferred.resolve()
      deferred.reject(new Error())
      expect(values).to.eql([1, 2])
    })
    it('should not complete after error', function(){
      var deferred = _r.when.defer()
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

      deferred.then(complete, undefined, next)
      expect(values).to.be.empty()
      expect(finished).to.be(false)

      deferred.notify(1)
      expect(values).to.eql([1])
      expect(finished).to.be(false)

      deferred.notify(2)
      expect(values).to.eql([1, 2])
      expect(finished).to.be(false)

      deferred.reject(new Error())
      expect(finished).to.be(false)

      deferred.notify(3)
      deferred.resolve()
      deferred.reject(new Error())
      expect(values).to.eql([1, 2])
    })
    it('should subscribe error', function(){
      var deferred = _r.when.defer()
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

      deferred.then(complete, error, next)
      expect(values).to.be.empty()
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.notify(1)
      expect(values).to.eql([1])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.notify(2)
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      var err = new Error()
      deferred.reject(err)
      expect(finished).to.be(false)
      expect(errors).to.eql([err])

      deferred.notify(3)
      deferred.reject(err)
      deferred.resolve()
      expect(values).to.eql([1, 2])
      expect(errors).to.eql([err])
    })
    it('should not error after complete', function(){
      var deferred = _r.when.defer()
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

      deferred.then(complete, error, next)
      expect(values).to.be.empty()
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.notify(1)
      expect(values).to.eql([1])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.notify(2)
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(false)

      deferred.resolve()
      expect(values).to.eql([1, 2])
      expect(errors).to.be.empty()
      expect(finished).to.be(true)

      deferred.reject(new Error())
      expect(finished).to.be(true)
      expect(errors).to.be.empty()

      deferred.notify(3)
      deferred.reject(new Error())
      deferred.resolve()
      expect(values).to.eql([1, 2])
      expect(finished).to.be(true)
      expect(errors).to.be.empty()
    })
    it('should allow multiple subscriptions', function(){
      var deferred = _r.when.defer()
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
        , d1 = deferred.then(complete1, error1, next1)
        , d2 = deferred.then(complete2, error2, next2)

      deferred.notify(1)
      expect(values1).to.eql([1])
      expect(values2).to.eql([1])
      expect(errors1).to.be.empty()
      expect(errors2).to.be.empty()
      expect(finished1).to.be(false)
      expect(finished2).to.be(false)

      deferred.notify(2)
      expect(values1).to.eql([1, 2])
      expect(values2).to.eql([1, 2])
      expect(errors1).to.be.empty()
      expect(errors2).to.be.empty()
      expect(finished1).to.be(false)
      expect(finished2).to.be(false)

      deferred.notify(3)
      expect(values1).to.eql([1, 2, 3])
      expect(values2).to.eql([1, 2, 3])
      expect(errors1).to.be.empty()
      expect(errors2).to.be.empty()
      expect(finished1).to.be(false)
      expect(finished2).to.be(false)

      deferred.resolve()
      deferred.notify(4)
      expect(values1).to.eql([1, 2, 3])
      expect(values2).to.eql([1, 2, 3])
      expect(errors1).to.be.empty()
      expect(errors2).to.be.empty()
      expect(finished1).to.be(true)
      expect(finished2).to.be(true)

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

      cb.promise.then(
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

      cb.promise.then(
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

      cb.resolver.resolve()
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

      cb.promise.then(
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

      cb.resolver.reject(errorToSend)
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

      cb.promise.then(
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

      cb.promise.then(
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

      cb.promise.then(
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

      cb.resolver.resolve()
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

      cb.promise.then(
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

      cb.resolver.reject(errorToSend)
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
