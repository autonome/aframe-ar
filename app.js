function onReady() {
  var vid = document.querySelector('#inputVideo');

  cameraSource.start({
    videoElement: vid,
    constraints: {
      video: true,
      facingMode: "environment"
    },
    callback: function() {
      // BROKEN IN CHROME ONLY
      //var htmlStr = '<a-obj-model id="duck" src="#ducky-obj" position="0 -800 -4000" rotation="-210 -120 180" scale="8 8 8" material="color: orange"><a-animation easing="linear" attribute="rotation" dur="10000" to="0 0 360" repeat="indefinite"></a-animation> </a-obj-model>';
      //document.querySelector('#aScene').appendChild(new DOMParser().parseFromString(htmlStr, 'text/html').body.firstChild);

      // BROKEN
      //document.querySelector('#ducky-obj').src = 'ducky.obj'

      var scene = document.querySelector('#aScene');
      var aobj = document.createElement('a-obj-model');
      aobj.setAttribute('id', 'duck');
      aobj.setAttribute('src', '#ducky-obj');
      aobj.setAttribute('position', '0 -800 -4000');
      aobj.setAttribute('rotation', '210 -120 180');
      aobj.setAttribute('scale', '8 8 8');
      aobj.setAttribute('material', 'color: orange');
      scene.appendChild(aobj);
    }
  });
}

document.addEventListener('DOMContentLoaded', onReady);
