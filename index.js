var driver = require('bindings')('macsynth')
  , midi = require('midi')
  , pkgInfo = require('./package.json')
  , idgen = require('idgen')
  , format = require('util').format

function macsynth() {
  var input = new midi.input()
    , synth = new driver.synth()
    , portDesc = format('%s/%s (#%s)', pkgInfo.name, pkgInfo.version, idgen())

  input.ignoreTypes(false, false, false);
  input.on('message', function(deltaTime, message) {
    synth.send(message);
  });
  input.openVirtualPort(portDesc);
  return input;
}

module.exports = macsynth;