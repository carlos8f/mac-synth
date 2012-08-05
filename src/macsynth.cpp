#include <node.h>
#include <v8.h>
#include <CoreServices/CoreServices.h> //for file stuff
#include <AudioUnit/AudioUnit.h>
#include <AudioToolbox/AudioToolbox.h> //for AUGraph
#include <unistd.h> // used for usleep...

using namespace v8;
using namespace node;

// some MIDI constants:
enum {
  kMidiMessage_ControlChange    = 0xB,
  kMidiMessage_ProgramChange    = 0xC,
  kMidiMessage_BankMSBControl   = 0,
  kMidiMessage_BankLSBControl   = 32,
  kMidiMessage_NoteOn           = 0x9
};

// This call creates the Graph and the Synth unit...
OSStatus  CreateAUGraph (AUGraph &outGraph, AudioUnit &outSynth)
{
  OSStatus result;
  //create the nodes of the graph
  AUNode synthNode, outNode;

  require_noerr (result = NewAUGraph (&outGraph), home);
  
  AudioComponentDescription cd;
  cd.componentManufacturer = kAudioUnitManufacturer_Apple;
  cd.componentFlags = 0;
  cd.componentFlagsMask = 0;
  cd.componentType = kAudioUnitType_MusicDevice;
  cd.componentSubType = kAudioUnitSubType_DLSSynth;
  require_noerr (result = AUGraphAddNode (outGraph, &cd, &synthNode), home);

  cd.componentType = kAudioUnitType_Output;
  cd.componentSubType = kAudioUnitSubType_DefaultOutput;
  require_noerr (result = AUGraphAddNode (outGraph, &cd, &outNode), home);

  require_noerr (result = AUGraphOpen (outGraph), home);
  require_noerr (result = AUGraphConnectNodeInput (outGraph, synthNode, 0, outNode, 0), home);
  require_noerr (result = AUGraphNodeInfo(outGraph, synthNode, 0, &outSynth), home);

home:
  return result;
}

Handle<Value> Play(const Arguments& args) {
  HandleScope scope;

  AUGraph graph = 0;
  AudioUnit synthUnit;
  OSStatus result;
  
  UInt8 midiChannelInUse = 0; //we're using midi channel 1...
  
  require_noerr (result = CreateAUGraph (graph, synthUnit), home);

  // ok we're set up to go - initialize and start the graph
  require_noerr (result = AUGraphInitialize (graph), home);

    //set our bank
  require_noerr (result = MusicDeviceMIDIEvent(synthUnit, 
                kMidiMessage_ControlChange << 4 | midiChannelInUse, 
                kMidiMessage_BankMSBControl, 0,
                0/*sample offset*/), home);

  require_noerr (result = MusicDeviceMIDIEvent(synthUnit, 
                kMidiMessage_ProgramChange << 4 | midiChannelInUse, 
                0/*prog change num*/, 0,
                0/*sample offset*/), home);
  
  require_noerr (result = AUGraphStart (graph), home);

  // we're going to play an octave of MIDI notes: one a second
  for (int i = 0; i < 13; i++) {
    UInt32 noteNum = i + 60;
    UInt32 onVelocity = 127;
    UInt32 noteOnCommand =  kMidiMessage_NoteOn << 4 | midiChannelInUse;
    
    require_noerr (result = MusicDeviceMIDIEvent(synthUnit, noteOnCommand, noteNum, onVelocity, 0), home);
    
      // sleep for a second
    usleep (1 * 1000 * 1000);

    require_noerr (result = MusicDeviceMIDIEvent(synthUnit, noteOnCommand, noteNum, 0, 0), home);
  }
  
  // ok we're done now

home:
  if (graph) {
    AUGraphStop (graph); // stop playback - AUGraphDispose will do that for us but just showing you what to do
    DisposeAUGraph (graph);
  }

  return scope.Close(Undefined());
}

void init(Handle<Object> target) {
  NODE_SET_METHOD(target, "play", Play);
}

NODE_MODULE(macsynth, init);
