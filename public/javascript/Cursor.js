// cursor setup
var cursorPic = new Image();
cursorPic.src = ('/img/cursorimg.png');

// convert from angle to radians
var RADIANS = Math.PI/180;

var Cursor = function () {
    this.x = 200;
    this.y = 200;

    this.height = 20;
    this.width = 13;

    this.angle = 0;

    // Send spin 'request' to server
    // 0 for no movement
    // 1 for spin clockwise
    // 2 for spin counter clockwise
    this.spinning = 0;

    // player requests to shoot
    // this.shoot = false;

    // limits firing rate
    // this.reloadTime = 5;

    // this.health = 3;
}

drawCursor = function(ctx, cursor) {
    // // stores current coordinate system
    ctx.save();

    // // shift coordinate system, rotate, draw
    ctx.translate(cursor.x, cursor.y);
    ctx.rotate(cursor.angle * RADIANS);
    ctx.drawImage(cursorPic, 0, 0, cursor.width, cursor.height);

    // // return to old coorginate system
    ctx.restore();

    //ctx.fillStyle = '#FFFFFF';
    //ctx.fillRect(cursor.x, cursor.y, cursor.width, cursor.height);
}
