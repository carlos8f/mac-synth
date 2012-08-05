#!/usr/bin/env node
var synth = require('../')();

console.log('virtual MIDI instrument open on port "%s"', synth.portName);

process.on('SIGINT', synth.closePort);
process.on('SIGTERM', synth.closePort);