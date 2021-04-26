var canvas, canvasCtx, audioCtx, audioElement, audioPaused, imgElement, dataArray, canvasWidth, canvasHeight, progressAxis, progressIndex, barGap;

function toggleAudioPlay() {
    if (audioPaused) {
        audioElement.play();
        imgElement.setAttribute("src", "assets/img/pause.png");
    }
    else {
        audioElement.pause();
        imgElement.setAttribute("src", "assets/img/play.png");
    }
    audioPaused = !audioPaused;
}

function getAudioData() {
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    draw();
    addStaticTag();
}

function updateCanvas() {
    var barHeight = dataArray[progressIndex] * canvasHeight;
    var barMaxHeight = canvasHeight;
    var barWidth = (canvasWidth / dataArray.length);
    canvasCtx.fillStyle = '#000000';
    canvasCtx.fillRect(progressAxis, (canvasHeight - barHeight), barWidth, Math.min(barHeight, barMaxHeight));
    progressAxis += barWidth + barGap;
    progressIndex++;
}

function draw() {
    var barWidth = canvasWidth / dataArray.length;
    var barMaxHeight = canvasHeight;
    var barHeight;
    var x = 0;
    for (var i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] * canvasHeight;
        canvasCtx.fillStyle = '#dddddd';
        canvasCtx.fillRect(x, (canvasHeight - barHeight), barWidth, Math.min(barHeight, barMaxHeight));
        x += barWidth + barGap;
    }
}

function dataIntrepretation(data) {
    var multiplier = Math.pow(Math.max(...data), -1); // returned values are 32 bit floating numbers between -1 and 1
    return data.map(function (n) {
        return n = n * multiplier;
    });
}

function createBlocks(audioBuffer) {
    var data = audioBuffer.getChannelData(0);
    var numberOfBars = 1024;
    var blockSize = Math.floor(data.length / numberOfBars);
    var reducedData = [];
    for (var i = 0; i < numberOfBars; i++) {
        var blockStart = blockSize * i;
        var sum = 0;
        for (var j = 0; j < blockSize; j++) {
            sum += Math.abs(data[blockStart + j]);
        }
        reducedData.push(sum / blockSize);
    }
    return reducedData;
}

function fetchAudioFile(url) {
    fetch(url)
        .then(function (response) {
            return response.arrayBuffer();
        })
        .then(function (arrayBuffer) {
            return audioCtx.decodeAudioData(arrayBuffer)
        })
        .then(function (audioBuffer) {
            return createBlocks(audioBuffer)
        })
        .then(function (data) {
            dataArray = dataIntrepretation(data);
            getAudioData();
        })
}

function resetPlayer() {
    imgElement.setAttribute("src", "assets/img/play.png");
    audioPaused = !audioPaused;
    progressAxis = 0;
    progressIndex = 0;
    getAudioData();
}

function addStaticTag() {
    canvasCtx.fillStyle = "#5ecc37";
    canvasCtx.fillRect(100, 10, 150, 35);
    canvasCtx.moveTo(170, 45);
    canvasCtx.lineTo(170, 100);
    canvasCtx.strokeStyle = "#5ecc37";
    canvasCtx.stroke();
    canvasCtx.beginPath();
    canvasCtx.arc(170, 100, 10, 0, 2 * Math.PI);
    canvasCtx.fill();
    canvasCtx.font = "20px Arial";
    canvasCtx.fillStyle = "#ffffff";
    canvasCtx.fillText("Introduction", 120, 32);
}

function init() {
    canvas = document.getElementById("audioVisualiser");
    canvasCtx = canvas.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioElement = document.getElementById('audioFile');
    audioPaused = true;
    progressAxis = 0;
    progressIndex = 0;
    barGap = 5;
    imgElement = document.getElementById("btnImg");
    fetchAudioFile("assets/audio/swinging.mp3");
    audioElement.addEventListener('ended', function () {
        resetPlayer();
    });
}