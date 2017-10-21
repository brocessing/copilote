console.log(`It's working !`)

const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
const recognition = new SpeechRecognition();
		recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;

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
  	console.log('The record has started !');
  }
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
            } else {
            	interim_transcript += e.results[i][0].transcript;
            }
        }
         final_span.innerHTML = linebreak(final_transcript);
         interim_span.innerHTML = linebreak(interim_transcript);
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

