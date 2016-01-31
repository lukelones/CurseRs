// cursor setup
// convert from angle to radians
var RADIANS = Math.PI/180;

var cursorPic;

var Cursor = function () {
    this.x = 200;
    this.y = 200;

    this.size = 60;
    this.drawSize = 70;
    this.mid = this.drawSize / 2;

    this.angle = 0;

    // Send spin 'request' to server
    // 0 for no movement
    // 1 for spin clockwise
    // 2 for spin counter clockwise
    this.spinning = 0;

    // player requests to shoot
    this.shoot = false;

    // Active powerups
    this.tripshot = false;
    this.shield = false;

    // limits firing rate
    // this.reloadTime = 5;

    this.health = 3;

    this.deadTime = 0;
}

drawCursor = function(ctx, cursor) {
    if (cursor.deadTime <= 0) {
        // stores current coordinate system
        ctx.save();

        // shift coordinate system, rotate, draw
        ctx.translate(cursor.x, cursor.y);
        ctx.rotate(cursor.angle * RADIANS);

        var idx = cursor.health;
        if (cursor.shield) { idx = 5; }
        ctx.drawImage(cursorPic, cursor.drawSize * idx, 0, cursor.drawSize, cursor.drawSize,
                      -cursor.mid, -cursor.mid, cursor.drawSize, cursor.drawSize);

        // return to old coorginate system
        ctx.restore();
    } else if (cursor.owner == myCursor.id) {
        ctx.fillText("Respawn in: " + cursor.deadTime, 10, 50);
    }
}
