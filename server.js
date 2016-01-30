var express = require('express');
var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);

const updateRate = 30; // in ms
const SPINRATE = 3

var lastTime = Date.now();


// cursor locations/angles
var allCursors={};

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
    // nice to know
    console.log('a user connected');

    socket.on('new cursor', function(newCursor) {
        // store new cursor object in server array
        allCursors[socket.id] = newCursor;
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
        }
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        delete allCursors[socket.id];
    });
});


function update(){
    io.emit('server update', allCursors);
}

setInterval(update, updateRate);
