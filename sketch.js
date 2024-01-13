let frozenHulls = [];
let activeHulls = [];
let storedHulls = [];
let handPoints = [];
let handPointsOtherHand = [];  
let grabando = false;
let continuous = true;
let interim = false;  //activar para que escuche constantemente

let speechRec;

let guardar = false;

const commands = {
  START: "iniciar",
  FREEZE: "congelar",
  FINISH: "finalizar",
  EREASE: "borrar"
}

function setup() {
  let canvas = createCanvas(1280, 720);
  canvas.id("p5canvas");
  canvas.parent("p5canvas_container");
  frameRate(144);
  noStroke();

  getP5Canvas();
  background(0, 0, 0, 0);

  //Se puede cambiar para que constantemente esté escuchando y
  //el procesado de comandos verbales se haga más rápido
  speechRec = new p5.SpeechRec('es-ES', gotSpeech);

  speechRec.start(continuous, interim);
  
}

function gotSpeech(){
  let resultadoDeVoz = (speechRec.resultString).toLowerCase();
  console.log(resultadoDeVoz);
  if(resultadoDeVoz.includes(commands.START)) {
    startRec();
  }
  if(resultadoDeVoz.includes(commands.FREEZE))
    freeze();
  if(resultadoDeVoz.includes(commands.FINISH)){
    stopRec();
  }
  if(resultadoDeVoz.includes(commands.EREASE)){
    erease();
  }
}

function draw() {
  clear();

  if (keyIsDown(83)) {  //Letra s
    startRec();
  }

  if(!grabando && !guardar)
    return;

  // Dibuja el casco convexo solo si hay puntos de la mano disponibles
  if (handPoints.length > 3) {
    // Calcula el casco convexo utilizando la librería concavehull
    let hull = concaveHull.calculate(handPoints, 3);

    // Dibuja el casco convexo con efecto de estela y desvanecimiento
    if (hull) {
      drawFadingBlob(hull);
      // Almacena el casco convexo activo
      activeHulls.push({ points: hull, alpha: 255 });
      if (grabando) {
        storedHulls.push({ points: hull, alpha: 255 });
      }
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
      if (grabando) {
        storedHulls.push({ points: hullSH, alpha: 255 });
      }
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

  for(let i = 0; i<storedHulls.length; i++){
    if (grabando) {
      storedHulls[i].alpha -= 2;
      if (storedHulls[i].alpha > 0) {
        // Dibuja el casco convexo con el efecto de desvanecimiento y "blob"
        drawFadingBlob(storedHulls[i].points, storedHulls[i].alpha);
      }
    }
  }

  for (let i = 0; i < frozenHulls.length; i++) {
    // Dibuja los cascos congelados con "blob"
    drawFadingBlob(frozenHulls[i].points, frozenHulls[i].alpha);
  }

  // Elimina los cascos convexos que hayan alcanzado una opacidad mínima
  activeHulls = activeHulls.filter((hull) => hull.alpha > 0);

  if (keyIsDown(88)){  //Letra x
    stopRec();
  }

  // Mueve los cascos convexos activos a los cascos congelados al presionar la barra espaciadora
  if (keyIsDown(70)) {  //Letra f
    freeze();
  }

  if(keyIsDown(71)){ //Letra g
    activeHulls = [];
    storedHulls = [];
    guardar = true;
  }

  if(guardar){
    saveCanvas(canvas, "canvas", "png");
    guardar = false;
    frozenHulls = [];
  }

}

function startRec() {
  if(!grabando){
    grabando = true;
    console.log("Grabando");
  }
}

function stopRec(){
  if(grabando){
    grabando = false;
    console.log("Parar de grabar");
    activeHulls = [];
    storedHulls = [];
    guardar = true;
  }
}

function erease(){
  if(grabando){
    grabando = false;
    console.log("Borrando lienzo...");
    activeHulls = [];
    storedHulls = [];
    frozenHulls = [];
  }
}

function freeze(){
  if(storedHulls.length > 0 && grabando) {
    console.log("Congelando Trazo")
    frozenHulls = frozenHulls.concat(storedHulls);
    storedHulls = [];
  }
}

function drawFadingBlob(blob, alpha = 255) {
  beginShape();
  fill(0, 0, 0, alpha); // Utiliza la opacidad especificada o la opacidad almacenada en el casco convexo
  noStroke();

  for (let i = 0; i < blob.length; i++) {
    let { x, y } = normalizedToCanvasCoordinates(blob[i][0], blob[i][1]);
    vertex(x, y);
    if (i > 0) {
      let prev = normalizedToCanvasCoordinates(blob[i - 1][0], blob[i - 1][1]);
      let next = normalizedToCanvasCoordinates(
        blob[(i + 1) % blob.length][0],
        blob[(i + 1) % blob.length][1]
      );
      let control1 = createControlPoint(prev, { x, y });
      let control2 = createControlPoint({ x, y }, next);
      bezierVertex(control1.x, control1.y, x, y, control2.x, control2.y);
    }
  }

  // Añadir un punto intermedio entre el último y el primer punto
  let firstPoint = normalizedToCanvasCoordinates(blob[0][0], blob[0][1]);
  let lastPoint = normalizedToCanvasCoordinates(
    blob[blob.length - 1][0],
    blob[blob.length - 1][1]
  );
  let extraPoint = createVector(
    (firstPoint.x + lastPoint.x) / 2,
    (firstPoint.y + lastPoint.y) / 2
  );
  bezierVertex(
    createControlPoint(lastPoint, extraPoint).x,
    createControlPoint(lastPoint, extraPoint).y,
    extraPoint.x,
    extraPoint.y,
    createControlPoint(extraPoint, firstPoint).x,
    createControlPoint(extraPoint, firstPoint).y
  );

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}