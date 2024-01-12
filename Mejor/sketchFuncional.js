let frozenHulls = [];
let activeHulls = [];
let handPoints = [];
let handPointsOtherHand = []

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
    let hullSH = concaveHull.calculate(handPointsOtherHand, 3);

    // Dibuja el casco convexo con efecto de estela y desvanecimiento
    drawFadingHull(hull, hullSH);

    // Almacena el casco convexo activo
    activeHulls.push({ points: hull, alpha: 255 });
    //activeHulls.push({ points: hullSH, alpha: 255 });

    // Limpia los puntos de la mano
    handPoints = [];
  }

  for (let i = 0; i < activeHulls.length; i++) {
    activeHulls[i].alpha -= 2; // Reduce la opacidad con el tiempo
    if (activeHulls[i].alpha > 0) {
      // Dibuja el casco convexo con el efecto de desvanecimiento
      drawFadingHull(activeHulls[i].points, activeHulls[i].alpha);
    }
  }

  for (let i = 0; i < frozenHulls.length; i++) {
    // Dibuja los cascos congelados
    drawFadingHull(frozenHulls[i].points, frozenHulls[i].alpha);
  }

  // Elimina los cascos convexos que hayan alcanzado una opacidad mínima
  activeHulls = activeHulls.filter((hull) => hull.alpha > 0);

  // Mueve los cascos convexos activos a los cascos congelados al presionar la barra espaciadora
  if (keyIsDown(70) && activeHulls.length > 0) {
    frozenHulls = frozenHulls.concat(activeHulls);
    activeHulls = [];
  }
}

function drawFadingHull(hull, alpha = 255) {
  beginShape();
  fill(0, 0, 0, alpha); // Utiliza la opacidad especificada o la opacidad almacenada en el casco convexo
  noStroke();
  for (let i = 0; i < hull.length; i++) {
    let { x, y } = normalizedToCanvasCoordinates(hull[i][0], hull[i][1]);
    vertex(x, y);
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

function setHandPointsOtherHand(points){
  handPointsOtherHand = points;
}
