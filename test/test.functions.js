"use strict";
/*global describe, it, expect, _r */
describe('functions tests', function(){
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
        , deferred = _r.when.defer()
        , completed = false
      _r(deferred.promise)
        .tap(function(val){tapped.push(val)}, function(){completed = true})
        .then(function(val){values = val})

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)

      deferred.notify(1)
      expected.push(1)

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)

      deferred.notify(2)
      deferred.notify(3)
      expected.push(2)
      expected.push(3)

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)

      deferred.resolve()

      expect(tapped).to.eql(expected)
      expect(values).to.eql(tapped)
      expect(completed).to.be(true)

      deferred.notify(4)
      deferred.notify(5)
      deferred.reject('err')

      expect(tapped).to.eql(expected)
      expect(values).to.eql(tapped)
      expect(completed).to.be(true)
    })
    it('should tap next, error', function(){
      var values = []
        , tapped = []
        , expected = []
        , deferred = _r.when.defer()
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

      deferred.notify(1)
      expected.push(1)

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)
      expect(error).to.be(null)

      deferred.notify(2)
      deferred.notify(3)
      expected.push(2)
      expected.push(3)

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)
      expect(error).to.be(null)

      deferred.reject(errorToSend)

      expect(tapped).to.eql(expected)
      expect(values).to.eql([])
      expect(completed).to.be(false)
      expect(error).to.eql(errorToSend)

      deferred.notify(4)
      deferred.notify(5)
      deferred.resolve()

      expect(values).to.eql([])
      expect(tapped).to.eql(expected)
      expect(completed).to.be(false)
      expect(error).to.eql(errorToSend)
    })
  })
  describe('defer', function(){
    it('should defer next', function(done){
      var step = 0
        , deferred = _r.when.defer()
      _r(deferred.promise)
        .defer()
        .subscribe(function(val){
            expect(step).to.eql(1)
            done()
          })
      deferred.notify(1)
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
        , deferred = _r.when.defer()
      _r(deferred.promise)
        .defer()
        .then(null, function(err){
            expect(step).to.eql(1)
            done()
          })
      deferred.reject('expected error defer test')
      step++
    })
  })
  describe('delay', function(){
    it('should delay next', function(done){
      var step = 0
        , deferred = _r.when.defer()
      _r(deferred.promise)
        .delay(20)
        .subscribe(function(val){
            expect(step).to.eql(1)
            done()
          })
      deferred.notify(1)
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
        , deferred = _r.when.defer()
      _r(deferred.promise)
        .delay(20)
        .then(null, function(err){
            expect(step).to.eql(1)
            done()
          })
      deferred.reject('expected error delay test')
      setTimeout(function(){step++}, 5)
    })
  })
  describe('debounce', function(){
    it('should debounce trailing next', function(done){
      var deferred = _r.when.defer()
      _r(deferred.promise)
        .delay(1)
        .debounce(10)
        .subscribe(function(val){
            expect(val).to.eql(3)
            done()
          })
      deferred.notify(1)
      deferred.notify(2)
      deferred.notify(3)

    })
    it('should debounce leading next', function(done){
      var deferred = _r.when.defer()
      _r(deferred.promise)
        .delay(1)
        .debounce(10, true)
        .subscribe(function(val){
            expect(val).to.eql(1)
            done()
          })
      deferred.notify(1)
      deferred.notify(2)
      deferred.notify(3)

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
      var deferred = _r.when.defer()
        , values = []
      _r(deferred.promise)
        .delay(1)
        .debounce(10)
        .then(
            null
          , function(err){
              expect(values).to.eql([])
              done()
            }
          , function(val){values.push(val)})
      deferred.reject('expected error testing debounce')
    })
    it('should debounce leading error', function(done){
      var deferred = _r.when.defer()
        , values = []
      _r(deferred.promise)
        .delay(1)
        .debounce(10, true)
        .then(
            null
          , function(err){
              expect(values).to.eql([])
              done()
            }
          , function(val){values.push(val)})
      deferred.reject('expected error testing debounce')
    })
  })
})
