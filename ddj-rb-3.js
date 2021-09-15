var DDJRB = {};

DDJRB.deckShift = {"[Channel1]":false,
                   "[Channel2]":false};

DDJRB.ledMap = {"deck_load": {
                  "[Channel1]":{
                    "base": {
                        "channel":0x96,
                        "status":0x46},
                    "shift": {
                        "channel":0x96,
                        "status":0x58}
                    },
                    "[Channel2]": {
                      "base": {
                        "channel":0x96,
                        "status":0x47},
                      "shift": {
                        "channel":0x96,
                        "status":0x59}
                    }},
                  "deck_play": {
                    "[Channel1]":{
                      "base":{
                        "channel":0x90,
                        "status":0x0B},
                      "shift":{
                        "channel":0x90,
                        "status":0x47}
                      },
                    "[Channel2]":{
                      "base":{
                        "channel":0x91,
                        "status":0x0B},
                      "shift":{
                        "channel":0x91,
                        "status":0x47}
                      }},
                    "deck_cue":{
                      "[Channel1]":{
                        "base":{
                          "channel":0x90,
                          "status":0x0C},
                        "shift":{
                          "channel":0x90,
                          "status":0x48}
                        },
                      "[Channel2]":{
                        "base":{
                          "channel":0x91,
                          "status":0x0C},
                        "shift":{
                          "channel":0x91,
                          "status":0x48}
                      }},
                    "deck_sync":{
                      "[Channel]":{
                        "base":{
                          "channel":0x90,
                          "status":0x58},
                        "shift":{
                          "channel": 0x90,
                          "status": 0x5C}
                        },
                      "[Channel2]":{
                        "base":{
                          "channel": 0x91,
                          "status": 0x58},
                        "shift":{
                          "channel": 0x91,
                          "status": 0x5C}
                      }},
                    "deck_loop_in"
                    "deck_loop_out"
                    "deck_shift"
                    "deck_headphone_cue"
                    "headphone_master"
                    "deck_fx_toggle"
                    "deck_fx_beat_down"
                    "deck_fx_beat_up"
                    "deck_menu_hot_cue":{
                      "[Channel1]":{
                        "base":{
                          "channel":0x90,
                          "status":0x1B},
                        "shift":{
                          "channel":0x90,
                          "status":0x69}
                        },
                      "[Channel2]":{
                        "base":{
                          "channel":0x91,
                          "status":0x1B},
                        "shift":{
                          "channel"0x91,
                          "status":0x69}
                      }},
                    "deck_menu_pad_fx_one":{
                      "[Channel1]":{
                        "base":{
                          "channel":0x90,
                          "status":0x1E},
                        "shift":{
                          "channel":0x90,
                          "status":0x6B},
                        "[Channel2]":{
                          "base":{
                            "channel":0x91,
                            "status":0x1E},
                          "shift":{
                            "channel":0x91,
                            "status":6B}
                      }},
                    "deck_menu_slicer"
                    "deck_menu_sampler"

DDJRB.init = function(id, debugging) {
  //engine.softTakeover(string group, string key, bool enable);
}

DDJRB.deckscratchtouch = function(channel, control, value, status, group) {
  var deck = channel+1;

  var numIntervals = 1200;
  var rpm = 33+1/3;
  var alpha = 1/64;
  var beta = alpha/32;
  var ramp = true;

  if (value==127) {
    engine.scratchEnable(deck, numIntervals, rpm, alpha, beta, ramp);
  } else {
    engine.scratchDisable(deck, ramp);
  }
}

DDJRB.deckscratch = function(channel, control, value, status, group) {
  var deck = channel+1;
  var newValue = value - 64;

  if (engine.isScratching(deck)) {
    engine.scratchTick(deck, newValue);
  } else {
    print("jog");
    print(deck);
    engine.setValue(group, 'jog', newValue);
  }
}

DDJRB.deckscratchseek = function(channel, control, value, status, group) {
  var deck = channel+1;
  var outValue = DDJRB.map(value-64, -4, 4, -100, 100);
  print(value);
  if (value==64) {
    print(value);
  }

  engine.setValue(group, 'rateSearch', outValue);
  engine.setValue(group, 'rateSearch', 0);
}

DDJRB.libraryseek = function(channel, control, value, status, group) {
  if (value == 127) {
    //up
    engine.setValue(group, 'MoveUp', 1);
  } else {
    engine.setValue(group, 'MoveDown', 1);
  }

}

DDJRB.rate = function(channel, control, value, status, group) {
  var out = DDJRB.map(value, 0,127,1,-1);
  engine.setValue(group, 'rate', out);

}

// DDJRB.keylock = function(channel, control, value, status, group) {
//   engine.setValue(group, 'keylock', value);
// }

DDJRB.syncMaster = function(channel, control, value, status, group) {
  if (value==127) {
    var masterValue = engine.getValue(group, 'sync_master');
    var out = 0;
    if (masterValue == 0) {
      out = 1;
    }
    engine.setValue(group, 'sync_master', out);
  }
}

var syncCallback = function(value, group, control) {
  var out = 0x00;
  if (value == 1) {
    out = 0x7F;
  }
  var chan = 0x90;
  if (group == "[Channel2]") {
    chan = 0x91;
  }
  midi.sendShortMsg(chan, 0x58, out);

}
var deckOneSync = engine.makeConnection('[Channel1]', 'sync_enabled', syncCallback);
var deckTwoSync = engine.makeConnection('[Channel2]', 'sync_enabled', syncCallback);

var syncMasterCallback = function(value, group, control) {
  var beat = engine.getValue(group, 'beat_active');
  print(value);
}

var deckOneSyncMaster = engine.makeConnection('[Channel1]', 'sync_master', syncMasterCallback);
var deckTwoSyncMaster = engine.makeConnection('[Channel2]', 'sync_master', syncMasterCallback);

var pflCallback = function(value, group, control) {
  var out = 0x00;
  if (value == 1) {
    out = 0x7F;
  }
  var chan = 0x90;
  if (group == "[Channel2]") {
    chan = 0x91;
  }

  midi.sendShortMsg(chan, 0x54, out);
}
var deckOnePfl = engine.makeConnection('[Channel1]', 'pfl', pflCallback);
var deckTwoPfl = engine.makeConnection('[Channel2]', 'pfl', pflCallback);

var vuMeterCallback = function(value, group, control) {
  var out = DDJRB.map(value, 0, 1, 0, 127);
  var chan = 0xB0;
  if (group == '[Channel2]') {
    chan = 0xB1;
  }
  midi.sendShortMsg(chan, 0x02, out);
}

var deckOneVUMeter = engine.makeConnection('[Channel1]', 'VuMeter', vuMeterCallback);
var deckTwoVUMeter = engine.makeConnection('[Channel2]', 'VuMeter', vuMeterCallback);

var playCallback = function(value, group, control) {
  var out = 0x00;
  var chan = 0x90;
  if (value==1) {
    out = 0x7F;
  }
  if (group == "[Channel2]") {
    chan = 0x91;
  }
  midi.sendShortMsg(chan, 0x0B, out);
}

var deckOnePlay = engine.makeConnection("[Channel1]", 'play', playCallback);
var deckTwoPlay = engine.makeConnection("[Channel2]", 'play', playCallback);

var cueCallback = function(value, group, control) {
  var out = 0x00;
  var chan = 0x90;
  if (value==1) {
    out = 0x7F;
  }
  if (group == "[Channel2]") {
    chan = 0x91;
  }
  midi.sendShortMsg(chan, 0x0C, out);
}

var deckOneCue = engine.makeConnection("[Channel1]", 'cue_indicator', cueCallback);
var deckTwoCue = engine.makeConnection("[Channel2]", 'cue_indicator', cueCallback);

var loopInCallback = function(value, group, control) {
  var out = 0x00;
  var chan = 0x90;
  if (value==1) {
    out = 0x7F;
  }
  if (group == "[Channel2]") {
    chan = 0x91;
  }
  midi.sendShortMsg(chan, 0x10, out);
}

var deckOneLoopIn = engine.makeConnection('[Channel1]', 'loop_in', loopInCallback);
var deckTwoLoopIn = engine.makeConnection('[Channel2]', 'loop_in', loopInCallback);

var loopOutCallback = function(value, group, control) {
  var out = 0x00;
  var chan = 0x90;
  if (value==1) {
    out = 0x7F;
  }
  if (group == "[Channel2]") {
    chan = 0x91;
  }
  midi.sendShortMsg(chan, 0x11, out);
}

var deckOneLoopOut = engine.makeConnection('[Channel1]', 'loop_out', loopOutCallback);
var deckTwoLoopOut = engine.makeConnection('[Channel2]', 'loop_out', loopOutCallback);

var beatActiveCallback = function(value, group, control) {
  var chan = 0x90;
  if (group == '[Channel2]') {
    chan = 0x91;
  }

  var loopEnabled = engine.getValue(group, 'loop_enabled');
  if (loopEnabled == 1) {
    print("loop");
    print(value);
    var loopOutput = 0x00;
    if (value == 1) {
      loopOutput = 0x7F;
    }
    midi.sendShortMsg(chan, 0x10, loopOutput);
    midi.sendShortMsg(chan, 0x11, loopOutput);
  }
}

var deckOneBeatActive = engine.makeConnection('[Channel1]', 'beat_active', beatActiveCallback);
var deckTwoBeatActive = engine.makeConnection('[Channel2]', 'beat_active', beatActiveCallback);

DDJRB.deckOneShift = false;
DDJRB.deckTwoShift = false;



DDJRB.shift = function(channel, control, value, status, group) {
  DDJRB.deckShift[group] = !DDJRB.deckShift[group];
}

DDJRB.loopIn = function(channel, control, value, status, group) {
  engine.setValue(group, 'loop_in', DDJRB.map(value, 0,127, 0,1));
}

DDJRB.loopOut = function(channel, control, value, status, group) {
  engine.setValue(group, 'loop_out', DDJRB.map(value, 0,127, 0,1));
}

DDJRB.beatLoop = function(channel, control, value, status, group) {
  var opGroup = "[Channel2]";
  if (group == opGroup) {
    opGroup = "[Channel1]";
  }
  if (DDJRB.deckShift[opGroup] == false) {
    engine.setValue(group, 'beatloop_activate', DDJRB.map(value, 0,127, 0,1));
  } else {
    engine.setValue(group, 'beatjump_backward', DDJRB.map(value, 0,127, 0,1));
  }
}

DDJRB.reloopToggle = function(channel, control, value, status, group) {
  var opGroup = "[Channel2]";
  if (group == opGroup) {
    print("other");
    opGroup = "[Channel1]";
  }
  if (DDJRB.deckShift[opGroup] == false) {
    engine.setValue(group, 'reloop_toggle', DDJRB.map(value, 0,127, 0,1));
  } else {
    engine.setValue(group, 'beatjump_forward', DDJRB.map(value, 0,127, 0,1));
  }
}



DDJRB.map = function(value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


DDJRB.shutdown = function() {
  for (var i = 0;i <= 40;i++) {
    midi.sendShortMsg(0x90, i, 0x00);
  }
}
