let canvasElement;
let canvasCtx;
let xHandLeft;
let yHandLeft;
let xHandRight;
let yHandRight;
let x1Right;
let x1Left;
let x2Right;
let x2Left;
let x3Right;
let x3Left;


function getP5Canvas(){
    canvasElement = document.getElementById("p5canvas");
    canvasCtx = canvasElement.getContext("2d");
}

function setCoordsLeft(x, y){
    this.xHandLeft = x;
    this.yHandLeft = y;
}

function setCoordsRight(x, y){
    this.xHandRight = x;
    this.yHandRight = y;
}

function getXHandLeft(){
    return this.xHandLeft;
}

function getYHandLeft(){
    return this.yHandLeft;
}

function getXHandRight(){
    return this.xHandRight;
}

function getYHandRight(){
    return this.yHandRight;
}