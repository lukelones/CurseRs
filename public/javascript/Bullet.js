
var Bullet = function (xPos, yPos, angle) {
    this.x = xPos;
    this.y = yPos;
    this.angle = angle;

    // mark bullet to be deleted
    this.kill = false;

    this.width = 5;
    this.height = 5;
};

drawBullet = function(ctx, bullet) {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

exports.Bullet = Bullet;
exports.drawBullet = drawBullet;
