var undef,
    string = require('transduce-string');

module.exports = function(_r){
  // String Functions
  // --------------------
  _r.split = string.split;
  _r.join = function(separator){
    _r.resolveSingleValue(this);
    return string.join(separator);
  }
  _r.nonEmpty = string.nonEmpty;
  _r.lines = string.lines;
  _r.chars = string.chars;
  _r.words = string.words;
}
