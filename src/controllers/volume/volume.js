import mitt from 'mitt'

const emitter = mitt()


/* [::::::: Volume meter :::::::] */

let audioContext = null;
let meter = null;
let canvasContext = null;
const WIDTH=500;
const HEIGHT=50;
let rafID = null;

function start() {

    // grab our canvas
/*  canvasContext = document.querySelector('.game-gui').getContext("2d"); */

    // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
  
    // grab an audio context
    audioContext = new AudioContext();

    // Attempt to get audio input
    try {
        // monkeypatch getUserMedia
        navigator.getUserMedia = 
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia;

        // ask for an audio input
        navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, didntGetStream); // if the user accepts, launch (callback) gotStream function
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}


function didntGetStream() {
    alert('Stream generation failed.');
}


let mediaStreamSource = null;

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);

    // Update volume in real-time
    getVolume();
}


function getVolume()  {
    // Print the actual volume
    /*console.log(meter.volume);*/
    // Update volume in real-time
    rafID = window.requestAnimationFrame(getVolume);
    // Return the volume value
    return meter.volume
}


/* [::::::: createAudioMeter:::::::] */


function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
  let processor = audioContext.createScriptProcessor(512);
  processor.onaudioprocess = volumeAudioProcess;
  processor.clipping = false;
  processor.lastClip = 0;
  processor.volume = 0;
  processor.clipLevel = clipLevel || 0.98;
  processor.averaging = averaging || 0.95;
  processor.clipLag = clipLag || 750;

  // this will have no effect, since we don't copy the input to the output,
  // but works around a current Chrome bug.
  processor.connect(audioContext.destination);

  processor.checkClipping =
    function(){
      if (!this.clipping)
        return false;
      if ((this.lastClip + this.clipLag) < window.performance.now())
        this.clipping = false;
      return this.clipping;
    };

  processor.shutdown =
    function(){
      this.disconnect();
      this.onaudioprocess = null;
    };

  return processor;
}

// Doing the hidden work for calculating audio volume
function volumeAudioProcess( event ) {
  let buf = event.inputBuffer.getChannelData(0);
    let bufLength = buf.length;
  let sum = 0;
    let x;

  // Do a root-mean-square on the samples: sum up the squares...
    for (var i=0; i<bufLength; i++) {
      x = buf[i];
      if (Math.abs(x)>=this.clipLevel) {
        this.clipping = true;
        this.lastClip = window.performance.now();
      }
      sum += x * x;
    }

    // ... then take the square root of the sum.
    let rms =  Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume*this.averaging);
}

export default {start, getVolume}