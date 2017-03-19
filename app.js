function onReady() {

  var vid = document.querySelector('#inputVideo');

  cameraSource.start({
    videoElement: vid,
    constraints: {
      video: true,
      facingMode: { exact: "environment" }
    },
    callback: function() {
      // do stuff
    }
  });

}
document.addEventListener('DOMContentLoaded', onReady);
