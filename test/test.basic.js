describe('basic tests', function(){
  describe('_r', function(){
    it('should have methods', function(){
      expect(_r).to.be.ok()
      expect(_r.identity).to.be.a('function')
      expect(_r.subject).to.be.a('function')
      expect(_r.each).to.be.a('function')
      expect(_r.map).to.be.a('function')
      expect(_r.reduce).to.be.a('function')
      expect(_r.reduceRight).to.be.a('function')
      expect(_r.find).to.be.a('function')
      expect(_r.filter).to.be.a('function')
      expect(_r.reject).to.be.a('function')
      expect(_r.every).to.be.a('function')
      expect(_r.any).to.be.a('function')
      expect(_r.contains).to.be.a('function')
      expect(_r.invoke).to.be.a('function')
      expect(_r.pluck).to.be.a('function')
      expect(_r.max).to.be.a('function')
      expect(_r.min).to.be.a('function')
      expect(_r.sortBy).to.be.a('function')
      expect(_r.sort).to.be.a('function')
      expect(_r.groupBy).to.be.a('function')
      expect(_r.seq).to.be.a('function')
      expect(_r.zipMap).to.be.a('function')
    })

    it('should have aliases', function(){
      expect(_r.each).to.be.equal(_r.forEach)
      expect(_r.map).to.be.equal(_r.collect)
      expect(_r.reduce).to.be.equal(_r.foldl)
      expect(_r.reduce).to.be.equal(_r.inject)
      expect(_r.reduceRight).to.be.equal(_r.foldr)
      expect(_r.find).to.be.equal(_r.detect)
      expect(_r.filter).to.be.equal(_r.select)
      expect(_r.every).to.be.equal(_r.all)
      expect(_r.any).to.be.equal(_r.some)
      expect(_r.include).to.be.equal(_r.contains)
      expect(_r.pluck).to.be.equal(_r.get)
      expect(_r.invoke).to.be.equal(_r.call)
    })

    describe('identity', function(){
      it('should return value', function(){
        expect(_r.identity(1)).to.eql(1)
        expect(_r.identity([1 , 2])).to.eql([1, 2])
      })
    })

    describe('subject', function(){
      it('should have methods', function(){
        var subject = _r.subject()
        expect(subject).to.be.ok()
        expect(subject.subscribe).to.be.a('function')
        expect(subject.next).to.be.a('function')
        expect(subject.error).to.be.a('function')
        expect(subject.complete).to.be.a('function')
      })
      it('should subscribe with disposable', function(){
        var subject = _r.subject()
          , d = subject.subscribe()
        expect(d).to.be.ok()
        expect(d.dispose).to.be.a('function')
        d.dispose()
      })
      it('should subscribe next', function(){
        var subject = _r.subject()
          , values = []
          , next = function(value){
            values.push(value)
          }
        expect(values).to.be.empty()

        subject.subscribe(next)
        expect(values).to.be.empty()

        subject.next(1)
        expect(values).to.eql([1])

        subject.next('2')
        expect(values).to.eql([1, '2'])

        subject.next({a:3, b:4})
        expect(values).to.eql([1, '2', {a:3, b:4}])

        subject.next([5, 6])
        expect(values).to.eql([1, '2', {a:3, b:4}, [5, 6]])

        subject.complete()
        subject.next('should not add after complete')
        expect(values).to.eql([1, '2', {a:3, b:4}, [5, 6]])
      })
      it('should not send next after complete', function(){
        var subject = _r.subject()
          , values = []
          , next = function(value){
            values.push(value)
          }
        expect(values).to.be.empty()

        subject.subscribe(next)
        expect(values).to.be.empty()

        subject.next(1)
        expect(values).to.eql([1])

        subject.next(2)
        expect(values).to.eql([1, 2])

        subject.next(3)
        expect(values).to.eql([1, 2, 3])

        subject.next(4)
        expect(values).to.eql([1, 2, 3, 4])

        subject.complete()
        subject.next(5)
        expect(values).to.eql([1, 2, 3, 4])
      })
      it('should not send next after error', function(){
        var subject = _r.subject()
          , values = []
          , next = function(value){
            values.push(value)
          }
        expect(values).to.be.empty()

        subject.subscribe(next)
        expect(values).to.be.empty()

        subject.next(1)
        expect(values).to.eql([1])

        subject.next(2)
        expect(values).to.eql([1, 2])

        subject.next(3)
        expect(values).to.eql([1, 2, 3])

        subject.next(4)
        expect(values).to.eql([1, 2, 3, 4])

        subject.error(new Error)
        expect(values).to.eql([1, 2, 3, 4])

        subject.next(5)
        subject.complete()
        subject.error(new Error)
        expect(values).to.eql([1, 2, 3, 4])
      })
      it('should not send next after dispose', function(){
        var subject = _r.subject()
          , values = []
          , next = function(value){
            values.push(value)
          }
          , d = subject.subscribe(next)

        expect(values).to.be.empty()

        subject.next(1)
        expect(values).to.eql([1])

        subject.next(2)
        expect(values).to.eql([1, 2])

        subject.next(3)
        expect(values).to.eql([1, 2, 3])

        subject.next(4)
        expect(values).to.eql([1, 2, 3, 4])

        d.dispose()
        expect(values).to.eql([1, 2, 3, 4])

        subject.next(5)
        subject.complete()
        subject.error(new Error)
        expect(values).to.eql([1, 2, 3, 4])
      })
      it('should subscribe complete', function(){
        var subject = _r.subject()
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

        subject.subscribe(next, complete)
        expect(values).to.be.empty()
        expect(finished).to.be(false)

        subject.next(1)
        expect(values).to.eql([1])
        expect(finished).to.be(false)

        subject.next(2)
        expect(values).to.eql([1, 2])
        expect(finished).to.be(false)

        subject.complete()
        expect(finished).to.be(true)

        subject.next(3)
        subject.complete()
        subject.error(new Error)
        expect(values).to.eql([1, 2])
      })
      it('should not complete after error', function(){
        var subject = _r.subject()
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

        subject.subscribe(next, complete)
        expect(values).to.be.empty()
        expect(finished).to.be(false)

        subject.next(1)
        expect(values).to.eql([1])
        expect(finished).to.be(false)

        subject.next(2)
        expect(values).to.eql([1, 2])
        expect(finished).to.be(false)

        subject.error(new Error)
        expect(finished).to.be(false)

        subject.next(3)
        subject.complete()
        subject.error(new Error)
        expect(values).to.eql([1, 2])
      })
      it('should not complete after dispose', function(){
        var subject = _r.subject()
          , values = []
          , finished = false
          , next = function(value){
            values.push(value)
          }
          , complete = function(){
            finished = true
          }
          , d = subject.subscribe(next, complete)

        expect(values).to.be.empty()
        expect(finished).to.be(false)

        expect(values).to.be.empty()
        expect(finished).to.be(false)

        subject.next(1)
        expect(values).to.eql([1])
        expect(finished).to.be(false)

        subject.next(2)
        expect(values).to.eql([1, 2])
        expect(finished).to.be(false)

        d.dispose()
        expect(finished).to.be(false)

        subject.next(3)
        subject.complete()
        subject.error(new Error)
        expect(values).to.eql([1, 2])
      })
      it('should subscribe error', function(){
        var subject = _r.subject()
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

        subject.subscribe(next, complete, error)
        expect(values).to.be.empty()
        expect(errors).to.be.empty()
        expect(finished).to.be(false)

        subject.next(1)
        expect(values).to.eql([1])
        expect(errors).to.be.empty()
        expect(finished).to.be(false)

        subject.next(2)
        expect(values).to.eql([1, 2])
        expect(errors).to.be.empty()
        expect(finished).to.be(false)

        var err = new Error
        subject.error(err)
        expect(finished).to.be(false)
        expect(errors).to.eql([err])

        subject.next(3)
        subject.error(err)
        subject.complete()
        expect(values).to.eql([1, 2])
        expect(errors).to.eql([err])
      })
      it('should not error after complete', function(){
        var subject = _r.subject()
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

        subject.subscribe(next, complete, error)
        expect(values).to.be.empty()
        expect(errors).to.be.empty()
        expect(finished).to.be(false)

        subject.next(1)
        expect(values).to.eql([1])
        expect(errors).to.be.empty()
        expect(finished).to.be(false)

        subject.next(2)
        expect(values).to.eql([1, 2])
        expect(errors).to.be.empty()
        expect(finished).to.be(false)

        subject.complete()
        expect(values).to.eql([1, 2])
        expect(errors).to.be.empty()
        expect(finished).to.be(true)

        subject.error(new Error)
        expect(finished).to.be(true)
        expect(errors).to.be.empty()

        subject.next(3)
        subject.error(new Error)
        subject.complete()
        expect(values).to.eql([1, 2])
        expect(finished).to.be(true)
        expect(errors).to.be.empty()
      })
      it('should not error after dispose', function(){
        var subject = _r.subject()
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
          , d = subject.subscribe(next, complete, error)

        expect(values).to.be.empty()
        expect(errors).to.be.empty()
        expect(finished).to.be(false)

        subject.next(1)
        expect(values).to.eql([1])
        expect(errors).to.be.empty()
        expect(finished).to.be(false)

        subject.next(2)
        expect(values).to.eql([1, 2])
        expect(errors).to.be.empty()
        expect(finished).to.be(false)

        d.dispose()
        expect(values).to.eql([1, 2])
        expect(errors).to.be.empty()
        expect(finished).to.be(false)

        subject.error(new Error)
        expect(finished).to.be(false)
        expect(errors).to.be.empty()

        subject.next(3)
        subject.error(new Error)
        subject.complete()
        expect(values).to.eql([1, 2])
        expect(finished).to.be(false)
        expect(errors).to.be.empty()
      })
      it('should allow multiple subscriptions', function(){
        var subject = _r.subject()
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
          , d1 = subject.subscribe(next1, complete1, error1)
          , d2 = subject.subscribe(next2, complete2, error2)

        subject.next(1)
        expect(values1).to.eql([1])
        expect(values2).to.eql([1])
        expect(errors1).to.be.empty()
        expect(errors2).to.be.empty()
        expect(finished1).to.be(false)
        expect(finished2).to.be(false)

        subject.next(2)
        expect(values1).to.eql([1, 2])
        expect(values2).to.eql([1, 2])
        expect(errors1).to.be.empty()
        expect(errors2).to.be.empty()
        expect(finished1).to.be(false)
        expect(finished2).to.be(false)

        d2.dispose()

        subject.next(3)
        expect(values1).to.eql([1, 2, 3])
        expect(values2).to.eql([1, 2])
        expect(errors1).to.be.empty()
        expect(errors2).to.be.empty()
        expect(finished1).to.be(false)
        expect(finished2).to.be(false)
        
        subject.complete()
        subject.next(4)
        expect(values1).to.eql([1, 2, 3])
        expect(values2).to.eql([1, 2])
        expect(errors1).to.be.empty()
        expect(errors2).to.be.empty()
        expect(finished1).to.be(true)
        expect(finished2).to.be(false)

      })
    })
  })
})
