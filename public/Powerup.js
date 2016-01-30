var powerupPic;

var Powerup = function (xPos, yPos) {
    this.x = xPos;
    this.y = yPos;
   

    // mark powerup to be deleted
    this.kill = false;

    this.size = 20
};

drawPowerup = function(ctx, powerup) {
    ctx.drawImage(bulletPic, powerup.x, powerup.y, powerup.size, powerup.size);
}

