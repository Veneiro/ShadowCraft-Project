let frozenLines = [];
let activeLines = [];
let handPoints;

function setup() {
  let canvas = createCanvas(1280, 720);
  canvas.id("p5canvas")
  canvas.parent("p5canvas_container");
  frameRate(144);
  noStroke();

  getP5Canvas();
  background(0, 0, 0, 0);
}

function draw() {
  clear();
  if (handPoints && handPoints.length > 0) {
    let newLine = new FadingLine(handPoints);
    activeLines.push(newLine);
  }

  for (let i = 0; i < activeLines.length; i++) {
    activeLines[i].update();
    activeLines[i].display();
  }

  for (let i = 0; i < frozenLines.length; i++) {
    frozenLines[i].display();
  }

  // Eliminar líneas que hayan alcanzado una opacidad mínima
  activeLines = activeLines.filter((line) => int(line.alpha) > 0);

  // Mover las líneas activas a las líneas congeladas al presionar la barra espaciadora
  if (keyIsDown(32) && activeLines.length > 0) {
    frozenLines = frozenLines.concat(activeLines);
    activeLines = [];
  }
}

class FadingLine {
  constructor(points) {
    this.points = points;
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
    stroke(0, 0, 255, this.alpha);
    strokeWeight(2);
    beginShape();
    for (let i = 0; i < this.points.length; i++) {
      let { x, y } = normalizedToCanvasCoordinates(
        this.points[i][0],
        this.points[i][1]
      );
      vertex(x, y);
    }
    endShape();
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
