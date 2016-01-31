var socket = io();

var canvas, ctx;

// frequency of update call
var fps = 25;

// Arrays for bullets/Cursors
var allBullets = {};
var allCursors = {};

var myCursor = new Cursor()

var allPowerups = {};

var allExplosions = [];

// enter bool
var enterPressed = false;

function init() {
    // make canvas full screen
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');
    ctx.canvas.width = 800;
    ctx.canvas.height = 600;

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

    if (myCursor.id && allCursors[myCursor.id]) {
        myCursor.health = allCursors[myCursor.id].health;
        myCursor.shield = allCursors[myCursor.id].shield;
        myCursor.tripshot = allCursors[myCursor.id].tripshot;
    }

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
    renderPowerups();
    renderExplosions();
}

function renderCursors() {
    for (var cursor in allCursors) {
        drawCursor(ctx, allCursors[cursor]);
    }
}

function renderBullets() {
    for (var bullet in allBullets) {
        drawBullet(ctx, allBullets[bullet], socket);
    }
}

function renderPowerups() {
    for (var powerup in allPowerups) {
        drawPowerup(ctx, allPowerups[powerup]);
    }
}

function renderExplosions() {
    for (var i = allExplosions.length - 1; i > -1; i--) {
        if (allExplosions[i].frame > 8) {
            allExplosions.remove(i);
        }
        drawExplosion(ctx, allExplosions[i]);
    }
    allExplosions = allExplosions.filter(function (el) {
        return el.frame > 0;
    });
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

document.addEventListener('mousemove', function(e) {
    pos = getMousePos(canvas, e);

    myCursor.x = pos.x;
    myCursor.y = pos.y;
}, false);

document.getElementById("sendMessage").addEventListener("click", function(){
    var message = document.getElementById("messageText").value;
    document.getElementById("messageText").value = "";
    socket.emit('new message', message);
});

$(document).bind('keydown', function(e) {
    var code = e.keyCode || e.which;
    switch(code) {
        // enter
        case 13:
            checkEnter();
            break;
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

function checkEnter(){
    if (enterPressed){
        // send message
            enterPressed = false;
            document.getElementById("sendMessage").click();
            document.getSelection().removeAllRanges();
    }
    else{
        // enter text box
        enterPressed = true;
        document.getElementById("messageText").select();
    }
}

socket.on('socket id', function(id) {
    myCursor.id = id;
});

socket.on('server update', function(updateCursors, updateBullets, updatePowerups) {
    allCursors = updateCursors;
    allBullets = updateBullets;
    allPowerups = updatePowerups;
});

socket.on('explosion', function(explosion) {
    allExplosions.push(explosion);
});

socket.on('add message', function(message) {
    var node = document.createElement("LI");
    var textnode = document.createTextNode(message);
    node.appendChild(textnode);
    document.getElementById("messageList").appendChild(node);
});

init()
