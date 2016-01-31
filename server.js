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

var allMonsters = {};
var monsterID = 0;

var includeInThisContext = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);

includeInThisContext(__dirname+"/public/javascript/Bullet.js");
includeInThisContext(__dirname+"/public/javascript/Cursor.js");
includeInThisContext(__dirname+"/public/javascript/Powerup.js");
includeInThisContext(__dirname+"/public/javascript/Explosion.js");
includeInThisContext(__dirname+"/public/javascript/Monster.js");


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
    if (Object.keys(allPowerups).length < 3 && chance < .005){
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

    playerLogic();
    monsterLogic();

    checkCollisions()
    possiblePowerup();
    updatePowerups();
    updateBullets(deltaTime)

    io.emit('server update', allCursors, allBullets, allPowerups, allMonsters);
}

function monsterLogic() {
    checkCollisionMonsterCursor();
    var chance = Math.random();
    if (Object.keys(allMonsters).length < 3 && chance < .05){
        // spawn a Powerup
        var x = 800;
        var y = 600;

        var xdir = -1;
        var ydir = -1;

        var newMonster = new Monster(x, y, xdir, ydir);

        allMonsters[monsterID] = newMonster;
        monsterID++;
    }
    for (var monster in allMonsters) {
        allMonsters[monster].x += allMonsters[monster].xdir;
        allMonsters[monster].y += allMonsters[monster].ydir;


        if (allMonsters[monster].health <= 0) {
            allMonsters[monster].deadTime = Math.random()*500 + 300;
            allMonsters[monster].health = 4;
        }
        if (allMonsters[monster].deadTime > 0) {
            allMonsters[monster].deadTime--;
        }

        if (allMonsters[monster].x > 800 || allMonsters[monster].x < 0 ||
            allMonsters[monster].y > 800 || allMonsters[monster].y < 0 ||
            allMonsters[monster].deadTime > 0) {
            delete allMonsters[monster];
        }
    }
}

function playerLogic() {
    for (var cursor in allCursors) {
        if (allCursors[cursor].health <= 0) {
            allCursors[cursor].deadTime = 500;
            allCursors[cursor].health = 4;
        }
        if (allCursors[cursor].deadTime > 0) {
            allCursors[cursor].deadTime--;
        }
        if (allCursors[cursor].shield > 0) {
            allCursors[cursor].shield--;
        }
        if (allCursors[cursor].tripshot > 0) {
            allCursors[cursor].tripshot--;
        }
    }
}

function checkCollisions() {
    for (var bullet in allBullets) {
        if (allBullets[bullet] != undefined &&
            checkCollisionCursor(allBullets[bullet]) ||
            checkCollisionMonsterBullet(allBullets[bullet]) ||
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

function checkCollisionMonsterBullet(bullet) {
    // Monster - Bullet Collision
    for (var monster in allMonsters) {
        if (allMonsters[monster] == undefined ||
            allMonsters[monster].owner == bullet.owner ||
            allMonsters[monster].deadTime > 0) {
            continue;
        }
        var realDist = Math.sqrt(
            Math.pow((bullet.x - allMonsters[monster].x), 2) +
            Math.pow((bullet.y - allMonsters[monster].y), 2)
        );
        var hitDist = (bullet.size / 2) +
                      (allMonsters[monster].size / 2)

        if (realDist < hitDist) {
            createExplosion(bullet);

            allMonsters[monster].health--;
            if (allMonsters[monster].health <= 0) {
                createExplosion(allMonsters[monster]);
            }
            bullet.kill = true;
        }
    }
    return false;
}

function checkCollisionMonsterCursor() {
    for (var monster in allMonsters) {
        for (var cursor in allCursors) {
            if (allMonsters[monster] == undefined ||
                allMonsters[monster].deadTime > 0) {
                continue;
            }
            if (allCursors[cursor] == undefined ||
                allCursors[cursor].deadTime > 0) {
                continue;
            }

            var realDist = Math.sqrt(
                Math.pow((allCursors[cursor].x - allMonsters[monster].x), 2) +
                Math.pow((allCursors[cursor].y - allMonsters[monster].y), 2)
            );

            var hitDist = (allCursors[cursor].size / 2) +
                          (allMonsters[monster].size / 2)
            if (realDist < hitDist) {
                createExplosion(allMonsters[monster]);

                allMonsters[monster].health--;
                if (!allCursors[cursor].shield) {
                    allCursors[cursor].health--;
                }
                if (allCursors[cursor].health <= 0) {
                    createExplosion(allCursors[cursor]);
                }
            }
        }
    }
    return false;
}

function checkCollisionCursor(bullet) {
    for (var cursor in allCursors) {
        if (allCursors[cursor] == undefined ||
            allCursors[cursor].owner == bullet.owner ||
            allCursors[cursor].deadTime > 0) {
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

            if (!allCursors[cursor].shield) {
                allCursors[cursor].health--;
            }
            if (allCursors[cursor].health <= 0) {
                createExplosion(allCursors[cursor]);
            }
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
        if (allCursors[cursor] == undefined ||
            allCursors[cursor].deadTime > 0){
            continue;
        }
        var realDist = Math.sqrt(
            Math.pow((powerup.x - allCursors[cursor].x), 2) +
            Math.pow((powerup.y - allCursors[cursor].y), 2)
        );
        var hitDist = (powerup.size / 2) +
                      (allCursors[cursor].size / 2);
        if (realDist < hitDist) {
            // io.emit('powerup sound',

            if (powerup.type == HEALTH && allCursors[cursor].health < 4) {
                allCursors[cursor].health++;
            } else if (powerup.type == SHIELD) {
                allCursors[cursor].shield = 100;
            } else if (powerup.type == TRIPSHOT) {
                allCursors[cursor].tripshot = 100;
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
