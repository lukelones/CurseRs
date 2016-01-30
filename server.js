var express = require('express');
var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);

var updateRate = 30; // in ms
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
        console.log(allCursors);
    });

    // update player location
    socket.on('my cursor update', function(cursor) {
        if (allCursors[socket.id] != undefined) {
            allCursors[socket.id].x = cursor.x;
            allCursors[socket.id].y = cursor.y;
            // allCursors[socket.id].angle = cursor.angle;
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
