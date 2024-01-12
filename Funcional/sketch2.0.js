let frozenHulls = [];
let activeHulls = [];
let handPoints = [];
let handPointsOtherHand = [];

function setup() {
  let canvas = createCanvas(1280, 720);
  canvas.id("p5canvas");
  canvas.parent("p5canvas_container");
  frameRate(144);
  noStroke();

  getP5Canvas();
  background(0, 0, 0, 0);
}

function draw() {
  clear();
  // Dibuja el casco convexo solo si hay puntos de la mano disponibles
  if (handPoints.length > 3) {
    // Calcula el casco convexo utilizando la librería concavehull
    let hull = concaveHull.calculate(handPoints, 3);

    // Dibuja el casco convexo con efecto de estela y desvanecimiento
    if (hull) {
      drawFadingBlob(hull);
      // Almacena el casco convexo activo
      activeHulls.push({ points: hull, alpha: 255 });
    }

    // Limpia los puntos de la mano
    handPoints = [];
  }

  if (handPointsOtherHand.length > 3) {
    // Calcula el casco convexo utilizando la librería concavehull
    let hullSH = concaveHull.calculate(handPointsOtherHand, 3);

    // Dibuja el casco convexo con efecto de estela y desvanecimiento
    if (hullSH) {
      drawFadingBlob(hullSH);
      // Almacena el casco convexo activo
      activeHulls.push({ points: hullSH, alpha: 255 });
    }

    // Limpia los puntos de la otra mano
    handPointsOtherHand = [];
  }

  for (let i = 0; i < activeHulls.length; i++) {
    activeHulls[i].alpha -= 2; // Reduce la opacidad con el tiempo
    if (activeHulls[i].alpha > 0) {
      // Dibuja el casco convexo con el efecto de desvanecimiento y "blob"
      drawFadingBlob(activeHulls[i].points, activeHulls[i].alpha);
    }
  }

  for (let i = 0; i < frozenHulls.length; i++) {
    // Dibuja los cascos congelados con "blob"
    drawFadingBlob(frozenHulls[i].points, frozenHulls[i].alpha);
  }

  // Elimina los cascos convexos que hayan alcanzado una opacidad mínima
  activeHulls = activeHulls.filter((hull) => hull.alpha > 0);

  // Mueve los cascos convexos activos a los cascos congelados al presionar la barra espaciadora
  if (keyIsDown(70) && activeHulls.length > 0) {
    frozenHulls = frozenHulls.concat(activeHulls);
    activeHulls = [];
  }
}

function drawFadingBlob(blob, alpha = 255) {
  beginShape();
  fill(0, 0, 255, alpha); // Utiliza la opacidad especificada o la opacidad almacenada en el casco convexo
  noStroke();

  // Itera sobre los puntos del casco convexo
  for (let i = 0; i < blob.length; i++) {
    // Obtén las coordenadas en el canvas
    let { x, y } = normalizedToCanvasCoordinates(blob[i][0], blob[i][1]);
    // Dibuja el punto actual
    vertex(x, y);
    // Añade curvas de Bezier suaves entre los puntos para suavizar la forma del blob
    if (i > 0) {
      let prev = normalizedToCanvasCoordinates(blob[i - 1][0], blob[i - 1][1]);
      let next = normalizedToCanvasCoordinates(blob[(i + 1) % blob.length][0], blob[(i + 1) % blob.length][1]);
      let control1 = createControlPoint(prev, { x, y });
      let control2 = createControlPoint({ x, y }, next);
      bezierVertex(control1.x, control1.y, x, y, control2.x, control2.y);
    }
  }

  endShape(CLOSE);
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

function setHandPointsOtherHand(points) {
  handPointsOtherHand = points;
}

// Función para crear un punto de control entre dos puntos dados
function createControlPoint(p1, p2) {
  let distance = dist(p1.x, p1.y, p2.x, p2.y);
  let angle = atan2(p2.y - p1.y, p2.x - p1.x);
  let controlDistance = distance * 0.3; // Ajusta la distancia del punto de control según sea necesario
  let controlX = p1.x + cos(angle) * controlDistance;
  let controlY = p1.y + sin(angle) * controlDistance;
  return createVector(controlX, controlY);
}
