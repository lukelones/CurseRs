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

    loadImages()

    // Start game
    setInterval(function() { gameLoop() }, fps);
}

function gameLoop() {
    // Draw everything
    render();

    // Send update to server
    socket.emit('my cursor update', myCursor);

    myCursor.shoot = false;
}

function render() {
    // draw black background
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);

    renderCursors();
    renderBullets();
}

function renderCursors() {
    for (var cursor in allCursors) {
        drawCursor(ctx, allCursors[cursor]);
    }
}

function renderBullets() {
    for (var bullet in allBullets) {
        drawBullet(ctx, allBullets[bullet]);
    }
}

document.addEventListener('mousemove', function(e) {
    myCursor.x = e.clientX || e.pageX;
    myCursor.y = e.clientY || e.pageY;
}, false);

document.getElementById("sendMessage").addEventListener("click", function(){
    var message = document.getElementById("messageText").value;
    socket.emit('new message', message);
});

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

$(document).bind('keyup', function(e) {
    var code = e.keyCode || e.which;
    switch(code) {
        // left or a
        case 37:
        case 65:
            // spin counter clockwise
            myCursor.spinning = 0;
            break;
        case 39:
        case 68:
            // spin clockwise
            myCursor.spinning = 0;
            break;
    }
});

$(document).click(function(event){
    myCursor.shoot = true;
});

socket.on('server update', function(updateCursors, updateBullets) {
    allCursors = updateCursors;
    allBullets = updateBullets;
});

socket.on('add message', function(message) {
    var node = document.createElement("LI");
    var textnode = document.createTextNode(message);
    node.appendChild(textnode);
    document.getElementById("messageList").appendChild(node);
});

init()
