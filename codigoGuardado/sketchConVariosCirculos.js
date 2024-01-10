let frozenCircles = [];
let activeCircles = [];
let handPoints;

// Número máximo de círculos activos permitidos
const maxActiveCircles = 10;

function setup() {
  let canvas = createCanvas(1280, 720);
  canvas.id("p5canvas");
  canvas.parent("p5canvas_container");
  frameRate(144);
  noStroke();

  getP5Canvas();
}

function draw() {
  background(255, 0); // Fondo transparente
  if (handPoints && handPoints.length > 0) {
    let newCircles = new FadingCircles(handPoints);
    activeCircles.push(newCircles);

    // Mantener solo un número limitado de círculos activos
    if (activeCircles.length > maxActiveCircles) {
      activeCircles.shift(); // Eliminar el círculo más antiguo
    }
  }

  for (let i = 0; i < activeCircles.length; i++) {
    activeCircles[i].update();
    activeCircles[i].display();
  }

  for (let i = 0; i < frozenCircles.length; i++) {
    frozenCircles[i].display();
  }

  // Eliminar círculos congelados que hayan alcanzado una opacidad mínima
  frozenCircles = frozenCircles.filter((circle) => int(circle.alpha) > 0);
}

class FadingCircles {
  constructor(points) {
    this.points = points;
    this.alpha = 255; // Opacidad inicial
    this.initialTime = millis(); // Tiempo inicial
    this.halfLife = 1000; // Tiempo de half-life en milisegundos
    this.circleSize = 10; // Tamaño del círculo
    this.pointsPerFrame = 2; // Puntos por actualización
  }

  update() {
    // Calcular el tiempo transcurrido
    let elapsedTime = millis() - this.initialTime;

    // Calcular la opacidad utilizando la fórmula del half-life
    this.alpha = 255 * pow(0.5, elapsedTime / this.halfLife);

    // Reducir la cantidad de puntos si hay demasiados
    this.points = this.points.slice(this.pointsPerFrame);

    // Actualizar el tiempo inicial solo si hay puntos restantes
    if (this.points.length > 0) {
      this.initialTime = millis();
    }
  }

  display() {
    fill(0, 0, 255, this.alpha);
    for (let i = 0; i < this.points.length; i++) {
      let { x, y } = normalizedToCanvasCoordinates(
        this.points[i][0],
        this.points[i][1]
      );
      ellipse(x, y, this.circleSize, this.circleSize);
    }
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
