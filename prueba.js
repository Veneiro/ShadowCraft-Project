import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const demosSection = document.getElementById("demos");
let handLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;

let frozenCircles = [];
let activeCircles = [];

let canvasElement;
let canvasCtx;

function getP5Canvas() {
    canvasElement = document.getElementById("p5canvas");
    canvasCtx = canvasElement.getContext("2d");
}

function setup() {
    let canvas = createCanvas(1280, 720);
    canvas.id("p5canvas");
    canvas.parent("p5canvas_container");
    frameRate(144);
    noStroke();

    getP5Canvas();
    createHandLandmarker();
}

function draw() {
    background(255);

    if (webcamRunning && handLandmarker && results && results.landmarks) {
        for (const landmarks of results.landmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 5,
            });
            drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });

            // Generar círculos en las posiciones de las manos
            for (const point of landmarks) {
                let newCircle = new FadingCircle(point[0], point[1]);
                activeCircles.push(newCircle);
            }
        }
    }

    for (let i = 0; i < activeCircles.length; i++) {
        activeCircles[i].update();
        activeCircles[i].display();
    }

    for (let i = 0; i < frozenCircles.length; i++) {
        frozenCircles[i].display();
    }

    // Eliminar círculos que hayan alcanzado una opacidad mínima
    activeCircles = activeCircles.filter((circle) => int(circle.alpha) > 0);

    // Mover los círculos activos a los círculos congelados al presionar la barra espaciadora
    if (keyIsDown(32) && activeCircles.length > 0) {
        frozenCircles = frozenCircles.concat(activeCircles);
        activeCircles = [];
    }
}

class FadingCircle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.alpha = 255; // Opacidad inicial
        this.initialTime = millis(); // Tiempo inicial
        this.halfLife = 1000; // Tiempo de half-life en milisegundos
    }

    update() {
        // Calcular el tiempo transcurrido
        let elapsedTime = millis() - this.initialTime;

        // Calcular la opacidad utilizando la fórmula del half-life
        this.alpha = 255 * pow(0.5, elapsedTime / this.halfLife);
    }

    display() {
        fill(0, 0, 255, this.alpha);
        ellipse(this.x, this.y, 50, 50);
    }
}

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: runningMode,
        numHands: 2
    });
    demosSection.classList.remove("invisible");
};
createHandLandmarker();

/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/

const video = document.getElementById("webcam");

// Check if webcam access is supported.
const hasGetUserMedia = () => { var _a; return !!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia); };
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
}
else {
    console.warn("getUserMedia() is not supported by your browser");
}
// Enable the live webcam view and start detection.
function enableCam(event) {
    if (!handLandmarker) {
        console.log("Wait! objectDetector not loaded yet.");
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    }
    else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    }
    // getUsermedia parameters.
    const constraints = {
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}
let lastVideoTime = -1;
let results = undefined;
console.log(video);
async function predictWebcam() {
    canvasElement.style.width = video.videoWidth;
    ;
    canvasElement.style.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await handLandmarker.setOptions({ runningMode: "VIDEO" });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = handLandmarker.detectForVideo(video, startTimeMs);
    }
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if (results.landmarks) {
        for (const landmarks of results.landmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 5
            });
            drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
        }
    }
    canvasCtx.restore();
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}