console.log('hi....');
'use strict';
var $ ={
  q: e => document.querySelector(e),
  c: e => document.createElement(e),
  a: (e, a) => (a || document.body).appendChild(e)
};

var fileInput = $.q('#file-input-btn'), video = $.q('#video');
/*

fileInput.onchange = e => {
  if(!fileInput.files.length) return;
  getVideoDimensions(URL.createObjectURL(fileInput.files[0]))
    .then(dims => console.log('dims: ', dims))
    .catch(console.error.bind(console))
}*/

var file = 'sample.mp4';

getVideoDimensions(file)
  .then(dims => console.log('dims: ', dims))
  .catch(console.error.bind(console))

function getVideoDimensions(src){
  var video  =  $.c('video'), resolved = false;
  return  new Promise((resolve, reject) => {
    setTimeout(()=> resolved?0: reject('Timeout'), 3000);
    video.src = src;
    video.onloadedmetadata = e => {
      var res = {
        height: video.videoHeight,
        width: video.videoWidth
      };
      video.src=null;
      video = null;
      if(resolved)  return;
      resolve(res);
    }
    video.play();
  });
}