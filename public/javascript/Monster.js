// convert from angle to radians
var RADIANS = Math.PI/180;

var monsterPic;

var Monster = function (x, y, xdir, ydir) {
    this.x = x;
    this.y = y;

    this.xdir = xdir;
    this.ydir = ydir;

    this.size = 60;
    this.drawWidth = 70;
    this.drawHeight = 108;
    this.midWidth = this.drawWidth / 2;
    this.midHeight = this.drawHeight / 2;

    this.angle = -45;

    // player requests to shoot
    this.shoot = false;

    this.health = 4;

    this.deadTime = 0;
}

drawMonster = function(ctx, monster) {
    if (monster.deadTime <= 0) {
        // stores current coordinate system
        ctx.save();

        // shift coordinate system, rotate, draw
        ctx.translate(monster.x, monster.y);
        ctx.rotate(monster.angle * RADIANS);

        var idx = 4 - monster.health;
        ctx.drawImage(monsterPic, -monster.midWidth, -monster.midHeight,
                      monster.drawWidth, monster.drawHeight);

        // return to old coorginate system
        ctx.restore();
    }
}
