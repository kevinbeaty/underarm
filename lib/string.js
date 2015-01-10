'use strict'

module.exports = function(_r){
  // String Functions
  // --------------------
  _r.mixin({
    split: require('transduce/string/split'),
    join: join,
    nonEmpty: require('transduce/string/nonEmpty'),
    lines: require('transduce/string/lines'),
    chars: require('transduce/string/chars'),
    words: require('transduce/string/words')
  })

  var _join = require('transduce/string/join')
  function join(separator){
    /*jshint validthis:true */
    _r.resolveSingleValue(this)
    return _join(separator)
  }
}
