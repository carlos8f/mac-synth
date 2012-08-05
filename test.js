var synth = require('./')();

process.on('exit', function() {
  synth.closePort();
});