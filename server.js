// Import external lib stuff and set up server
var express = require('express');
var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);

// Internal imports
var bullet = require('./public/javascript/Bullet.js');

// Constants
const updateRate = 30; // in ms
const SPINRATE = 3
const RADIANS = Math.PI/180;

// Initialize lastTime for calculating delta
var lastTime = Date.now();

// cursor locations/angles
var allCursors = {};

// Keep track of bullets
var allBullets = {};
var bulletID = 0;

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
    // nice to know
    console.log('a user connected');

    socket.on('new cursor', function(newCursor) {
        // store new cursor object in server array
        allCursors[socket.id] = newCursor;
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

            if (cursor.spinning == 1) {
                allCursors[socket.id].angle += SPINRATE;
            } else if (cursor.spinning == 2) {
                allCursors[socket.id].angle -= SPINRATE;
            }

            // Create a new bullet and add it to allBullets
            if (cursor.shoot) {
                var newBullet = new bullet.Bullet(
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


function update(){
    var currentTime = Date.now();

    // caculate time since last update
    var deltaTime = (currentTime - lastTime)/1000;
    lastTime = currentTime;

    updateBullets(deltaTime)
    io.emit('server update', allCursors, allBullets);
}

function updateBullets(deltaTime) {
    for (var bullet in allBullets){
        if(allBullets[bullet].kill) {
            delete allBullets[bullet];
        }
        else{
            // checkCollisions(allBullets[bullet]);
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
