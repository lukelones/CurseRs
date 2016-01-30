// Import external lib stuff and set up server
var express = require('express');
var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);

var fs = require('fs');
var vm = require('vm');

// Constants
const updateRate = 30; // in ms
const SPINRATE = 3
const RADIANS = Math.PI/180;
const screenWidth = 800;
const screenHeight = 600;

// Initialize lastTime for calculating delta
var lastTime = Date.now();

// cursor locations/angles
var allCursors = {};

// Keep track of bullets
var allBullets = {};
var bulletID = 0;

// Track powerups
var allPowerups = {};
var powerupID = 0;

// Send where to render explosions to users
var explosions = [];

var includeInThisContext = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);

includeInThisContext(__dirname+"/public/javascript/Bullet.js");
includeInThisContext(__dirname+"/public/javascript/Cursor.js");
includeInThisContext(__dirname+"/public/javascript/Powerup.js");


app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
    // nice to know
    console.log('a user connected');

    socket.on('new cursor', function(newCursor) {
        // store new cursor object in server array
        allCursors[socket.id] = newCursor;
        allCursors[socket.id].owner = socket.id;
    });
    //message was sent
    socket.on('new message', function(message){
        console.log('a message was sent: ' + message);
        io.emit('add message', message);
    });

    // update player location
    socket.on('my cursor update', function(cursor) {
        if (allCursors[socket.id] != undefined) {
            allCursors[socket.id].x = cursor.x;
            allCursors[socket.id].y = cursor.y;
            allCursors[socket.id].ownser = cursor.id;

            if (cursor.spinning == 1) {
                allCursors[socket.id].angle += SPINRATE;
            } else if (cursor.spinning == 2) {
                allCursors[socket.id].angle -= SPINRATE;
            }

            // Create a new bullet and add it to allBullets
            if (cursor.shoot) {
                var newBullet = new Bullet(
                    allCursors[socket.id].owner,
                    allCursors[socket.id].x,
                    allCursors[socket.id].y,
                    allCursors[socket.id].angle
                );
                allBullets[bulletID] = newBullet;
                bulletID++;
            }
        }
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        delete allCursors[socket.id];
    });
});

function possiblePowerup(){
    var chance = Math.random();
    if (chance < .005){
        // spawn a Powerup
        var xPos = 800 * Math.random();
        var yPos = 600 * Math.random();

        var newPowerup = new Powerup(
            xPos,
            yPos);
        allPowerups[powerupID] = newPowerup;
        powerupID++;
    }


}
function update() {
    var currentTime = Date.now();

    // caculate time since last update
    var deltaTime = (currentTime - lastTime)/1000;
    lastTime = currentTime;

    checkCollisions()
    possiblePowerup();
    updatePowerups();
    updateBullets(deltaTime)

    if (explosions.length > 0) {
        console.log(explosions);
    }
    io.emit('server update', allCursors, allBullets,allPowerups, explosions);
    explosions = [];
}

function checkCollisions() {
    for (var bullet in allBullets) {
        if (allBullets[bullet] != undefined &&
            checkCollisionCursor(allBullets[bullet]) ||
            checkCollisionBullet(allBullets[bullet])) {
            allBullets[bullet].kill = true;
        }
    }
}

function checkCollisionCursor(bullet) {
    for (var cursor in allCursors) {
        if (allCursors[cursor] == undefined ||
            allCursors[cursor].owner == bullet.owner) {
            continue;
        }
        var realDist = Math.sqrt(
            Math.pow((bullet.x - allCursors[cursor].x), 2) +
            Math.pow((bullet.y - allCursors[cursor].y), 2)
        );
        var hitDist = (bullet.size / 2) +
                      (allCursors[cursor].size / 2)

        if (realDist < hitDist) {
            console.log('hit');
            explosions.push({
                x : bullet.x,
                y : bullet.y
            });

            bullet.kill = true;
        }
    }
    return false;
}

function checkCollisionBullet() {
    return false;
}

function updatePowerups(){
    for (var powerup in allPowerups){
        if(allPowerups[powerup].kill) {
            delete allPowerups[powerup];
        }
    }
}

function updateBullets(deltaTime) {
    for (var bullet in allBullets){
        if(allBullets[bullet].kill) {
            delete allBullets[bullet];
        }
        else{
            moveBullet(deltaTime, allBullets[bullet]);
        }
    }
}

function moveBullet(delta, bullet) {
    bullet.x -= 6*(Math.cos(bullet.angle*RADIANS+(3*Math.PI/8)));
    bullet.y -= 6*(Math.sin(bullet.angle*RADIANS+(3*Math.PI/8)));
    if((bullet.y < 0 || bullet.y>1500) ||
       (bullet.x < 0 || bullet.x>1500)){
        bullet.kill = true;
    }
}

setInterval(update, updateRate);
