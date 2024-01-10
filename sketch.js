let frozenCircles = [];
let activeCircles = [];
let handPoints;

function setup() {
  let canvas = createCanvas(1280, 720);
  canvas.id("p5canvas");
  canvas.parent("p5canvas_container");
  frameRate(240);
  noStroke();

  getP5Canvas();
  background(0, 0, 0, 0);
}

function draw() {
  clear();

  // Generar un nuevo círculo en cada fotograma
  generateCircles(
    getXHandLeft(),
    getYHandLeft(),
    normalizedToCanvasCoordinates(getXHandLeft(), getYHandLeft()).x,
    normalizedToCanvasCoordinates(getXHandLeft(), getYHandLeft()).y
  );

  generateCircles(
    getXHandRight(),
    getYHandRight(),
    normalizedToCanvasCoordinates(getXHandRight(), getYHandRight()).x,
    normalizedToCanvasCoordinates(getXHandRight(), getYHandRight()).y
  );

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

function generateCircles(handX, handY, canvasX, canvasY) {
  // Verificar si la mano tiene una posición válida (no es null o undefined)
  if (handX !== null && handY !== null) {
    // Crear un nuevo círculo en cada fotograma
    let newCircle = new FadingCircle(canvasX, canvasY);
    activeCircles.push(newCircle);
  }
}

class FadingCircle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alpha = 255; // Opacidad inicial
    this.initialTime = millis(); // Tiempo inicial
    this.halfLife = 500; // Tiempo de half-life en milisegundos (ajustado para un desvanecimiento más rápido)
    this.circleSize = 20; // Tamaño del círculo
  }

  update() {
    // Calcular el tiempo transcurrido
    let elapsedTime = millis() - this.initialTime;

    // Calcular la opacidad utilizando la fórmula del half-life
    this.alpha = 255 * pow(0.5, elapsedTime / this.halfLife);
  }

  display() {
    fill(0, 0, 255, this.alpha);
    ellipse(this.x, this.y, this.circleSize, this.circleSize);
  }
}

// Función para convertir coordenadas normalizadas a coordenadas de p5.js
function normalizedToCanvasCoordinates(normalizedX, normalizedY) {
  const canvasWidth = width; // Ancho del canvas de p5.js
  const canvasHeight = height; // Alto del canvas de p5.js

  // Multiplicar por las dimensiones del canvas para obtener coordenadas reales
  const canvasX = normalizedX * canvasWidth;
  const canvasY = normalizedY * canvasHeight;

  // Devolver las coordenadas convertidas
  return { x: canvasX, y: canvasY };
}

function setHandPoints(points) {
  handPoints = [];
  handPoints = points;
}
