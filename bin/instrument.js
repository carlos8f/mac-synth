#!/usr/bin/env node
var argv = require('optimist')
    .alias('v', 'verbose')
    .argv
  , synth = require('../')()

console.log('virtual MIDI instrument open on port "%s"', synth.portName);

if (argv.verbose) {
  synth.on('message', function(deltaTime, message) {
    console.log('received message: ' + message);
  });
}