let socket;

function setup() {
    createCanvas(640, 480);
    background(255);
}

function draw() {
    // Additional drawing logic if needed
}

function mousePressed() {
    drawing = true;
}

function mouseReleased() {
    drawing = false;
}

function mouseDragged() {
    if (drawing) {
        stroke(0);
        strokeWeight(10);
        line(pmouseX, pmouseY, mouseX, mouseY);
        let data = {
            prevX: pmouseX,
            prevY: pmouseY,
            currX: mouseX,
            currY: mouseY
        };
        socket.send(JSON.stringify(data));
    }
}
