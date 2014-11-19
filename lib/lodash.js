"use strict";

module.exports = function(_r){
  var _ = {};
  _r._ = _;
  _.clone = require('lodash-node/underscore/objects/clone');
  _.isString = require('lodash-node/underscore/objects/isString');
  _.isBoolean = require('lodash-node/underscore/objects/isBoolean');
  _.iteratee = require('lodash-node/underscore/functions/createCallback');
  _.matches = _.iteratee;
  _.property = require('lodash-node/underscore/utilities/property');
};
