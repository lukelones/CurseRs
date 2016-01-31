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

var includeInThisContext = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);

includeInThisContext(__dirname+"/public/javascript/Bullet.js");
includeInThisContext(__dirname+"/public/javascript/Cursor.js");
includeInThisContext(__dirname+"/public/javascript/Powerup.js");
includeInThisContext(__dirname+"/public/javascript/Explosion.js");


app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
    // nice to know
    console.log('a user connected');

    socket.on('new cursor', function(newCursor) {
        // store new cursor object in server array
        allCursors[socket.id] = newCursor;
        allCursors[socket.id].owner = socket.id;
        socket.emit('socket id', socket.id);
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
                spawnBullet(socket, cursor);
            }
        }
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        delete allCursors[socket.id];
    });
});

function spawnBullet(socket, cursor) {
    var newBullet = new Bullet(
        allCursors[socket.id].owner,
        allCursors[socket.id].x,
        allCursors[socket.id].y,
        allCursors[socket.id].angle
    );
    allBullets[bulletID] = newBullet;
    bulletID++;

    // hacky -- make this better
    if (cursor.tripshot) {
        var newBullet = new Bullet(
            allCursors[socket.id].owner,
            allCursors[socket.id].x,
            allCursors[socket.id].y,
            allCursors[socket.id].angle + 15
        );
        allBullets[bulletID] = newBullet;
        bulletID++;

        var newBullet = new Bullet(
            allCursors[socket.id].owner,
            allCursors[socket.id].x,
            allCursors[socket.id].y,
            allCursors[socket.id].angle - 15
        );
        allBullets[bulletID] = newBullet;
        bulletID++;
    }

    io.emit('bullet sound', newBullet);
}

function possiblePowerup(){
    var chance = Math.random();
    if (chance < .005){
        // spawn a Powerup
        var xPos = 800 * Math.random();
        var yPos = 600 * Math.random();
        var type = Math.floor((Math.random() * 3));;

        var newPowerup = new Powerup(xPos, yPos, type);

        allPowerups[powerupID] = newPowerup;
        powerupID++;
    }


}
function update() {
    var currentTime = Date.now();

    // caculate time since last update
    var deltaTime = (currentTime - lastTime)/1000;
    lastTime = currentTime;

    handleCursors();

    checkCollisions()
    possiblePowerup();
    updatePowerups();
    updateBullets(deltaTime)

    io.emit('server update', allCursors, allBullets, allPowerups);
}

function handleCursors() {
    for (var cursor in allCursors) {
        if (allCursors[cursor].health <= 0) {
            console.log('cursor dead');
        }
    }
}

function checkCollisions() {
    for (var bullet in allBullets) {
        if (allBullets[bullet] != undefined &&
            checkCollisionCursor(allBullets[bullet]) ||
            checkCollisionBullet(allBullets[bullet])) {
            allBullets[bullet].kill = true;
        }
    }

    for (var powerup in allPowerups){
        if (allPowerups[powerup] != undefined){
            checkCollisionPowerup(allPowerups[powerup]);
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
            createExplosion(bullet);
            allCursors[cursor].health--;
            bullet.kill = true;
        }
    }
    return false;
}

function createExplosion (bullet) {
    var splode = new Explosion(bullet.x, bullet.y);
    splode.x -= splode.size/2;
    splode.y -= splode.size/2;
    io.emit('explosion', splode);
}

function checkCollisionBullet() {
    return false;
}

function checkCollisionPowerup(powerup) {
    for (var cursor in allCursors) {
        if (allCursors[cursor] == undefined){
            continue;
        }
        var realDist = Math.sqrt(
            Math.pow((powerup.x - allCursors[cursor].x), 2) +
            Math.pow((powerup.y - allCursors[cursor].y), 2)
        );
        var hitDist = (powerup.size / 2) +
                      (allCursors[cursor].size / 2);
        if (realDist < hitDist) {
            if (powerup.type == HEALTH) {
                allCursors[cursor].health++;
            } else if (powerup.type == SHIELD) {
                allCursors[cursor].shield = true;
            } else if (powerup.type == TRIPSHOT) {
                allCursors[cursor].tripshot = true;
            } else {
                console.log('invalid powerup type: ' + powerup.type);
            }

            powerup.kill = true;
        }
    }
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
