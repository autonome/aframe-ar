// Sound recognition
// TODO: determine period of relative silence

var soundSource = (function(global) {
  
  var id = 'source-sound',
      title = 'Sound',
      enabled = 'mediaDevices' in navigator;

  function start() {
    /*
    if (navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(a =>
        a.forEach(d =>
          console.log(d)
        )
      );
    }
    */
    
    if ('mediaDevices' in navigator) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(onMediaStreamHandler)
        .catch(function(error) { 
          console.log('getUserMedia error: ', err);
        });
    }
  }

  function onMediaStreamHandler(stream) {
    stream.onactive = function(e) { console.log('stream active', e) };
    stream.onaddtrack = function(e) { console.log('stream track added', e) };
    stream.onended = function(e) { console.log('stream ended', e) };
    stream.oninactive = function(e) { console.log('stream inactive', e) };
    stream.onremovetrack = function(e) { console.log('stream track removed', e) };

    var audioCtx = new AudioContext();

    var analyser = audioCtx.createAnalyser();
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;

    var source = audioCtx.createMediaStreamSource(stream);
    global.source = source; // hack for bug 934512
    source.connect(analyser);

    var gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);

    var bufferLength = analyser.fftSize;
    var dataArray = new Uint8Array(analyser.frequencyBinCount);

    var rAFHandle = null,
        avgVolume = 0,
        lastVolume = 0;

    (function draw() {
      rAFHandle = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      avgVolume = getAverageVolume(dataArray);
    })();

    setInterval(function() {
      if (avgVolume) {
        publish(id, {
          id: 'avgVolume',
          value: avgVolume,
          type: 'stream',
          label: 'Average Volume'
        });
      }

      lastVolume = avgVolume
    }, 1000);

    function getAverageVolume(data) {
      return data.reduce(function(sum, value){
        return sum + value;
      }, 0) / data.length;
    }
  }

  // public
  return {
    id: id,
    title: title,
    enabled: enabled,
    start: start
  };

})(this);
