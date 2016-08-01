// Camera
// * Use person and face detection to know when people are around, or cats
//

var cameraSource = (function(global) {

  var id = 'source-camera',
      title = 'Camera',
      videoElement = null;

  function start(opts) {
    videoElement = opts.videoElement;
    showCameraPreview(opts.callback);
  }

  function showCameraPreview(cb) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {

      var vidURL = window.URL.createObjectURL(stream);

      videoElement.src = vidURL;
      videoElement.play();

      if (cb) {
        cb();
      }

      /*
      setInterval(function() {
        console.log('intval')

        videoSnapshot(function(canvas) {
          //track.stop();

          //addSnapshotToPage(canvas);
          
          // upload photo
          canvas.toBlob(function(blob) {
            uploadPhoto(blob, function() {
              console.log('uploaded!')
            });
          });

        });
      }, 2000);
      */

    });
  }

  // the whole deal
  // * videoSnapshot() writes snapshot from video preview to a canvas
  // * get the binary data from the snapshot
  // * upload the binary data to the server
  function snapshot() {
    videoSnapshot(function(canvas) {
      // upload photo
      canvas.toBlob(function(blob) {
        uploadPhoto(blob, function() {
          console.log('uploaded!')
        });
      });
    });
  }

  function snapshotToCanvas(cb) {
    videoSnapshot(cb);
  }

  function videoSnapshot(cb) {
    var vid = document.querySelector('#vid'),
        width = 320,
        height = vid.videoHeight / (vid.videoWidth/width),
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    context.drawImage(vid, 0, 0, width, height);

    cb(canvas);
  }

  function addSnapshotToPage(canvas) {
    var img = document.createElement('img')
    img.src = canvas.toDataURL()
    document.body.appendChild(img)
  }

  function uploadPhoto(fileBlob, callback) {
    // Create object for form data
    var fd = new FormData();
    // 'upl' is the arbitrary string that multer expects to match
    // its config on the server end.
    fd.append('upl', fileBlob, 'file-' + Date.now() + '.jpg');

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://' + window.location.hostname + ':3000/upload');
    xhr.onload = function() {
      console.log('photo uploadeddddd')
      try {
        var data = JSON.parse(xhr.responseText).data;
      } catch(ex) {
      }
    }

    xhr.send(fd);
    console.log('upload: sent');
  }

  // public
  return {
    id: id,
    title: title,
    start: start,
    snapshot: snapshot,
    snapshotToCanvas: snapshotToCanvas
  };

})(this);
