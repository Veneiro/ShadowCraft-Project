let activeCircles = [];
let handPoints;

function setup() {
  let canvas = createCanvas(1280, 720);
  canvas.id("p5canvas");
  canvas.parent("p5canvas_container");
  frameRate(60); // Ajusta la velocidad de fotogramas según sea necesario
  noStroke();

  getP5Canvas();
  background(0, 0, 0, 0);
}

function draw() {
  clear();
  if (handPoints && handPoints.length > 0) {
    let newCircles = new FadingCircles(handPoints);
    activeCircles.push(newCircles);
  }

  for (let i = activeCircles.length - 1; i >= 0; i--) {
    activeCircles[i].update();
    activeCircles[i].display();
    if (activeCircles[i].alpha <= 0) {
      // Si el círculo ha desaparecido, eliminarlo de la lista
      activeCircles.splice(i, 1);
    }
  }
}

class FadingCircles {
  constructor(points) {
    this.points = points;
    this.alpha = 255; // Opacidad inicial
    this.halfLife = 2000; // Tiempo de half-life en milisegundos
    this.circleSize = 10; // Tamaño del círculo
    this.pointsPerFrame = 2; // Puntos por actualización
    this.initialTime = millis(); // Tiempo inicial
  }

  update() {
    // Calcular el tiempo transcurrido
    let elapsedTime = millis() - this.initialTime;

    // Calcular la reducción del factor alpha basado en el tiempo transcurrido
    let reductionFactor = pow(0.5, elapsedTime / this.halfLife);

    // Aplicar la reducción al valor alpha
    this.alpha *= reductionFactor;

    // Reducir la cantidad de puntos si hay demasiados
    this.points = this.points.slice(this.pointsPerFrame);
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
  handPoints = points;
}
