// webcam start
var video = document.querySelector("#videoElement");
if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function(stream) {
            video.srcObject = stream;
        })
        .catch(function(err0r) {
            console.log("Something went wrong!");
        });
}

// load pretrained models
async function loadModels() {
    //await faceapi.loadSsdMobilenetv1Model('/models')
    await faceapi.loadTinyFaceDetectorModel("smile-gate/models");
    //await faceapi.loadFaceLandmarkModel('/models')
    //await faceapi.loadFaceRecognitionModel('/models')
    await faceapi.loadFaceExpressionModel("smile-gate/models");

    findExpression();
}

// customized compare function
function compare(value1, value2) {
    if (value1["probability"] < value2["probability"]) {
        return 1;
    } else if (value1["probability"] > value2["probability"]) {
        return -1;
    } else {
        return 0;
    }
}

// variables
const inputV = document.getElementById("videoElement");
const myEmotion = document.getElementById("emotion");
var myGauge = document.getElementById("gauge");
happyPoint = 0;

// detect
function findExpression() {
    var myDetection = setInterval(async function() {
        expressionV = await faceapi
            .detectSingleFace(inputV, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();
        if (expressionV == undefined) {
            if (happyPoint > 0) {
                happyPoint -= 1;
            } else {
                happyPoint = 0;
            }
            moveGauge();
        }
        resultV = expressionV.expressions.sort(compare);
        console.log(resultV[0]["expression"]);
        checkEmotion(resultV[0]["expression"]);
        myEmotion.innerHTML = resultV[0]["expression"];
        moveGauge();
        if (happyPoint > 10) {
            clearInterval(myDetection);
            happyPoint = 10;
            moveGauge();
            alert("You look so happy");
        }
    }, 250);
}

// check emotion
function checkEmotion(emotion) {
    if (emotion == "happy") {
        if (happyPoint < 11) {
            happyPoint += 1;
        } else {
            happyPoint = 10;
        }
    } else if (emotion == "neutral") {
        if (happyPoint > 0) {
            happyPoint -= 0.5;
        } else {
            happyPoint = 0;
        }
    } else {
        if (happyPoint > 0) {
            happyPoint -= 1;
        } else {
            happyPoint = 0;
        }
    }
}

// progress bar
function moveGauge() {
    var width = myGauge.width;
    console.log(width);
    myGauge.style.width = happyPoint * 10 + "%";
}

// start logic
setTimeout(loadModels, 100);
