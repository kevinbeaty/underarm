## Underarm
[![Build Status](https://secure.travis-ci.org/kevinbeaty/underarm.png)](http://travis-ci.org/kevinbeaty/underarm)

Reactive Programming inspired by [underscore](http://underscorejs.org) and
[Reactive Cocoa](https://github.com/github/ReactiveCocoa).
It is still experimental and the API is subject to change. Feeback is welcome.

### Quick Tour

Using arrays and plain objects feels like underscore.

```javascript
var values = []
  , indeces = []
  , lists = []

// Functional
_r.each([1, 2], function(val, index, list){
    values.push(val)
    indeces.push(index)
    lists.push(list.slice())
  })

// Implicitly chained
_r([1, 2, 3, 4])
  .map(function(val){return val*2})
  .map(function(val){return val*3})
  .each(function(val, index, list){
    values.push(val)
    indeces.push(index)
    lists.push(list.slice())
  })

_r([{a:1, b:2, c:3}, {a:2, b:3, c:4}])
  .find(function(val){return val.a === 2})
  .each(function(val, key, list){result = list})
```

Any underarm chain is a promise, and deferreds can be
created explicitly.

```javascript
var deferred = _r.deferred()
  , resolve = _r.deferred()

deferred.promise
  .then(resolve.promise)
  .then(function(result){
      expect(result).to.be.eql(43)
    })

_r(43) // sends 43 as single value
  .delay(10)
  .first()
  .then(function(val){
    resolve.resolve(val)
})
```

Iterators can be RegExps

```javascript
_r(['bob is a cat', '', 'fred is a dog', 'nothing'])
  .map(/(\w+) is a (\w+)/g)
  .map(function(match){
    return match && [match[1], match[2]]})
  .subscribe(function(val){values.push(val)})

expect(values).to.be.eql([
  ['bob', 'cat'], null, ['fred', 'dog'], null])

_r(['bob', 'frank', 'barb', 'fred', 'ed'])
  .filter(/ed$/)
  .then(function(val){result = val})
expect(result).to.be.eql(['fred', 'ed'])
```


Chains can be detached and reused.

```javascript
var values = []
var reduce = _r().reduce(
  function(memo, val){return memo / val})

reduce
  .attach([1, 2, 3, 4])
  .then(function(val){values.push(val)})

expect(values).to.be.eql([1 / 2 / 3 / 4])

values = []
reduce
  .attach([10, 9, 8, 7])
  .then(function(val){values.push(val)})
expect(values).to.be.eql([10 / 9 / 8 / 7])
```

Detached chains can be iterators (remember all chains are promises)

```javascript
var deferred = _r.deferred()
  , result = 0

deferred.promise
  .then(_r().map(function(x){return x*2}).first())
  .then(function(val){result = val})
deferred.resolve(1)

expect(result).to.be.eql(2)

_r([1, 2, 3, 4])
  .map(_r().contains(3))
  .subscribe(function(val){values.push(val)})

expect(values).to.be.eql([false, false, true, false])

_r.chain([1, 2, 3, 4])
  .map([
      _r().find(function(x){return x < 3})
    , _r().contains(3)])
  .subscribe(function(val){values.push(val)})

expect(values).to.be.eql([
    [1, false]
  , [2, false]
  , [undefined, true]
  , [undefined, false]])
```


Putting it all together

```javascript
var imageLoader = _r()
  .seq() // values of array or [key, val] of object
  .map(function(character){
    return {
        name: character[0]
      , src: character[1]
      , loadImage: function(){
          var self = this
            , defer = _r.deferred()
          self.image = document.createElement('img')
          self.image.onload = function(){
            defer.resolve(self)
          }
          self.image.src = self.src
          return defer.promise
        }
    }})
  .call('loadImage') // notice this returns a promise
  .pick('name', 'image')

function loadImages(images){
  return imageLoader.attach(images)
}

loadImages({
      bob:'http://somewhere/bob.png'
    , fred:'http://somewhere/fred.png'})
  .then(callback, errback, progback)
```
