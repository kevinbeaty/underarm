var _ = {};

module.exports = _;

_.clone = require('lodash-node/underscore/objects/clone');
_.each = require('lodash-node/underscore/collections/forEach.js');
_.filter = require('lodash-node/underscore/collections/filter.js');
_.functions = require('lodash-node/underscore/objects/functions');
_.isArray = require('lodash-node/underscore/objects/isArray');
_.isBoolean = require('lodash-node/underscore/objects/isBoolean');
_.isFunction = require('lodash-node/underscore/objects/isFunction');
_.isString = require('lodash-node/underscore/objects/isString');
_.iteratee = require('lodash-node/underscore/functions/createCallback');
_.matches = _.iteratee;
_.property = require('lodash-node/underscore/utilities/property');
