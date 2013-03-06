"use strict";

var _r = exports
  , through = require('through')
  , Underarm = require('./underarm')
  , produce = Underarm.produce

_r.pipe = pipe
function pipe(producer, write, options){
  var stream = through()
  stream.pipe(write, options)
  return produce(
        producer
      , null
      , function(consumer, value){
          stream.queue(value)
          consumer.next(value)
        }
      , function(consumer){
          stream.queue(null)
          consumer.complete()
        }
      , function(consumer, err){
          stream.emit('error', err)
          consumer.error(err)
        });
}

