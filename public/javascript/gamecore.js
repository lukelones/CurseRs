var socket = io();

var canvas, ctx;

// frequency of update call
var fps = 25;

// Arrays for bullets/Cursors
var allBullets = {};
var allCursors = {};

var myCursor = new Cursor()

function init() {
    // make canvas full screen
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    // hide your real cursor
    ctx.canvas.style.cursor = "none";

    // Register your cursor
    socket.emit('new cursor', myCursor);

    // Start game
    setInterval(function() { gameLoop() }, fps);
}

function gameLoop() {
    // Send stuff from client to server

    // Draw everything
    render();

    // Send update to server
    socket.emit('my cursor update', myCursor);
}

function render() {
    // draw black background
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);

    renderCursors();
}

function renderCursors() {
    for(var cursor in allCursors){
        drawCursor(ctx, allCursors[cursor]);
    }
}

document.addEventListener('mousemove', function(e) {
    myCursor.x = e.clientX || e.pageX;
    myCursor.y = e.clientY || e.pageY;
}, false);


$(document).bind('keydown', function(e) {
    var code = e.keyCode || e.which;
    switch(code) {
        // left or a
        case 37:
        case 65:
            // spin counter clockwise
            myCursor.spinning = 2;
            break;
        // up or w
        case 38:
        case 87:
            // do nothing for now
            break;
        // right or d
        case 39:
        case 68:
            // spin clockwise
            myCursor.spinning = 1;
            break;
        // down or s
        case 40:
        case 83:
            //do nothing for now
            break;
    }
});


socket.on('server update', function(newCursors) {
    allCursors = newCursors;
});

init()
