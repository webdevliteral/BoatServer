const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
var socket = io();
var mouseDown = false;

canvas.width = 600;
canvas.height = 450;

const squarePen = {
    width: 5,
    height: 5,
    fillStyle: "rgb(50, 50, 50)",
    draw: function(x, y){
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(x, y, this.width, this.height);
    }
};

function GetMousePos(canvas, e) {
    let rect = canvas.getBoundingClientRect();
    return {x: e.clientX - rect.left, y: e.clientY - rect.top}
}

canvas.addEventListener('mousedown', function(e){
    let mousePos = GetMousePos(canvas, e);
    socket.emit('startDrawing', mousePos);
});

canvas.addEventListener('mousemove', function(e){
    if(mouseDown){
        let mousePos = GetMousePos(canvas, e);
        socket.emit('activeDrawing', mousePos);
    }
});

canvas.addEventListener('mouseup', function(e){
    mouseDown = false;
    socket.emit('stoppedDrawing', mousePos);
});

socket.on('startDrawing', (mousePos) => {
    mouseDown = true;
    squarePen.draw(mousePos.x, mousePos.y);
});

socket.on('activeDrawing', (mousePos) => {
    squarePen.draw(mousePos.x, mousePos.y);
});

socket.on('stoppedDrawing', (mousePos) => {
    
});