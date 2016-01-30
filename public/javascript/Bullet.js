var bulletPic;

var Bullet = function (owner, xPos, yPos, angle) {
    this.x = xPos;
    this.y = yPos;
    this.angle = angle;

    // mark bullet to be deleted
    this.kill = false;

    this.size = 5

    this.owner = owner;
};

drawBullet = function(ctx, bullet) {
    ctx.fillStyle = "#FF0000";
    ctx.drawImage(bulletPic, bullet.x, bullet.y, bullet.size, bullet.size);
}

