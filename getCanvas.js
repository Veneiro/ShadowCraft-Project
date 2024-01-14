let canvasElement;
let canvasCtx;

// Guarda el canvas de la app para posteriormente dibujar en él
function getP5Canvas(){
    canvasElement = document.getElementById("p5canvas");
    canvasCtx = canvasElement.getContext("2d");
}