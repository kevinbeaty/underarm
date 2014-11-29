"use strict";

module.exports = function(_r){
  var _ = {};
  _r._ = _;
  _.iteratee = require('lodash-node/underscore/functions/createCallback');
  _.matches = _.iteratee;
  _.property = require('lodash-node/underscore/utilities/property');
};
