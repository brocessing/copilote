console.log(`It's working !`)

const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

// Grammar definition 
var gauche = 'gauche';  
var grammar = '#JSGF V1.0; grammar phrase; public <gauche> = ' + gauche + ';';
var speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);

const recognition = new SpeechRecognition();
		recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 10;
    recognition.grammars = speechRecognitionList;


const button = document.querySelector('button');
var isRecording = false;
var final_transcript = '';

// Button states
const textButton_start = document.createTextNode("Start the recording");
const textButton_stop = document.createTextNode("Recording... 🔴");

// Start the recording & update the button when the function is called
function recording() {
	if(isRecording) {
		recognition.stop();
		button.classList.remove('active', 'record');
		button.replaceChild(textButton_start, textButton_stop);
		console.log('The record has stopped !')

	} else if(!isRecording) {
		recognition.start();
		button.classList.add('active', 'record');
		button.replaceChild(textButton_stop, textButton_start);

    // kick off the visual updating
    drawLoop();
  	console.log('The record has started !');
  }

  // Get and display the text 
  recognition.onresult = function (e) {
        var interim_transcript = '';
         if (typeof(event.results) == 'undefined') {
            recognition.onend = null;
            recognition.stop();
            return;
          }
        var final_text = document.getElementById('final_span');
        var interim_text = document.getElementById('interim_span');
        for (var i = e.resultIndex; i < e.results.length; ++i) {
            if (e.results[i].isFinal) {
                final_transcript += e.results[i][0].transcript;
                console.log(e.results[i]);
                console.log('Confidence: ' + event.results[0][0].confidence);
            } else {
              interim_transcript += e.results[i][0].transcript;
          }
          if(interim_transcript === gauche) {
          document.querySelector('html').style.background = 'green';
            }
        }
         final_span.innerHTML = linebreak(final_transcript);
         interim_span.innerHTML = linebreak(interim_transcript);
    }
} 


// Events handlers
recognition.onstart = function () {
    isRecording = true;
};

recognition.onend = function () {
    isRecording = false;
};

recognition.onerror = function (event) {
    isRecording = false;
};


button.appendChild(textButton_start);
// Start the record
button.addEventListener('click', recording);


// Linebreak helper
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}



/* [:::::: Microphone volume : Main ::::::] */

var audioContext = null;
var meter = null;
var canvasContext = null;
var WIDTH=500;
var HEIGHT=50;
var rafID = null;

window.onload = function() {

    // grab our canvas
  canvasContext = document.getElementById( "meter" ).getContext("2d");
  
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
        }, gotStream, didntGetStream);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }

}


function didntGetStream() {
    alert('Stream generation failed.');
}

var mediaStreamSource = null;

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    // We can grab the volume, thanks to the meter.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);

    // draw the volume bar...
}


function drawLoop( time ) {
    // clear the background
    canvasContext.clearRect(0,0,WIDTH,HEIGHT);

    // check if we're currently clipping
    if (meter.checkClipping())
        canvasContext.fillStyle = "red";
    else
        canvasContext.fillStyle = "green";

    // draw a bar based on the current volume
    canvasContext.fillRect(0, 0, meter.volume*WIDTH*2.4, HEIGHT);

    console.log(meter.volume * 1000);

    // set up the next visual callback
    rafID = window.requestAnimationFrame( drawLoop );
}




/* [:::::: Microphone volume : Functions::::::] */

function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
  var processor = audioContext.createScriptProcessor(256);
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

function volumeAudioProcess( event ) {
  var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
  var sum = 0;
    var x;

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
    var rms =  Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume*this.averaging);
}
