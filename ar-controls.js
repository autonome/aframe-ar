function onReady() {

  var vid = document.querySelector('#inputVideo');

  cameraSource.start({
    videoElement: vid,
    constraints: {
      video: true,
      facingMode: "environment"
    },
    callback: function() {
      //document.querySelector('#ducky-obj').src = 'ducky.obj'
      var htmlStr = '<a-image id="controls" src="ar-music-ctrls.png" position="0 0 -30" scale="20 25 20"></a-image>';
      document.querySelector('#aScene').appendChild(new DOMParser().parseFromString(htmlStr, 'text/html').body.firstChild);
    }
  });

}
document.addEventListener('DOMContentLoaded', onReady);
