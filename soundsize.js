function onReady() {

  var vid = document.querySelector('#inputVideo');

  cameraSource.start({
    videoElement: vid,
    constraints: {
      video: true,
      audio: true,
      facingMode: "environment"
    },
    callback: onCameraStream
  });

}
document.addEventListener('DOMContentLoaded', onReady);

function onCameraStream(stream) {
  // Show object after stream is live.
  var htmlStr = '<a-obj-model id="duck" src="#ducky-obj" position="0 1200 -3000" rotation="-210 -120 180" scale="3 3 3" material="color: orange"><a-animation easing="linear" attribute="rotation" dur="10000" to="0 0 360" repeat="indefinite"></a-animation> </a-obj-model>';
  //var htmlStr = '<a-box id="duck" position="0 2 0" rotation="50 0 0" material="color: red;"><a-animation easing="linear" attribute="rotation" dur="10000" to="0 0 360" repeat="indefinite"></a-animation></a-box>';
  var obj = document.querySelector('#aScene').appendChild(new DOMParser().parseFromString(htmlStr, 'text/html').body.firstChild);

  // Wait for A-Frame entity to complete loading before manipulating it.
  obj.addEventListener('loaded', onObjectLoaded);
  
  function onObjectLoaded() {
    // Save original scale as baseline
    var origScale = obj.object3D.scale

    // Listen for audio stats, modify model based on input.
    var maxDecibel, maxScale, origDecibel = 0;
    audioStats(stream, function(data) {

      // Get largest decibel value in the sample
      var decibel = Math.max.apply(null, data);

      // Set starting values
      if (!maxDecibel) {
        origDecibel = decibel;
        maxDecibel = decibel;
        maxScale = origScale;
      }

      // vec3all callback
      var cb = function(k, v) {
        return rescale(decibel, [origDecibel, maxDecibel], [2.5, 4.5]);
      };

      // Apply changes to position
      var newScale = vec3all(origScale, cb);
      obj.object3D.scale = newScale;

      if (decibel > maxDecibel) {
        maxDecibel = decibel;
        maxScale = newScale;
      }
    });
  }
}

function changeByPercentage(val, percdiff) {
  return val + ((percdiff/100) * val);
}

// Apply a function to all properties of a vec3.
function vec3all(vec, fn) {
  Object.keys(vec).forEach((k) => {
    vec[k] = fn(k, vec[k]);
  });
  return vec;
}

function audioStats(aStream, cb) {
  // Set up forked web audio context, for multiple browsers
  // window. is needed otherwise Safari explodes
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var stream = aStream;

  var analyser = audioCtx.createAnalyser();
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;
  analyser.smoothingTimeConstant = 0.85;

  var source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);

  analyser.fftSize = 256;
  var bufferLength = analyser.fftSize;
  var dataArray = new Uint8Array(bufferLength);

  // rAF driver
  (function onRAF() {
    requestAnimationFrame(onRAF);
    analyser.getByteTimeDomainData(dataArray);
    cb(dataArray);
  })();
}

function rescale(inputY, r1, r2) { 
  var xMax = r2[1];
  var xMin = r2[0];

  var yMax = r1[1];
  var yMin = r1[0];

  var percent = (inputY - yMin) / (yMax - yMin);
  var outputX = percent * (xMax - xMin) + xMin;

  return Math.round(outputX);
}

