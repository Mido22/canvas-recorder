// shorthand
var $ ={
  q: e => document.querySelector(e),  // for querying elements
  c: e => document.createElement(e),  // for creating elements
  a: (e, p) => (p || document.body).appendChild(e),  // for appending elements
  r: (e, p) => (p || document.body).removeChild(e)  // for removing elements
};

var fileInput = $.q('#file-input-btn'),
    button = $.q('#button'),
    frameRate = 15; // frame rate of the new video

// we convert the video when user selects add Trademark, if no file is provided, use the sample file
button.onclick = () => {
  var file = fileInput.files[0], 
      fileName = file? file.name : 'sample';
  getVideo()
    .then(addTrademark)
    .then(blob => {

    var div = $.c('div'),
        a = $.c('a'),
        span = $.c('span'),
        span2 = $.c('span'),
        span3 = $.c('span'),
        video = $.c('video'),
        button = $.c('button'),
        name = fileName + '_trademarked.webm';
    a.download = name;
    a.href = URL.createObjectURL(blob);
    span.innerText = 'Click to download Processed file: '
    span2.innerText = name;
    button.innerText = 'play file';
    button.onclick = () => {
      $.a(video, div);
      video.src = a.href;
      video.controls = true;
      video.play();
    };
    $.a(span2, a);
    $.a(button, span3);
    $.a(span, div);
    $.a(a, div);
    $.a(span3, div);
    $.a(div);
  }).catch(console.error.bind(console));
};

// for retriving video details( resolution, video element)
function getVideo(file){
  var video  =  $.c('video'), 
      resolved = false,
      src = file? URL.createObjectURL(file) : 'sample.mp4';
  return  new Promise((resolve, reject) => {
    setTimeout(()=> !resolved && reject('Timeout'), 5000);
    video.src = src;
    video.muted = true;
    video.onloadedmetadata = e => {
      var res = {
        height: video.videoHeight,
        width: video.videoWidth,
        video
      };
      video = null;
      !resolved && resolve(res);
    }
  });
}

// drawing video into canvas, turning it into CanvasStream and capturing it using MediaRecorder.
function addTrademark(data){
  var canvas = $.c('canvas'),
      ctx = canvas.getContext('2d'),
      canvasStream = canvas.captureStream(frameRate),
      recorder = new MediaRecorder(canvasStream),
      str = $.q('#trademark').value.trim(),
      video = data.video,
      interval;

  canvas.height = data.height;
  canvas.width = data.width;

  // drawing video+tradmark onto the canvas.
  function drawImage(){
    ctx.drawImage(video, 0, 0); 
    ctx.font = "36px serif";
    ctx.textAlign = "end";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#FF0000";
    ctx.fillText(str, canvas.width-10, canvas.height-50);
    if(video.currentTime>=video.duration){
      recorder.stop();
      interval && clearInterval(interval);
      return;
    }
  }

  function clearAll(){    
    interval && clearInterval(interval);
    recorder = null;
    canvasStream = null;
    ctx = null;
    canvas = null;
    video = null;
    interval = null;
    for(var key in data) data[key] = null;
  }

  return new Promise((resolve, reject) => {
    interval = setInterval(drawImage, 1000/frameRate);
    recorder.ondataavailable = e => { // return the blob once it is ready
      resolve(e.data);
      clearAll();
    };
    recorder.onerror = reject;
    video.currentTime = 0;
    video.play();
    recorder.start();
  });
}
