import * as handpose from '@mediapipe/hands';

let video;
let handTrack;

function setup() {
    video = createCapture(VIDEO);
    video.size(640, 480);
    createCanvas(640, 480);
    handTrack = new handpose.Hands();
    handTrack.onResults(drawHands);
}

function drawHands(results) {
    background(255);
    if (results.multiHandLandmarks) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            let landmarks = results.multiHandLandmarks[i];
            drawHand(landmarks);
        }
    }
}

function drawHand(landmarks) {
    for (let i = 0; i < landmarks.length; i++) {
        let [x, y] = [landmarks[i].x * width, landmarks[i].y * height];
        ellipse(x, y, 10, 10);
    }
}

function draw() {
    image(video, 0, 0, width, height);
    handTrack.process(video.elt);
}
