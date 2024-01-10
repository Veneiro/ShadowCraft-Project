let frozenHulls = [];
let activeHulls = [];
let handPoints = [];

function setup() {
  let canvas = createCanvas(1280, 720);
  canvas.id("p5canvas");
  canvas.parent("p5canvas_container");
  frameRate(144);
  noStroke();

  getP5Canvas();
}

function draw() {
  background(255);

  // Dibuja el casco convexo solo si hay puntos de la mano disponibles
  if (handPoints.length > 3) {
    console.log(handPoints)
    // Calcula el casco convexo utilizando la librería concavehull
    let hull = concaveHull.calculate(handPoints, 3);

    // Dibuja el casco convexo
    beginShape();
    fill(0, 0, 255, 50); // Ajusta la opacidad según tus necesidades
    noStroke();
    for (let i = 0; i < hull.length; i++) {
      let { x, y } = normalizedToCanvasCoordinates(hull[i][0], hull[i][1]);
      vertex(x, y);
    }
    endShape(CLOSE);

    // Almacena el casco convexo activo
    activeHulls.push(hull);

    // Limpia los puntos de la mano
    handPoints = [];
  }

  for (let i = 0; i < activeHulls.length; i++) {
    drawHull(activeHulls[i]);
  }

  for (let i = 0; i < frozenHulls.length; i++) {
    drawHull(frozenHulls[i]);
  }

  // Elimina los cascos convexos que hayan alcanzado una opacidad mínima
  activeHulls = activeHulls.filter((hull) => hull[4] > 0);

  // Mueve los cascos convexos activos a los cascos congelados al presionar la barra espaciadora
  if (keyIsDown(32) && activeHulls.length > 0) {
    frozenHulls = frozenHulls.concat(activeHulls);
    activeHulls = [];
  }
}

function drawHull(hull) {
  beginShape();
  fill(0, 0, 255, hull[4]); // Utiliza la opacidad almacenada en la posición 4 de cada punto del casco convexo
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
