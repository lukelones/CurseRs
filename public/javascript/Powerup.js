var tripShotUpPic, shieldUpPic, healthUpPic;

const TRIPSHOT = 0;
const SHIELD = 1;
const HEALTH = 2;

var Powerup = function (xPos, yPos, type) {
    this.x = xPos;
    this.y = yPos;

   this.type = type;

    // mark powerup to be deleted
    this.kill = false;

    this.size = 30;
};

drawPowerup = function(ctx, powerup) {
    if (powerup.type == TRIPSHOT) {
        ctx.drawImage(tripShotUpPic,
                      powerup.x, powerup.y, powerup.size, powerup.size);
    } else if (powerup.type == SHIELD) {
        ctx.drawImage(shieldUpPic,
                      powerup.x, powerup.y, powerup.size, powerup.size);
    } else if (powerup.type == HEALTH) {
        ctx.drawImage(healthUpPic,
                      powerup.x, powerup.y, powerup.size, powerup.size);
    } else {
        console.log('invalid powerup type: ' + powerup.type);
    }
}

