// convert from angle to radians
var RADIANS = Math.PI/180;

var monster0Pic, monster1Pic, monster2Pic;
var numMonsters = 3;

var Monster = function (x, y, xdir, ydir, type) {
    this.x = x;
    this.y = y;

    this.xdir = xdir;
    this.ydir = ydir;

    this.type = type;

    this.size = 60;
    this.drawWidth = 70;
    this.drawHeight = 108;
    this.midWidth = this.drawWidth / 2;
    this.midHeight = this.drawHeight / 2;

    this.angle = 180 + (Math.atan2(-xdir, ydir)/(Math.PI/180));

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

        if (monster.type == 0) {
            ctx.drawImage(monster0Pic, -monster.midWidth, -monster.midHeight,
                          monster.drawWidth, monster.drawHeight);
        } else if (monster.type == 1) {
            ctx.drawImage(monster1Pic, -monster.midWidth, -monster.midHeight,
                          monster.drawWidth, monster.drawHeight);
        } else if (monster.type == 2) {
            ctx.drawImage(monster2Pic, -monster.midWidth, -monster.midHeight,
                          monster.drawWidth, monster.drawHeight);
        }

        // return to old coorginate system
        ctx.restore();
    }
}
