var spawn = require('child_process').spawn
  , midi = require('midi')
  , resolve = require('path').resolve
  , channel = 0

var MESSAGE_CONTROLCHANGE = 0xB;
var MESSAGE_PROGRAMCHANGE = 0xC;
var MESSAGE_MSBCONTROL = 0;
var MESSAGE_LSBCONTROL = 32;
var MESSAGE_NOTEON = 0x9;

function messageStatus(code) {
  return code << 4 | channel;
}

var instrument = spawn(resolve(__dirname, '../bin/instrument.js'))
  , targePortName

instrument.stdout.once('data', function(chunk) {
  targetPortName = chunk.toString().match(/"(mac\-synth\/.*?)"/)[1];
  startTest();
});
instrument.stdout.pipe(process.stdout);

function startTest() {
  var output = new midi.output()
    , portCount = output.getPortCount()
    , portFound = false

  for (var i = 0; i < portCount; i++) {
    if (output.getPortName(i) === targetPortName) {
      console.log('found "%s" as port %d', targetPortName, i);
      output.openPort(i);
      portFound = true;
      break;
    }
  }

  if (!portFound) {
    console.error('virtual port not found!');
    instrument.kill();
    process.exit(1);
  }

  function send(status, data1, data2) {
    var message = [messageStatus(status), data1, data2];
    console.log('sending: ' + message);
    output.sendMessage(message);
  }

  // Change to patch 0 (grand piano)
  send(MESSAGE_CONTROLCHANGE, MESSAGE_MSBCONTROL, 0);
  send(MESSAGE_PROGRAMCHANGE, 0, 0);

  var noteNum = 59
    , onVelocity = 127
    , noteLength = 200

  function noteOn() {
    send(MESSAGE_NOTEON, noteNum, onVelocity);
  }
  function noteOff() {
    send(MESSAGE_NOTEON, noteNum, 0);
  }

  setTimeout(function nextNote() {
    noteOff();
    noteNum++;

    if (noteNum < 71) {
      noteOn();
      setTimeout(nextNote, noteLength)
    }
    else {
      noteOn();
      // Hold the last note
      setTimeout(function() {
        noteOff();
        output.closePort();
        instrument.kill();
        console.log('done!');
      }, 2000);
    }
  }, noteLength);
}