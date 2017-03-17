function onReady() {

  var vid = document.querySelector('#inputVideo');

  cameraSource.start({
    videoElement: vid,
    callback: function() {
      // do stuff
    }
  });

}
document.addEventListener('DOMContentLoaded', onReady);
