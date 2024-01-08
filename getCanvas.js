let canvasElement;
let canvasCtx;
let xHand;
let yHand;

function getP5Canvas(){
    canvasElement = document.getElementById("p5canvas");
    canvasCtx = canvasElement.getContext("2d");
}

function setCoords(x, y){
    this.xHand = x;
    this.yHand = y;
}

function getXHand(){
    return this.xHand;
}

function getYHand(){
    return this.yHand;
}