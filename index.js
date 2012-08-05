var driver = require('bindings')('synth')
  , midi = require('midi')
  , pkgInfo = require('./package.json')
  , idgen = require('idgen')
  , format = require('util').format

function macsynth() {
  var input = new midi.input()
    , synth = new driver.synth()
    , portName = format('%s/%s (#%s)', pkgInfo.name, pkgInfo.version, idgen())

  input.ignoreTypes(false, false, false);
  input.on('message', function(deltaTime, message) {
    for (var i = 0; i < 3; i++) {
      if (typeof message[i] === 'undefined') {
        message[i] = 0;
      }
    }
    synth.send(message);
  });
  input.openVirtualPort(portName);
  input.portName = portName;
  return input;
}

module.exports = macsynth;