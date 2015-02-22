'use strict'
module.exports = function(_r){
  var _ = _r._ || {}
  _r._ = _
  _.debounce = require('lodash-node/compat/function/debounce')
  _.throttle = require('lodash-node/compat/function/throttle')
}
